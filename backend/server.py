from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File
from fastapi.responses import Response as FastAPIResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from bson import ObjectId
import os
import asyncio
import json
import logging
import uuid
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from seed_data import CITIES, PROPERTIES, AGENTS
import auth as auth_utils

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
bucket = AsyncIOMotorGridFSBucket(db)

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
OWNER_EMAIL = os.environ.get('OWNER_EMAIL', 'hello@bookmyhomez.com')

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def now_iso():
    return datetime.now(timezone.utc).isoformat()


# ----------------------------- Models -----------------------------
class RegisterReq(BaseModel):
    name: str
    email: str
    password: str


class LoginReq(BaseModel):
    email: str
    password: str


class GoogleSessionReq(BaseModel):
    session_id: str


class PropertyIn(BaseModel):
    title: str
    type: str
    category: str
    city: str
    price: Optional[float] = None
    bedrooms: Optional[int] = 0
    bathrooms: Optional[int] = 0
    area_sqft: Optional[float] = 0
    description: Optional[str] = ""
    images: List[str] = Field(default_factory=list)
    video: Optional[str] = None
    # rich wizard fields (all optional, stored as-is)
    location: Optional[str] = None
    transaction_type: Optional[str] = None
    prop_category: Optional[str] = None
    property_type: Optional[str] = None
    currency: Optional[str] = "INR"
    security_deposit: Optional[float] = None
    availability: Optional[str] = None
    available_date: Optional[str] = None
    facing: Optional[str] = None
    furnishing: Optional[str] = None
    total_units: Optional[int] = None
    total_floors: Optional[int] = None
    super_area: Optional[float] = None
    area_unit: Optional[str] = "sqft"
    overview: Optional[str] = None
    cover_index: Optional[int] = 0


class EnquiryReq(BaseModel):
    name: str
    phone: str
    message: Optional[str] = ""


class AiSearchRequest(BaseModel):
    query: str


# ----------------------------- Auth deps -----------------------------
async def require_auth(request: Request):
    user = await auth_utils.resolve_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


async def require_admin(request: Request):
    user = await require_auth(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user


# ----------------------------- Seed -----------------------------
async def ensure_seed():
    if await db.properties.count_documents({}) == 0:
        docs = []
        for p in PROPERTIES:
            doc = dict(p)
            doc["id"] = str(uuid.uuid4())
            doc["created_at"] = now_iso()
            doc["source"] = "seed"
            doc["owner_id"] = None
            doc["video"] = None
            docs.append(doc)
        await db.properties.insert_many(docs)
        logger.info("Seeded %d properties", len(docs))
    if await db.cities.count_documents({}) == 0:
        await db.cities.insert_many([dict(c) for c in CITIES])
    if await db.agents.count_documents({}) == 0:
        agents = []
        for a in AGENTS:
            doc = dict(a)
            doc["id"] = str(uuid.uuid4())
            agents.append(doc)
        await db.agents.insert_many(agents)


def build_query(type=None, city=None, category=None, min_price=None,
                max_price=None, bedrooms=None, q=None, featured=None):
    query = {}
    if type:
        query["type"] = type
    if city:
        query["city"] = city
    if category:
        query["category"] = category
    if bedrooms:
        query["bedrooms"] = {"$gte": int(bedrooms)}
    if featured is not None:
        query["featured"] = featured
    price_q = {}
    if min_price is not None:
        price_q["$gte"] = float(min_price)
    if max_price is not None:
        price_q["$lte"] = float(max_price)
    if price_q:
        query["price"] = price_q
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"city": {"$regex": q, "$options": "i"}},
        ]
    return query


def _price_unit(ptype):
    return "month" if ptype == "rent" else ("night" if ptype == "shortstay" else "total")


