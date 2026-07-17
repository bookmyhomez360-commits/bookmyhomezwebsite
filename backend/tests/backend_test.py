"""BookMyHomez backend integration tests.

Covers: auth (register, login, /auth/me, logout), property CRUD, ownership
enforcement, media upload/download, and enquiry->lead flow.
"""
import io
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fallback to reading /app/frontend/.env
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL"):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                    break
    except Exception:
        pass

assert BASE_URL, "REACT_APP_BACKEND_URL not set"
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "bookmyhomez360@gmail.com"
ADMIN_PASSWORD = "BmhAdmin@2025"


# ---------------- fixtures ----------------
@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert data.get("role") == "admin", f"Expected admin role, got {data}"
    # Also apply bearer for extra safety
    s.headers.update({"Authorization": f"Bearer {data['token']}"})
    s.admin_data = data
    return s


@pytest.fixture(scope="module")
def agent_a():
    """Register a fresh agent (Agent A)."""
    s = requests.Session()
    email = f"agenta_{uuid.uuid4().hex[:8]}@test.com"
    r = s.post(f"{API}/auth/register", json={
        "name": "Agent A", "email": email, "password": "test1234"
    })
    assert r.status_code == 200, f"Register A failed: {r.status_code} {r.text}"
    data = r.json()
    s.headers.update({"Authorization": f"Bearer {data['token']}"})
    s.user_data = data
    s.email = email
    return s


@pytest.fixture(scope="module")
def agent_b():
    """Register a second agent (Agent B) for ownership tests."""
    s = requests.Session()
    email = f"agentb_{uuid.uuid4().hex[:8]}@test.com"
    r = s.post(f"{API}/auth/register", json={
        "name": "Agent B", "email": email, "password": "test1234"
    })
    assert r.status_code == 200, f"Register B failed: {r.status_code} {r.text}"
    data = r.json()
    s.headers.update({"Authorization": f"Bearer {data['token']}"})
    s.user_data = data
    s.email = email
    return s


# ---------------- health ----------------
class TestHealth:
    def test_stats(self):
        r = requests.get(f"{API}/stats")
        assert r.status_code == 200
        d = r.json()
        assert "properties" in d and d["properties"] > 0
        assert "cities" in d and "agents" in d

    def test_cities(self):
        r = requests.get(f"{API}/cities")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_categories(self):
        r = requests.get(f"{API}/categories")
        assert r.status_code == 200
        cats = r.json()
        assert len(cats) >= 4

    def test_properties_list(self):
        r = requests.get(f"{API}/properties?limit=5")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---------------- auth ----------------
