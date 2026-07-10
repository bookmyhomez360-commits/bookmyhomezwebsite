from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import asyncio
import json
import logging
import uuid
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from seed_data import CITIES, PROPERTIES, AGENTS

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
OWNER_EMAIL = os.environ.get('OWNER_EMAIL', 'hello@bookmyhomez.com')

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ----------------------------- Models -----------------------------
def now_iso():
    return datetime.now(timezone.utc).isoformat()


class ListingCreate(BaseModel):
    owner_name: str
    phone: str
    email: Optional[str] = None
    property_title: str
    listing_type: str  # buy | rent | shortstay
    category: str
    city: str
    price: Optional[float] = None
    bedrooms: Optional[int] = 0
    bathrooms: Optional[int] = 0
    area_sqft: Optional[float] = 0
    description: Optional[str] = ""
    images: List[str] = Field(default_factory=list)  # base64 data URLs


class AiSearchRequest(BaseModel):
    query: str


# ----------------------------- Helpers -----------------------------
async def ensure_seed():
    count = await db.properties.count_documents({})
    if count == 0:
        docs = []
        for p in PROPERTIES:
            doc = dict(p)
            doc["id"] = str(uuid.uuid4())
            doc["created_at"] = now_iso()
            doc["source"] = "seed"
            docs.append(doc)
        await db.properties.insert_many(docs)
        logger.info("Seeded %d properties", len(docs))
    if await db.cities.count_documents({}) == 0:
        await db.cities.insert_many([dict(c) for c in CITIES])
        logger.info("Seeded cities")
    if await db.agents.count_documents({}) == 0:
        agents = []
        for a in AGENTS:
            doc = dict(a)
            doc["id"] = str(uuid.uuid4())
            agents.append(doc)
        await db.agents.insert_many(agents)
        logger.info("Seeded agents")


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


# ----------------------------- Routes -----------------------------
@api_router.get("/")
async def root():
    return {"message": "BookMyHomez API"}


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
        "buy": await db.properties.count_documents({"type": "buy"}),
        "rent": await db.properties.count_documents({"type": "rent"}),
        "shortstay": await db.properties.count_documents({"type": "shortstay"}),
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
    props = await db.properties.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return props


@api_router.get("/agents")
async def get_agents(city: Optional[str] = None):
    query = {"city": city} if city else {}
    return await db.agents.find(query, {"_id": 0}).to_list(100)


@api_router.get("/properties/{property_id}")
async def get_property(property_id: str):
    prop = await db.properties.find_one({"id": property_id}, {"_id": 0})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop


@api_router.post("/listings")
async def create_listing(listing: ListingCreate):
    doc = listing.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_iso()
    doc["status"] = "pending"
    prop = {
        "id": doc["id"],
        "title": doc["property_title"],
        "type": doc["listing_type"],
        "category": doc["category"],
        "city": doc["city"],
        "price": doc.get("price") or 0,
        "price_unit": "month" if doc["listing_type"] == "rent" else ("night" if doc["listing_type"] == "shortstay" else "total"),
        "bedrooms": doc.get("bedrooms") or 0,
        "bathrooms": doc.get("bathrooms") or 0,
        "area_sqft": doc.get("area_sqft") or 0,
        "description": doc.get("description") or "",
        "images": doc.get("images") or [],
        "featured": False,
        "created_at": doc["created_at"],
        "source": "user",
        "owner_name": doc["owner_name"],
        "owner_phone": doc["phone"],
    }
    await db.listings.insert_one(dict(doc))
    await db.properties.insert_one(prop)
    email_sent = await send_owner_notification(doc)
    return {"status": "success", "id": doc["id"], "email_sent": email_sent}


async def send_owner_notification(doc):
    if not RESEND_API_KEY:
        logger.info("RESEND_API_KEY not set - skipping email notification")
        return False
    try:
        import resend
        resend.api_key = RESEND_API_KEY
        html = f"""
        <div style="font-family:Arial,sans-serif;color:#0f172a">
          <h2 style="color:#4f46e5">New Property Listing - BookMyHomez</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:6px 0"><b>Owner</b></td><td>{doc['owner_name']}</td></tr>
            <tr><td style="padding:6px 0"><b>Phone</b></td><td>{doc['phone']}</td></tr>
            <tr><td style="padding:6px 0"><b>Email</b></td><td>{doc.get('email','-')}</td></tr>
            <tr><td style="padding:6px 0"><b>Property</b></td><td>{doc['property_title']}</td></tr>
            <tr><td style="padding:6px 0"><b>Type</b></td><td>{doc['listing_type']} / {doc['category']}</td></tr>
            <tr><td style="padding:6px 0"><b>City</b></td><td>{doc['city']}</td></tr>
            <tr><td style="padding:6px 0"><b>Price</b></td><td>{doc.get('price','-')}</td></tr>
            <tr><td style="padding:6px 0"><b>Description</b></td><td>{doc.get('description','-')}</td></tr>
          </table>
        </div>
        """
        params = {"from": SENDER_EMAIL, "to": [OWNER_EMAIL],
                  "subject": f"New Listing: {doc['property_title']}", "html": html}
        await asyncio.to_thread(resend.Emails.send, params)
        return True
    except Exception as e:
        logger.error("Email send failed: %s", str(e))
        return False


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
    # keyword search is only used when no structural filter is present, to avoid
    # over-constraining results (e.g. generic terms like "apartment")
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


async def parse_query_with_llm(query):
    from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone
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
    chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=str(uuid.uuid4()),
                   system_message=system).with_model("openai", "gpt-5.4")
    full = ""
    async for ev in chat.stream_message(UserMessage(text=query)):
        if isinstance(ev, TextDelta):
            full += ev.content
        elif isinstance(ev, StreamDone):
            break
    full = full.strip()
    if full.startswith("```"):
        full = full.split("```")[1]
        if full.startswith("json"):
            full = full[4:]
    data = json.loads(full)
    reply = data.pop("reply", "Here are some homes that match your search.")
    filters = {k: v for k, v in data.items() if v is not None}
    return filters, reply


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_seed():
    await ensure_seed()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
