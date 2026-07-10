import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Upload, X, Loader2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { createListing } from "@/lib/api";

const CATEGORIES = [
  { slug: "homes-to-buy", name: "Homes to Buy", type: "buy" },
  { slug: "rentals", name: "Rentals", type: "rent" },
  { slug: "short-stays", name: "Short Stays", type: "shortstay" },
  { slug: "land-plots", name: "Land & Plots", type: "buy" },
];
const CITIES = ["mumbai", "bengaluru", "pune", "jaipur"];

const empty = {
  owner_name: "",
  phone: "",
  email: "",
  property_title: "",
  category: "homes-to-buy",
  city: "mumbai",
  price: "",
  bedrooms: "",
  bathrooms: "",
  area_sqft: "",
  description: "",
};

const field =
  "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

export function ListPropertyDialog({ open, onOpenChange }) {
  const [form, setForm] = useState(empty);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onFiles = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    files.forEach((file) => {
      if (file.size > 4 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 4MB`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () =>
        setImages((prev) => [...prev, reader.result].slice(0, 5));
      reader.readAsDataURL(file);
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.owner_name || !form.phone || !form.property_title) {
      toast.error("Please fill your name, phone and property title.");
      return;
    }
    setLoading(true);
    const cat = CATEGORIES.find((c) => c.slug === form.category);
    try {
      await createListing({
        owner_name: form.owner_name,
        phone: form.phone,
        email: form.email || null,
        property_title: form.property_title,
        listing_type: cat.type,
        category: form.category,
        city: form.city,
        price: form.price ? Number(form.price) : null,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : 0,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : 0,
        area_sqft: form.area_sqft ? Number(form.area_sqft) : 0,
        description: form.description,
        images,
      });
      toast.success("Your property is live! Our team will reach out shortly.", {
        icon: <CheckCircle2 className="text-green-400" size={18} />,
      });
      setForm(empty);
      setImages([]);
      onOpenChange(false);
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="list-property-dialog"
        className="max-h-[90vh] overflow-y-auto border-white/10 bg-slate-950 text-white sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            List your property — free
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Zero brokerage. Reach thousands of genuine buyers and renters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="mt-2 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input data-testid="list-name" className={field} placeholder="Your name *" value={form.owner_name} onChange={set("owner_name")} />
            <input data-testid="list-phone" className={field} placeholder="Phone *" value={form.phone} onChange={set("phone")} />
          </div>
          <input data-testid="list-email" className={field} placeholder="Email (optional)" value={form.email} onChange={set("email")} />
          <input data-testid="list-title" className={field} placeholder="Property title * e.g. Sea-facing 3BHK in Bandra" value={form.property_title} onChange={set("property_title")} />

          <div className="grid gap-4 sm:grid-cols-2">
            <select data-testid="list-category" className={field} value={form.category} onChange={set("category")}>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug} className="bg-slate-900">{c.name}</option>
              ))}
            </select>
            <select data-testid="list-city" className={field} value={form.city} onChange={set("city")}>
              {CITIES.map((c) => (
                <option key={c} value={c} className="bg-slate-900 capitalize">{c[0].toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <input data-testid="list-price" type="number" className={field} placeholder="Price ₹" value={form.price} onChange={set("price")} />
            <input data-testid="list-beds" type="number" className={field} placeholder="Beds" value={form.bedrooms} onChange={set("bedrooms")} />
            <input data-testid="list-baths" type="number" className={field} placeholder="Baths" value={form.bathrooms} onChange={set("bathrooms")} />
            <input data-testid="list-area" type="number" className={field} placeholder="Sqft" value={form.area_sqft} onChange={set("area_sqft")} />
          </div>

          <textarea data-testid="list-description" rows={3} className={field} placeholder="Describe your property…" value={form.description} onChange={set("description")} />

          {/* Image upload */}
          <div>
            <label
              htmlFor="list-images"
              data-testid="list-image-upload"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 bg-white/5 py-4 text-sm text-slate-300 transition-colors hover:border-indigo-500 hover:text-white"
            >
              <Upload size={18} /> Upload photos (up to 5)
            </label>
            <input id="list-images" type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
            {images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {images.map((src, i) => (
                  <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-white/10">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages((p) => p.filter((_, idx) => idx !== i))}
                      className="absolute right-0 top-0 rounded-bl bg-black/70 p-0.5 text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            data-testid="list-submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 py-3 font-semibold text-white transition-transform duration-200 hover:bg-indigo-500 active:scale-95 disabled:opacity-60"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            {loading ? "Publishing…" : "Publish listing"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ListPropertySection({ onOpen }) {
  return (
    <section data-testid="list-property-cta" className="relative bg-black py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950 px-6 py-16 md:px-16 md:py-24"
        >
          <div className="hero-gradient absolute inset-0 opacity-70" />
          <div className="relative z-10 max-w-2xl">
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-indigo-400">
              Property owners
            </p>
            <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
              List your property — <span className="italic text-indigo-400">free.</span>
            </h2>
            <p className="mt-5 max-w-lg text-lg text-slate-300">
              Zero brokerage, verified enquiries, and a dashboard team that does
              the heavy lifting. Your listing goes live in minutes.
            </p>
            <button
              data-testid="cta-list-property"
              onClick={onOpen}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-4 font-semibold text-white transition-transform duration-200 hover:bg-indigo-500 active:scale-95"
            >
              Start listing — it&apos;s free
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
