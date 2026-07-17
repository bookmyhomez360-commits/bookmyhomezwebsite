import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Upload, X, Loader2, Film } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { uploadMedia, createProperty, updateProperty, mediaUrl } from "@/lib/api";

const CATEGORIES = [
  { slug: "homes-to-buy", name: "Homes to Buy", type: "buy" },
  { slug: "rentals", name: "Rentals", type: "rent" },
  { slug: "short-stays", name: "Short Stays", type: "shortstay" },
  { slug: "land-plots", name: "Land & Plots", type: "buy" },
];
const CITIES = ["mumbai", "bengaluru", "pune", "jaipur"];
const MAX_IMAGES = 20;

const field =
  "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-500 outline-none transition-colors focus:border-indigo-500";

const emptyForm = {
  title: "",
  category: "homes-to-buy",
  city: "mumbai",
  price: "",
  bedrooms: "",
  bathrooms: "",
  area_sqft: "",
  description: "",
};

export default function PropertyFormDialog({ open, onOpenChange, editing, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      const cat = CATEGORIES.find((c) => c.slug === editing.category) || CATEGORIES[0];
      setForm({
        title: editing.title || "",
        category: cat.slug,
        city: editing.city || "mumbai",
        price: editing.price || "",
        bedrooms: editing.bedrooms || "",
        bathrooms: editing.bathrooms || "",
        area_sqft: editing.area_sqft || "",
        description: editing.description || "",
      });
      setImages(editing.images || []);
      setVideo(editing.video || null);
    } else {
      setForm(emptyForm);
      setImages([]);
      setVideo(null);
    }
  }, [editing, open]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onImageFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (images.length + files.length > MAX_IMAGES) {
      toast.error(`Max ${MAX_IMAGES} images allowed`);
      return;
    }
    setUploading(true);
    try {
      for (const file of files) {
        const res = await uploadMedia(file);
        setImages((prev) => [...prev, res.url]);
      }
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onVideoFile = async (e) => {
    const file = (e.target.files || [])[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 60 * 1024 * 1024) {
      toast.error("Video must be under 60MB");
      return;
    }
    setUploading(true);
    try {
      const res = await uploadMedia(file);
      setVideo(res.url);
    } catch {
      toast.error("Video upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title) {
      toast.error("Title is required");
      return;
    }
    const cat = CATEGORIES.find((c) => c.slug === form.category);
    const payload = {
      title: form.title,
      type: cat.type,
      category: form.category,
      city: form.city,
      price: form.price ? Number(form.price) : null,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : 0,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : 0,
      area_sqft: form.area_sqft ? Number(form.area_sqft) : 0,
      description: form.description,
      images,
      video,
    };
    setSaving(true);
    try {
      if (editing) await updateProperty(editing.id, payload);
      else await createProperty(payload);
      toast.success(editing ? "Listing updated" : "Listing published!");
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="property-form-dialog"
        className="max-h-[90vh] overflow-y-auto border-white/10 bg-slate-950 text-white sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {editing ? "Edit property" : "Add a property"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Upload up to {MAX_IMAGES} photos and a video. Zero brokerage.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="mt-2 space-y-4">
          <input data-testid="pf-title" className={field} placeholder="Property title *" value={form.title} onChange={set("title")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <select data-testid="pf-category" className={field} value={form.category} onChange={set("category")}>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug} className="bg-slate-900">{c.name}</option>
              ))}
            </select>
            <select data-testid="pf-city" className={field} value={form.city} onChange={set("city")}>
              {CITIES.map((c) => (
                <option key={c} value={c} className="bg-slate-900">{c[0].toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <input data-testid="pf-price" type="number" className={field} placeholder="Price ₹" value={form.price} onChange={set("price")} />
            <input data-testid="pf-beds" type="number" className={field} placeholder="Beds" value={form.bedrooms} onChange={set("bedrooms")} />
            <input data-testid="pf-baths" type="number" className={field} placeholder="Baths" value={form.bathrooms} onChange={set("bathrooms")} />
            <input data-testid="pf-area" type="number" className={field} placeholder="Sqft" value={form.area_sqft} onChange={set("area_sqft")} />
          </div>
          <textarea data-testid="pf-description" rows={3} className={field} placeholder="Description" value={form.description} onChange={set("description")} />

          {/* Images */}
          <div>
            <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
              <span>Photos ({images.length}/{MAX_IMAGES})</span>
              {uploading && <span className="flex items-center gap-1 text-indigo-300"><Loader2 size={14} className="animate-spin" /> uploading…</span>}
            </div>
            <label htmlFor="pf-images" data-testid="pf-image-upload" className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 bg-white/5 py-4 text-sm text-slate-300 transition-colors hover:border-indigo-500 hover:text-white">
              <Upload size={18} /> Add photos
            </label>
            <input id="pf-images" type="file" accept="image/*" multiple className="hidden" onChange={onImageFiles} />
            {images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {images.map((src, i) => (
                  <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-white/10">
                    <img src={mediaUrl(src)} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setImages((p) => p.filter((_, idx) => idx !== i))} className="absolute right-0 top-0 rounded-bl bg-black/70 p-0.5 text-white">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video */}
          <div>
            <div className="mb-2 text-sm text-slate-300">Video (optional, max 60MB)</div>
            {video ? (
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                <span className="flex items-center gap-2"><Film size={16} className="text-indigo-400" /> Video added</span>
                <button type="button" onClick={() => setVideo(null)} className="text-slate-400 hover:text-white"><X size={16} /></button>
              </div>
            ) : (
              <>
                <label htmlFor="pf-video" data-testid="pf-video-upload" className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 bg-white/5 py-4 text-sm text-slate-300 transition-colors hover:border-indigo-500 hover:text-white">
                  <Film size={18} /> Add video
                </label>
                <input id="pf-video" type="file" accept="video/*" className="hidden" onChange={onVideoFile} />
              </>
            )}
          </div>

          <button
            type="submit"
            data-testid="pf-submit"
            disabled={saving || uploading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 py-3 font-semibold text-white transition-transform duration-200 hover:bg-indigo-500 active:scale-95 disabled:opacity-60"
          >
            {saving && <Loader2 className="animate-spin" size={18} />}
            {editing ? "Save changes" : "Publish listing"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
