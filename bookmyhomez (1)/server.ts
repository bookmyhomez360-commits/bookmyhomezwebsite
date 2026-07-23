import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { INITIAL_PROPERTIES } from "./src/data/initialProperties.ts";
import { Property } from "./src/types.ts";

let propertiesStore: Property[] = [...INITIAL_PROPERTIES];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "BookMyHomez", timestamp: new Date().toISOString() });
  });

  // GET /api/properties
  app.get("/api/properties", (_req, res) => {
    res.json({ success: true, count: propertiesStore.length, properties: propertiesStore });
  });

  // POST /api/properties
  app.post("/api/properties", (req, res) => {
    try {
      const newProperty: Property = {
        id: req.body.id || Date.now(),
        title: req.body.title || "Untitled Property",
        category: req.body.category || "Buy",
        status: req.body.status || "Available",
        city: req.body.city || "Bengaluru",
        locality: req.body.locality || "Central",
        bhk: req.body.bhk || "2 BHK",
        area: Number(req.body.area) || 1000,
        price: Number(req.body.price) || 0,
        ownerId: req.body.ownerId || "usr_guest",
        ownerName: req.body.ownerName || "Property Owner",
        description: req.body.description || "Property listed via BookMyHomez wizard.",
        images: Array.isArray(req.body.images) && req.body.images.length > 0 
          ? req.body.images 
          : ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80"],
        deposit: req.body.deposit,
        availDate: req.body.availDate,
        propertyAge: req.body.propertyAge,
        bathrooms: req.body.bathrooms,
        balconies: req.body.balconies,
        furnishing: req.body.furnishing,
        furnishings: req.body.furnishings,
        amenities: req.body.amenities,
        propType: req.body.propType,
        subType: req.body.subType,
        createdAt: new Date().toISOString()
      };

      propertiesStore.unshift(newProperty);
      res.status(201).json({ success: true, message: "Property published successfully", property: newProperty });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // PUT /api/properties/:id
  app.put("/api/properties/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = propertiesStore.findIndex(p => p.id === id);
    if (index === -1) {
      res.status(404).json({ success: false, error: "Property not found" });
      return;
    }
    propertiesStore[index] = { ...propertiesStore[index], ...req.body, id };
    res.json({ success: true, message: "Property updated successfully", property: propertiesStore[index] });
  });

  // DELETE /api/properties/:id
  app.delete("/api/properties/:id", (req, res) => {
    const id = Number(req.params.id);
    propertiesStore = propertiesStore.filter(p => p.id !== id);
    res.json({ success: true, message: "Property deleted successfully", id });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[BookMyHomez] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
