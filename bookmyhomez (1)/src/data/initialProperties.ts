import { Property, GoogleAccount, User } from '../types';

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 1,
    title: "Prestige High Fields Villa",
    category: "Buy",
    status: "Available",
    city: "Bengaluru",
    locality: "Indiranagar",
    bhk: "3 BHK",
    area: 2100,
    price: 24500000,
    ownerId: "usr_admin_01",
    ownerName: "Admin BookMyHomez",
    description: "Exquisite modern 3BHK villa located in prime Indiranagar with private garden, smart home automation, and 24/7 gated security.",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"
    ],
    propType: "Residential",
    subType: "Independent House / Villa",
    deposit: 500000,
    availDate: "2026-03-01",
    propertyAge: "0-1 Years",
    bathrooms: "3",
    balconies: "2",
    furnishing: "Fully Furnished",
    amenities: ["Lift", "Power Backup", "CCTV Security", "Swimming Pool", "Gymnasium", "Park / Garden", "Clubhouse"]
  },
  {
    id: 2,
    title: "Lodha Sea View Residency",
    category: "Rent",
    status: "Booked",
    city: "Mumbai",
    locality: "Bandra West",
    bhk: "2 BHK",
    area: 1100,
    price: 85000,
    ownerId: "usr_admin_01",
    ownerName: "Admin BookMyHomez",
    description: "Uninterrupted Arabian Sea view from high floor apartment with modular Italian kitchen, wooden flooring, and full club amenities.",
    images: [
      "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80"
    ],
    propType: "Residential",
    subType: "Apartment",
    deposit: 250000,
    availDate: "2026-02-15",
    propertyAge: "1-5 Years",
    bathrooms: "2",
    balconies: "1",
    furnishing: "Fully Furnished",
    amenities: ["Lift", "Power Backup", "CCTV Security", "Gymnasium"]
  },
  {
    id: 3,
    title: "Godrej Palm Meadows Plot",
    category: "Plots",
    status: "Available",
    city: "Jaipur",
    locality: "Ajmer Road",
    bhk: "1 BHK",
    area: 2400,
    price: 4500000,
    ownerId: "usr_rajesh_101",
    ownerName: "Rajesh Kumar",
    description: "Gated community residential plot with wide 60ft approach roads, underground electric cabling, water lines, and immediate registry.",
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80"
    ],
    propType: "Residential",
    subType: "Plot",
    deposit: 0,
    availDate: "Immediate",
    propertyAge: "New",
    bathrooms: "0",
    balconies: "0",
    furnishing: "Unfurnished",
    amenities: ["Park / Garden", "CCTV Security"]
  },
  {
    id: 4,
    title: "Koregaon Park Luxury Short Stay Retreat",
    category: "Short Stay",
    status: "Available",
    city: "Pune",
    locality: "Koregaon Park",
    bhk: "2 BHK",
    area: 1350,
    price: 4500,
    ownerId: "usr_priya_202",
    ownerName: "Priya Sharma",
    description: "Serviced designer studio apartment with high-speed WiFi, daily housekeeping, infinity pool access, and walking distance to cafes.",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80"
    ],
    propType: "Residential",
    subType: "Studio Apartment",
    deposit: 5000,
    availDate: "Immediate",
    propertyAge: "1-3 Years",
    bathrooms: "2",
    balconies: "2",
    furnishing: "Fully Furnished",
    amenities: ["Lift", "Power Backup", "CCTV Security", "Swimming Pool", "Intercom"]
  },
  {
    id: 5,
    title: "DLF Phase 5 Sky Penthouse",
    category: "Buy",
    status: "Available",
    city: "Delhi NCR",
    locality: "Gurugram",
    bhk: "4+ BHK",
    area: 3800,
    price: 52000000,
    ownerId: "usr_admin_01",
    ownerName: "Admin BookMyHomez",
    description: "Ultra-luxury duplex penthouse with private terrace plunge pool, panoramic skyline views, double height ceilings, and 4 car parking spots.",
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80"
    ],
    propType: "Residential",
    subType: "Penthouse",
    deposit: 1000000,
    availDate: "2026-04-01",
    propertyAge: "0-1 Years",
    bathrooms: "5",
    balconies: "3",
    furnishing: "Fully Furnished",
    amenities: ["Lift", "Power Backup", "CCTV Security", "Swimming Pool", "Gymnasium", "Clubhouse", "Intercom"]
  },
  {
    id: 6,
    title: "Jubilee Hills Tech Corridor PG & Coliving",
    category: "Rent",
    status: "Available",
    city: "Hyderabad",
    locality: "Jubilee Hills",
    bhk: "1 BHK",
    area: 450,
    price: 18000,
    ownerId: "usr_rajesh_101",
    ownerName: "Rajesh Kumar",
    description: "Fully managed coliving space with attached bath, 3 times food service, high-speed fiber internet, and gaming room for IT professionals.",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80"
    ],
    propType: "Residential",
    subType: "Studio Apartment",
    deposit: 36000,
    availDate: "Immediate",
    propertyAge: "1 Year",
    bathrooms: "1",
    balconies: "1",
    furnishing: "Fully Furnished",
    amenities: ["Power Backup", "CCTV Security", "Gymnasium", "Intercom"]
  }
];

export const GOOGLE_ACCOUNTS: GoogleAccount[] = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar92@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma.realty@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80'
  },
  {
    name: 'Vikram Malhotra',
    email: 'vikram.homes@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  }
];

export const REGISTERED_USERS: (User & { password?: string })[] = [
  {
    email: 'admin@bookmyhomez.com',
    password: 'admin123',
    name: 'Admin BookMyHomez',
    role: 'Administrator',
    id: 'usr_admin_01',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
  },
  {
    email: 'agent@bookmyhomez.com',
    password: 'agent123',
    name: 'Rajesh Kumar (Agent)',
    role: 'Verified Owner',
    id: 'usr_rajesh_101',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80'
  },
  {
    email: 'rajesh@gmail.com',
    password: 'password123',
    name: 'Rajesh Kumar',
    role: 'Verified Owner',
    id: 'usr_rajesh_101',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80'
  }
];