# ----------------------------- Auth routes -----------------------------
@api_router.post("/auth/register")
async def register(req: RegisterReq, response: Response):
    email = req.email.strip().lower()
    if not email or not req.password:
        raise HTTPException(status_code=400, detail="Email and password required")
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = auth_utils.new_user_id()
    user = {
        "user_id": user_id,
        "email": email,
        "password_hash": auth_utils.hash_password(req.password),
        "name": req.name.strip() or email.split("@")[0],
        "role": auth_utils.role_for_email(email),
        "picture": "",
        "created_at": now_iso(),
    }
    await db.users.insert_one(user)
    token = auth_utils.create_access_token(user_id, email)
    auth_utils.set_auth_cookie(response, token)
    return {"user_id": user_id, "email": email, "name": user["name"], "role": user["role"], "picture": "", "token": token}


@api_router.post("/auth/login")
async def login(req: LoginReq, response: Response):
    email = req.email.strip().lower()
    user = await db.users.find_one({"email": email})
    if not user or not user.get("password_hash") or not auth_utils.verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = auth_utils.create_access_token(user["user_id"], email)
    auth_utils.set_auth_cookie(response, token)
    return {"user_id": user["user_id"], "email": email, "name": user.get("name"), "role": user.get("role"), "picture": user.get("picture", ""), "token": token}


@api_router.post("/auth/google/session")
async def google_session(req: GoogleSessionReq, response: Response):
    data = await auth_utils.fetch_google_session(req.session_id)
    email = data["email"].strip().lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one({"email": email}, {"$set": {
            "name": data.get("name", existing.get("name")),
            "picture": data.get("picture", existing.get("picture", "")),
        }})
        role = existing.get("role") or auth_utils.role_for_email(email)
    else:
        user_id = auth_utils.new_user_id()
        role = auth_utils.role_for_email(email)
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": data.get("name", email.split("@")[0]),
            "picture": data.get("picture", ""),
            "role": role,
            "created_at": now_iso(),
        })
    session_token = data["session_token"]
    await db.user_sessions.update_one(
        {"session_token": session_token},
        {"$set": {
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "created_at": now_iso(),
        }},
        upsert=True,
    )
    auth_utils.set_auth_cookie(response, session_token, key="session_token")
    return {"user_id": user_id, "email": email, "name": data.get("name"), "role": role, "picture": data.get("picture", "")}


@api_router.get("/auth/me")
async def me(user=Depends(require_auth)):
    return user


@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    st = request.cookies.get("session_token")
    if st:
        await db.user_sessions.delete_one({"session_token": st})
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("session_token", path="/")
    return {"status": "ok"}


# ----------------------------- Media (GridFS) -----------------------------
@api_router.post("/media")
async def upload_media(file: UploadFile = File(...), user=Depends(require_auth)):
    data = await file.read()
    max_mb = 60
    if len(data) > max_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File exceeds {max_mb}MB")
    file_id = await bucket.upload_from_stream(
        file.filename or "upload",
        data,
        metadata={"content_type": file.content_type, "owner": user["user_id"]},
    )
    return {"id": str(file_id), "url": f"/api/media/{file_id}", "content_type": file.content_type}


@api_router.get("/media/{file_id}")
async def get_media(file_id: str):
    try:
        stream = await bucket.open_download_stream(ObjectId(file_id))
    except Exception:
        raise HTTPException(status_code=404, detail="File not found")
    data = await stream.read()
    ct = (stream.metadata or {}).get("content_type") or "application/octet-stream"
    return FastAPIResponse(content=data, media_type=ct)


# ----------------------------- Public data -----------------------------
@api_router.get("/cities")
async def get_cities():
    cities = await db.cities.find({}, {"_id": 0}).to_list(100)
    for c in cities:
        c["count"] = await db.properties.count_documents({"city": c["slug"]})
    return cities


@api_router.get("/stats")
async def get_stats():
    return {
        "properties": await db.properties.count_documents({}),
        "cities": await db.cities.count_documents({}),
        "agents": await db.agents.count_documents({}),
    }