class TestAuth:
    def test_admin_login(self, admin_session):
        r = admin_session.get(f"{API}/auth/me")
        assert r.status_code == 200
        me = r.json()
        assert me["email"] == ADMIN_EMAIL
        assert me["role"] == "admin"

    def test_agent_register_and_me(self, agent_a):
        r = agent_a.get(f"{API}/auth/me")
        assert r.status_code == 200
        me = r.json()
        assert me["email"] == agent_a.email
        assert me["role"] == "agent"

    def test_register_duplicate_email(self, agent_a):
        # Try registering same email again
        r = requests.post(f"{API}/auth/register", json={
            "name": "Dup", "email": agent_a.email, "password": "x"
        })
        assert r.status_code == 400

    def test_login_invalid_password(self):
        r = requests.post(f"{API}/auth/login", json={
            "email": ADMIN_EMAIL, "password": "wrong_password_xxx"
        })
        assert r.status_code == 401

    def test_me_unauthenticated(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_logout(self):
        # Register a throwaway user, verify logout clears session
        s = requests.Session()
        email = f"logout_{uuid.uuid4().hex[:8]}@test.com"
        r = s.post(f"{API}/auth/register", json={"name": "L", "email": email, "password": "test1234"})
        assert r.status_code == 200
        # Verify /auth/me works with cookie
        r = s.get(f"{API}/auth/me")
        assert r.status_code == 200
        # Logout (via cookie)
        r = s.post(f"{API}/auth/logout")
        assert r.status_code == 200
        # After logout, cookies cleared → /auth/me should be 401 (no bearer either)
        r2 = requests.get(f"{API}/auth/me", cookies=s.cookies)
        assert r2.status_code == 401


# ---------------- property CRUD & ownership ----------------
class TestPropertyCRUD:
    prop_id_a = None
    prop_id_b = None

    def test_create_property_agent_a(self, agent_a):
        payload = {
            "title": "TEST_Villa_A",
            "type": "buy",
            "category": "homes-to-buy",
            "city": "mumbai",
            "price": 5000000,
            "bedrooms": 3,
            "bathrooms": 2,
            "area_sqft": 1500,
            "description": "Test villa by agent A",
            "images": [],
        }
        r = agent_a.post(f"{API}/properties", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["title"] == "TEST_Villa_A"
        assert d["owner_id"] == agent_a.user_data["user_id"]
        assert d["price_unit"] == "total"
        assert "id" in d
        TestPropertyCRUD.prop_id_a = d["id"]

    def test_create_property_agent_b(self, agent_b):
        payload = {
            "title": "TEST_Apt_B", "type": "rent", "category": "rentals",
            "city": "pune", "price": 30000, "bedrooms": 2,
        }
        r = agent_b.post(f"{API}/properties", json=payload)
        assert r.status_code == 200
        d = r.json()
        assert d["owner_id"] == agent_b.user_data["user_id"]
        assert d["price_unit"] == "month"
        TestPropertyCRUD.prop_id_b = d["id"]

    def test_my_properties_isolated(self, agent_a, agent_b):
        r = agent_a.get(f"{API}/my/properties")
        assert r.status_code == 200
        my = r.json()
        ids = [p["id"] for p in my]
        assert TestPropertyCRUD.prop_id_a in ids
        assert TestPropertyCRUD.prop_id_b not in ids

        r = agent_b.get(f"{API}/my/properties")
        assert r.status_code == 200
        my = r.json()
        ids = [p["id"] for p in my]
        assert TestPropertyCRUD.prop_id_b in ids
        assert TestPropertyCRUD.prop_id_a not in ids

    def test_admin_sees_all_in_my_properties(self, admin_session):
        r = admin_session.get(f"{API}/my/properties")
        assert r.status_code == 200
        my = r.json()
        ids = [p["id"] for p in my]
        assert TestPropertyCRUD.prop_id_a in ids
        assert TestPropertyCRUD.prop_id_b in ids

    def test_agent_cannot_edit_others(self, agent_a):
        payload = {
            "title": "HACKED", "type": "buy", "category": "homes-to-buy",
            "city": "mumbai", "price": 1,
        }
        r = agent_a.put(f"{API}/properties/{TestPropertyCRUD.prop_id_b}", json=payload)
        assert r.status_code == 403

    def test_agent_cannot_delete_others(self, agent_a):
        r = agent_a.delete(f"{API}/properties/{TestPropertyCRUD.prop_id_b}")
        assert r.status_code == 403

    def test_owner_can_update_own(self, agent_a):
        payload = {
            "title": "TEST_Villa_A_Updated", "type": "buy", "category": "homes-to-buy",
            "city": "mumbai", "price": 6000000, "bedrooms": 4,
        }
        r = agent_a.put(f"{API}/properties/{TestPropertyCRUD.prop_id_a}", json=payload)
        assert r.status_code == 200
        d = r.json()
        assert d["title"] == "TEST_Villa_A_Updated"
        assert d["price"] == 6000000
        # verify persistence via GET
        r2 = requests.get(f"{API}/properties/{TestPropertyCRUD.prop_id_a}")
        assert r2.status_code == 200
        assert r2.json()["title"] == "TEST_Villa_A_Updated"

    def test_admin_can_edit_any(self, admin_session):
        payload = {
            "title": "TEST_Apt_B_AdminEdited", "type": "rent", "category": "rentals",
            "city": "pune", "price": 35000, "bedrooms": 2,
        }
        r = admin_session.put(f"{API}/properties/{TestPropertyCRUD.prop_id_b}", json=payload)
        assert r.status_code == 200
        assert r.json()["title"] == "TEST_Apt_B_AdminEdited"

    def test_property_unauth_create_rejected(self):
        r = requests.post(f"{API}/properties", json={
            "title": "x", "type": "buy", "category": "homes-to-buy", "city": "mumbai"
        })
        assert r.status_code == 401


# ---------------- media upload ----------------
class TestMedia:
    def test_media_upload_and_fetch(self, agent_a):
        # Create a tiny PNG-like content
        content = b"\x89PNG\r\n\x1a\n" + b"0" * 100
        files = {"file": ("test.png", io.BytesIO(content), "image/png")}
        # requests will strip Authorization if we pass session; we want to use session
        r = agent_a.post(f"{API}/media", files=files)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "id" in d and "url" in d
        # fetch back
        r2 = requests.get(f"{BASE_URL}{d['url']}")
        assert r2.status_code == 200
        assert r2.content == content

    def test_media_upload_unauth(self):
        files = {"file": ("test.png", io.BytesIO(b"abc"), "image/png")}
        r = requests.post(f"{API}/media", files=files)
        assert r.status_code == 401

    def test_media_not_found(self):
        # invalid ObjectId should 404
        r = requests.get(f"{API}/media/000000000000000000000000")
        assert r.status_code == 404


# ---------------- enquiry / lead ----------------
class TestEnquiryLead:
    lead_property_id = None

    def test_setup_property(self, agent_a):
        payload = {
            "title": "TEST_Lead_Property", "type": "buy",
            "category": "homes-to-buy", "city": "jaipur", "price": 3000000,
        }
        r = agent_a.post(f"{API}/properties", json=payload)
        assert r.status_code == 200
        TestEnquiryLead.lead_property_id = r.json()["id"]

    def test_submit_enquiry_anonymous(self):
        r = requests.post(
            f"{API}/properties/{TestEnquiryLead.lead_property_id}/enquiry",
            json={"name": "Buyer Bob", "phone": "9999999999", "message": "Interested"}
        )
        assert r.status_code == 200
        assert r.json()["status"] == "success"

    def test_owner_sees_lead(self, agent_a):
        r = agent_a.get(f"{API}/my/leads")
        assert r.status_code == 200
        leads = r.json()
        names = [l["name"] for l in leads if l["property_id"] == TestEnquiryLead.lead_property_id]
        assert "Buyer Bob" in names

    def test_other_agent_does_not_see_lead(self, agent_b):
        r = agent_b.get(f"{API}/my/leads")
        assert r.status_code == 200
        leads = r.json()
        for l in leads:
            assert l.get("property_id") != TestEnquiryLead.lead_property_id, \
                "Agent B should NOT see agent A's leads"

    def test_admin_sees_all_leads(self, admin_session):
        r = admin_session.get(f"{API}/my/leads")
        assert r.status_code == 200
        leads = r.json()
        found = any(
            l.get("property_id") == TestEnquiryLead.lead_property_id and l["name"] == "Buyer Bob"
            for l in leads
        )
        assert found

    def test_enquiry_invalid_property(self):
        r = requests.post(
            f"{API}/properties/does-not-exist/enquiry",
            json={"name": "x", "phone": "y", "message": ""}
        )
        assert r.status_code == 404


# ---------------- AI search ----------------
class TestAiSearch:
    def test_ai_search_basic(self):
        r = requests.post(f"{API}/ai-search", json={"query": "2bhk apartment in Mumbai for rent"}, timeout=45)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "reply" in d and "properties" in d
        assert isinstance(d["properties"], list)


# ---------------- cleanup ----------------
def test_zzz_cleanup(admin_session):
    """Delete all TEST_ prefixed properties (uses admin)."""
    r = admin_session.get(f"{API}/my/properties")
    assert r.status_code == 200
    for p in r.json():
        if str(p.get("title", "")).startswith("TEST_"):
            admin_session.delete(f"{API}/properties/{p['id']}")
