"""Authentication utilities: JWT email/password + Emergent Google session, unified."""
import os
import uuid
import bcrypt
import jwt
import httpx
from datetime import datetime, timezone, timedelta
from fastapi import Request, HTTPException

JWT_ALGORITHM = "HS256"
GOOGLE_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def role_for_email(email: str) -> str:
    admin_email = os.environ.get("ADMIN_EMAIL", "").strip().lower()
    return "admin" if email.strip().lower() == admin_email else "agent"


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def new_user_id() -> str:
    return f"user_{uuid.uuid4().hex[:12]}"


async def fetch_google_session(session_id: str) -> dict:
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(GOOGLE_SESSION_URL, headers={"X-Session-ID": session_id})
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid Google session")
        return resp.json()


def _clean_user(user: dict) -> dict:
    user.pop("_id", None)
    user.pop("password_hash", None)
    return user


async def resolve_user(request: Request, db) -> dict:
    """Return the current user from JWT access_token or Emergent session_token."""
    # 1) JWT access_token cookie
    token = request.cookies.get("access_token")
    session_token = request.cookies.get("session_token")

    # Authorization header fallback (may be JWT or session token)
    bearer = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        bearer = auth_header[7:]

    # Try JWT first (cookie, then bearer)
    for candidate in [token, bearer]:
        if not candidate:
            continue
        try:
            payload = jwt.decode(candidate, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
            if payload.get("type") == "access":
                user = await db.users.find_one({"user_id": payload["sub"]}, {"_id": 0})
                if user:
                    return _clean_user(user)
        except jwt.InvalidTokenError:
            pass

    # Try Emergent session token (cookie, then bearer)
    for candidate in [session_token, bearer]:
        if not candidate:
            continue
        sess = await db.user_sessions.find_one({"session_token": candidate})
        if not sess:
            continue
        expires_at = sess.get("expires_at")
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at and expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at and expires_at < datetime.now(timezone.utc):
            continue
        user = await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0})
        if user:
            return _clean_user(user)

    return None


async def seed_admin(db):
    admin_email = os.environ.get("ADMIN_EMAIL", "").strip().lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "")
    if not admin_email or not admin_password:
        return
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "user_id": new_user_id(),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "BookMyHomez Admin",
            "role": "admin",
            "picture": "",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    else:
        updates = {"role": "admin"}
        if not existing.get("password_hash") or not verify_password(admin_password, existing["password_hash"]):
            updates["password_hash"] = hash_password(admin_password)
        await db.users.update_one({"email": admin_email}, {"$set": updates})


def set_auth_cookie(response, token: str, key: str = "access_token", days: int = 7):
    response.set_cookie(
        key=key,
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=days * 24 * 3600,
        path="/",
    )
