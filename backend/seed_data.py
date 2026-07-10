"""Seed data for BookMyHomez property portal."""

CITIES = [
    {
        "slug": "mumbai",
        "name": "Mumbai",
        "state": "Maharashtra",
        "image": "https://images.unsplash.com/photo-1569758267239-d08deb78bb1a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzV8MHwxfHNlYXJjaHwxfHxtdW1iYWklMjBza3lsaW5lJTIwZ2F0ZXdheXxlbnwwfHx8fDE3ODM2Nzc2OTV8MA&ixlib=rb-4.1.0&q=85",
    },
    {
        "slug": "bengaluru",
        "name": "Bengaluru",
        "state": "Karnataka",
        "image": "https://images.unsplash.com/photo-1764686630524-2d399d87fa2d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzJ8MHwxfHNlYXJjaHwxfHxiZW5nYWx1cnUlMjBjaXR5JTIwbW9kZXJuJTIwYnVpbGRpbmd8ZW58MHx8fHwxNzgzNjc3Njk1fDA&ixlib=rb-4.1.0&q=85",
    },
    {
        "slug": "pune",
        "name": "Pune",
        "state": "Maharashtra",
        "image": "https://images.pexels.com/photos/38296599/pexels-photo-38296599.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    },
    {
        "slug": "jaipur",
        "name": "Jaipur",
        "state": "Rajasthan",
        "image": "https://images.unsplash.com/photo-1631987398000-e627564b3847?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxqYWlwdXIlMjBoYXdhbWFoYWwlMjBhcmNoaXRlY3R1cmV8ZW58MHx8fHwxNzgzNjc3Njk1fDA&ixlib=rb-4.1.0&q=85",
    },
]

# image pools per category
IMG = {
    "homes-to-buy": [
        "https://images.unsplash.com/photo-1564078516393-cf04bd966897?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsaXZpbmclMjByb29tJTIwaW50ZXJpb3IlMjBsdXh1cnl8ZW58MHx8fHwxNzgzNjc3Njk1fDA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    ],
    "rentals": [
        "https://images.unsplash.com/photo-1719266084633-24981ecdc417?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcGFydG1lbnQlMjBiYWxjb255JTIwdmlld3xlbnwwfHx8fDE3ODM2Nzc2OTV8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    ],
    "short-stays": [
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwxfHxib3V0aXF1ZSUyMGhvdGVsJTIwcm9vbSUyMGx1eHVyeXxlbnwwfHx8fDE3ODM2Nzc2OTV8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
    ],
    "land-plots": [
        "https://images.unsplash.com/photo-1667344238075-c3742c5f86a1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxlbXB0eSUyMGxhbmQlMjBwbG90JTIwZ3JlZW4lMjBmaWVsZHxlbnwwfHx8fDE3ODM2Nzc2OTV8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    ],
}

# type: buy | rent | shortstay ; category maps to grid
def _p(title, ptype, category, city, price, price_unit, beds, baths, area, desc, imgs, featured=False):
    return {
        "title": title,
        "type": ptype,
        "category": category,
        "city": city,
        "price": price,
        "price_unit": price_unit,
        "bedrooms": beds,
        "bathrooms": baths,
        "area_sqft": area,
        "description": desc,
        "images": imgs,
        "featured": featured,
    }


PROPERTIES = [
    # Mumbai
    _p("Sea-Facing Sky Residence, Worli", "buy", "homes-to-buy", "mumbai", 85000000, "total", 4, 4, 3200,
       "A rare sea-facing 4BHK sky residence with floor-to-ceiling glass, private deck and skyline views over the Arabian Sea.", IMG["homes-to-buy"][:2], True),
    _p("Bandra Boutique 2BHK Rental", "rent", "rentals", "mumbai", 145000, "month", 2, 2, 1150,
       "Bright, fully-furnished 2BHK in the heart of Bandra West — walking distance to cafes, promenade and metro.", [IMG["rentals"][0], IMG["rentals"][1]], True),
    _p("Colaba Heritage Short Stay", "shortstay", "short-stays", "mumbai", 8500, "night", 1, 1, 650,
       "A design-led studio in a restored heritage building near Gateway of India. Perfect for weekend getaways.", [IMG["short-stays"][0]]),
    _p("Panvel Investment Plot", "buy", "land-plots", "mumbai", 12000000, "total", 0, 0, 2400,
       "RERA-approved residential plot in fast-appreciating Panvel corridor, close to the upcoming airport.", [IMG["land-plots"][0]]),
    _p("Powai Lakeview 3BHK", "buy", "homes-to-buy", "mumbai", 42000000, "total", 3, 3, 1850,
       "Elegant 3BHK overlooking Powai lake with resort-style amenities and lush landscaping.", [IMG["homes-to-buy"][2]]),

    # Bengaluru
    _p("Indiranagar Garden Villa", "buy", "homes-to-buy", "bengaluru", 65000000, "total", 4, 5, 3600,
       "A private garden villa in leafy Indiranagar with a double-height living room and rooftop terrace.", [IMG["homes-to-buy"][1], IMG["homes-to-buy"][0]], True),
    _p("Koramangala Tech-Pro 2BHK Rental", "rent", "rentals", "bengaluru", 55000, "month", 2, 2, 1250,
       "Modern semi-furnished 2BHK minutes from startup hubs, with high-speed connectivity and clubhouse.", [IMG["rentals"][2]]),
    _p("Whitefield Serviced Stay", "shortstay", "short-stays", "bengaluru", 6500, "night", 2, 2, 900,
       "Fully serviced apartment ideal for business travellers, close to ITPL and Whitefield tech parks.", [IMG["short-stays"][1]]),
    _p("Devanahalli Airport Plot", "buy", "land-plots", "bengaluru", 9500000, "total", 0, 0, 1800,
       "Premium plot near Bengaluru airport with clear title and gated-community infrastructure.", [IMG["land-plots"][1]]),

    # Pune
    _p("Koregaon Park Loft", "buy", "homes-to-buy", "pune", 38000000, "total", 3, 3, 2100,
       "An industrial-chic loft in Koregaon Park with exposed ceilings and a wrap-around balcony.", [IMG["homes-to-buy"][0]], True),
    _p("Baner Skyline 3BHK Rental", "rent", "rentals", "pune", 48000, "month", 3, 3, 1600,
       "Spacious 3BHK on a high floor in Baner with panoramic hill views and a modern modular kitchen.", [IMG["rentals"][1]]),
    _p("Viman Nagar Weekend Studio", "shortstay", "short-stays", "pune", 4500, "night", 1, 1, 520,
       "Cosy studio near the airport and Phoenix mall, tastefully designed for short visits.", [IMG["short-stays"][2]]),

    # Jaipur
    _p("Civil Lines Haveli Residence", "buy", "homes-to-buy", "jaipur", 55000000, "total", 5, 5, 4200,
       "A restored haveli-style residence blending Rajasthani craft with contemporary luxury in Civil Lines.", [IMG["homes-to-buy"][2], IMG["homes-to-buy"][1]], True),
    _p("Malviya Nagar Family Rental", "rent", "rentals", "jaipur", 32000, "month", 3, 2, 1450,
       "Peaceful 3BHK in a well-connected residential pocket with parks and schools nearby.", [IMG["rentals"][0]]),
    _p("Amer Fort View Retreat", "shortstay", "short-stays", "jaipur", 7200, "night", 2, 2, 1000,
       "A boutique retreat with uninterrupted views of Amer Fort — heritage charm meets modern comfort.", [IMG["short-stays"][0]]),
    _p("Ajmer Road Development Plot", "buy", "land-plots", "jaipur", 6800000, "total", 0, 0, 3000,
       "Large development-ready plot on the rapidly growing Ajmer Road corridor.", [IMG["land-plots"][0]]),
]


AGENTS = [
    {"name": "Ananya Rao", "city": "mumbai", "specialization": "Luxury Sea-Facing Homes", "phone": "+91 99164 75749", "rating": 4.9, "deals": 214,
     "image": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80"},
    {"name": "Rohan Mehta", "city": "mumbai", "specialization": "Rentals & Leasing", "phone": "+91 99164 75749", "rating": 4.7, "deals": 168,
     "image": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80"},
    {"name": "Kavya Nair", "city": "bengaluru", "specialization": "Villas & Gated Communities", "phone": "+91 99164 75749", "rating": 4.8, "deals": 192,
     "image": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80"},
    {"name": "Arjun Desai", "city": "pune", "specialization": "Investment & Plots", "phone": "+91 99164 75749", "rating": 4.6, "deals": 133,
     "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"},
    {"name": "Meera Sharma", "city": "jaipur", "specialization": "Heritage & Boutique Homes", "phone": "+91 99164 75749", "rating": 4.9, "deals": 151,
     "image": "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=400&q=80"},
]