@api_router.get("/categories")
async def get_categories():
    cats = [
        {"slug": "homes-to-buy", "name": "Homes to Buy", "type": "buy"},
        {"slug": "rentals", "name": "Rentals", "type": "rent"},
        {"slug": "short-stays", "name": "Short Stays", "type": "shortstay"},
        {"slug": "land-plots", "name": "Land & Plots", "type": "buy"},
    ]
    for c in cats:
        c["count"] = await db.properties.count_documents({"category": c["slug"]})
    return cats


@api_router.get("/properties")
async def get_properties(type: Optional[str] = None, city: Optional[str] = None,
                         category: Optional[str] = None, min_price: Optional[float] = None,
                         max_price: Optional[float] = None, bedrooms: Optional[int] = None,
                         q: Optional[str] = None, featured: Optional[bool] = None,
                         limit: int = 60):
    query = build_query(type, city, category, min_price, max_price, bedrooms, q, featured)
    return await db.properties.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)


@api_router.get("/agents")
async def get_agents(city: Optional[str] = None):
    query = {"city": city} if city else {}
    return await db.agents.find(query, {"_id": 0}).to_list(100)


# ----------------------------- My / Admin listings -----------------------------
@api_router.get("/my/properties")
async def my_properties(user=Depends(require_auth)):
    if user.get("role") == "admin":
        return await db.properties.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return await db.properties.find({"owner_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)


@api_router.get("/my/leads")
async def my_leads(user=Depends(require_auth)):
    query = {} if user.get("role") == "admin" else {"owner_id": user["user_id"]}
    return await db.leads.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)


@api_router.get("/properties/{property_id}")
async def get_property(property_id: str):
    prop = await db.properties.find_one({"id": property_id}, {"_id": 0})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop


@api_router.post("/properties")
async def create_property(prop: PropertyIn, user=Depends(require_auth)):
    doc = prop.model_dump()
    doc.update({
        "id": str(uuid.uuid4()),
        "price_unit": _price_unit(prop.type),
        "price": prop.price or 0,
        "featured": False,
        "created_at": now_iso(),
        "source": "user",
        "owner_id": user["user_id"],
        "owner_name": user.get("name"),
        "owner_role": user.get("role"),
    })
    await db.properties.insert_one(dict(doc))
    doc.pop("_id", None)
    await notify_owner_new_listing(doc, user)
    return doc


@api_router.put("/properties/{property_id}")
async def update_property(property_id: str, prop: PropertyIn, user=Depends(require_auth)):
    existing = await db.properties.find_one({"id": property_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Property not found")
    if user.get("role") != "admin" and existing.get("owner_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="You can only edit your own listings")
    updates = prop.model_dump()
    updates["price_unit"] = _price_unit(prop.type)
    updates["price"] = prop.price or 0
    await db.properties.update_one({"id": property_id}, {"$set": updates})
    return await db.properties.find_one({"id": property_id}, {"_id": 0})


@api_router.delete("/properties/{property_id}")
async def delete_property(property_id: str, user=Depends(require_auth)):
    existing = await db.properties.find_one({"id": property_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Property not found")
    if user.get("role") != "admin" and existing.get("owner_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="You can only delete your own listings")
    await db.properties.delete_one({"id": property_id})
    return {"status": "deleted"}


@api_router.post("/properties/{property_id}/enquiry")
async def create_enquiry(property_id: str, enq: EnquiryReq):
    prop = await db.properties.find_one({"id": property_id}, {"_id": 0})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    lead = {
        "id": str(uuid.uuid4()),
        "property_id": property_id,
        "property_title": prop.get("title"),
        "owner_id": prop.get("owner_id"),
        "name": enq.name,
        "phone": enq.phone,
        "message": enq.message,
        "created_at": now_iso(),
    }
    await db.leads.insert_one(dict(lead))
    return {"status": "success"}


# ----------------------------- Email -----------------------------
async def notify_owner_new_listing(doc, user):
    if not RESEND_API_KEY:
        logger.info("RESEND_API_KEY not set - skipping email notification")
        return False
    try:
        import resend
        resend.api_key = RESEND_API_KEY
        html = f"<h2>New Listing: {doc['title']}</h2><p>By {user.get('name')} ({user.get('email')})</p><p>{doc['city']} · {doc['type']} · {doc.get('price')}</p>"
        await asyncio.to_thread(resend.Emails.send, {
            "from": SENDER_EMAIL, "to": [OWNER_EMAIL],
            "subject": f"New Listing: {doc['title']}", "html": html})
        return True
    except Exception as e:
        logger.error("Email failed: %s", e)
        return False


# ----------------------------- AI search -----------------------------
@api_router.post("/ai-search")
async def ai_search(req: AiSearchRequest):
    filters = {}
    reply = "Here are some homes that match your search."
    if EMERGENT_LLM_KEY:
        try:
            filters, reply = await parse_query_with_llm(req.query)
        except Exception as e:
            logger.error("AI parse failed: %s", str(e))
    filters = {**keyword_parse(req.query), **{k: v for k, v in filters.items() if v}}
    has_structural = any(filters.get(k) for k in ("type", "city", "category"))
    keyword = None if has_structural else filters.get("keyword")
    query = build_query(
        type=filters.get("type"), city=filters.get("city"),
        category=filters.get("category"), min_price=filters.get("min_price"),
        max_price=filters.get("max_price"), bedrooms=filters.get("bedrooms"),
        q=keyword,
    )
    props = await db.properties.find(query, {"_id": 0}).sort("created_at", -1).to_list(30)
    return {"reply": reply, "filters": filters, "count": len(props), "properties": props}


def keyword_parse(text):
    t = text.lower()
    f = {}
    if any(w in t for w in ["buy", "purchase", "own"]):
        f["type"] = "buy"
    elif any(w in t for w in ["rent", "lease"]):
        f["type"] = "rent"
    elif any(w in t for w in ["short stay", "stay", "vacation", "weekend"]):
        f["type"] = "shortstay"
    for c in ["mumbai", "bengaluru", "bangalore", "pune", "jaipur"]:
        if c in t:
            f["city"] = "bengaluru" if c == "bangalore" else c
    if "land" in t or "plot" in t:
        f["category"] = "land-plots"
    return f


async def parse_query_with_llm(query: str):
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    system = (
        "You are the search assistant for BookMyHomez, an Indian real estate portal. "
        "Convert the user's natural-language request into JSON filters. "
        "Return ONLY a JSON object with keys: type (one of buy|rent|shortstay or null), "
        "city (one of mumbai|bengaluru|pune|jaipur or null), "
        "category (one of homes-to-buy|rentals|short-stays|land-plots or null), "
        "min_price (number or null), max_price (number or null), bedrooms (integer or null), "
        "keyword (string or null), reply (a short friendly one-line response to the user). "
        "Prices are in Indian Rupees. Do not include any text outside the JSON."
    )
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": query}
        ]
    )
    full = response.choices[0].message.content.strip()
    if full.startswith("```"):
        full = full.split("```")[1]
        if full.startswith("json"):
            full = full[4:]
    data = json.loads(full)
    reply = data.pop("reply", "Here are some homes that match your search.")
    filters = {k: v for k, v in data.items() if v is not None}
    return filters, reply


app.include_router(api_router)


@app.get("/health")
async def health():
    return {"status": "ok"}


app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await ensure_seed()
    await auth_utils.seed_admin(db)
    try:
        await db.users.create_index("email", unique=True)
        await db.users.create_index("user_id")
        await db.user_sessions.create_index("session_token")
        await db.properties.create_index("owner_id")
    except Exception as e:
        logger.error("Index creation: %s", e)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
