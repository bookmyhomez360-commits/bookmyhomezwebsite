import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, X, MapPin, Loader2, Upload, Star, Film, Check, Crosshair,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { uploadMedia, createProperty, mediaUrl, formatPrice } from "@/lib/api";

const TRANSACTION = ["Sale", "Rent", "Resale"];
const CATEGORY = ["Residential", "Commercial", "Agricultural", "Warehousing", "Industrial"];
const PTYPES = {
  Residential: ["Apartment", "Independent House", "Villa", "Plot", "Land (Residential)", "Co-Living/PG", "Row House", "Builder Floor", "Penthouse", "Studio Apartment", "Building (Residential)"],
  Commercial: ["Office Space", "Shop", "Showroom", "Commercial Land", "Building (Commercial)", "Co-Working"],
  Agricultural: ["Agricultural Land", "Farm House", "Farm Land"],
  Warehousing: ["Warehouse", "Cold Storage", "Godown"],
  Industrial: ["Factory", "Industrial Land", "Industrial Shed"],
};
const FURNISHING = ["Furnished", "Semi Furnished", "Unfurnished"];
const FACING = ["North", "South", "East", "West", "North East", "North West", "South East", "South West"];
const CURRENCY = ["INR", "AED"];
const AREA_UNIT = ["sqft", "sqm"];
const KNOWN_CITIES = ["mumbai", "bengaluru", "bangalore", "pune", "jaipur"];

const STEPS = ["Name", "Location", "Details", "Configuration", "Media", "Preview"];

const initial = {
  property_name: "",
  location: "",
  transaction_type: "",
  prop_category: "Residential",
  property_type: "",
  currency: "INR",
  price: "",
  security_deposit: "",
  availability: "Immediately",
  available_date: "",
  facing: "",
  furnishing: "",
  bedrooms: "",
  bathrooms: "",
  total_units: "",
  total_floors: "",
  super_area: "",
  area_unit: "sqft",
  overview: "",
};

function Chip({ active, children, onClick, testid }) {
  return (
    <button
      type="button"
      data-testid={testid}
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
        active
          ? "border-indigo-500 bg-indigo-600 text-white"
          : "border-white/15 bg-white/5 text-slate-300 hover:border-white/30 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder:text-slate-500 outline-none transition-colors focus:border-indigo-500";
const Label = ({ children, req }) => (
  <label className="mb-2 block text-sm font-medium text-slate-200">
    {children} {req && <span className="text-indigo-400">*</span>}
  </label>
);

export default function ListPropertyWizard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [form, setForm] = useState(initial);
  const [images, setImages] = useState([]);
  const [cover, setCover] = useState(0);
  const [video, setVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [locating, setLocating] = useState(false);
  const fileRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!loading && user === false) navigate("/login");
  }, [user, loading, navigate]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const go = (next) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
    window.scrollTo(0, 0);
  };

  const validate = () => {
    if (step === 0 && !form.property_name.trim()) return "Please enter a property name";
    if (step === 1 && !form.location.trim()) return "Please enter the property location";
    if (step === 2) {
      if (!form.transaction_type) return "Select a transaction type";
      if (!form.property_type) return "Select a property type";
      if (!form.price) return "Enter the price";
      if (form.availability === "Select Date" && !form.available_date) return "Pick an availability date";
    }
    if (step === 3 && !form.super_area) return "Enter the super built-up area";
    if (step === 4 && images.length === 0) return "Add at least one photo";
    return null;
  };

  const next = () => {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    go(step + 1);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported on this device");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        set("location", `Current location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        setLocating(false);
        toast.success("Location captured");
      },
      () => {
        setLocating(false);
        toast.error("Could not fetch location. Please type it in.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const addImages = async (files) => {
    files = Array.from(files || []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    if (images.length + files.length > 20) {
      toast.error("Maximum 20 photos");
      return;
    }
    setUploading(true);
    try {
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 10MB`);
          continue;
        }
        const res = await uploadMedia(file);
        setImages((p) => [...p, res.url]);
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const addVideo = async (file) => {
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

  const removeImage = (i) => {
    setImages((p) => p.filter((_, idx) => idx !== i));
    setCover((c) => (i === c ? 0 : c > i ? c - 1 : c));
  };

  const deriveCity = () => {
    const loc = form.location.toLowerCase();
    const hit = KNOWN_CITIES.find((c) => loc.includes(c));
    if (hit) return hit === "bangalore" ? "bengaluru" : hit;
    return form.location.split(",")[0].trim().toLowerCase() || "other";
  };

  const publish = async () => {
    setPublishing(true);
    // cover photo first
    const ordered = [...images];
    if (cover > 0 && cover < ordered.length) {
      const [c] = ordered.splice(cover, 1);
      ordered.unshift(c);
    }
    const isRent = form.transaction_type === "Rent";
    const isLand = /plot|land/i.test(form.property_type);
    const payload = {
      title: form.property_name.trim(),
      type: isRent ? "rent" : "buy",
      category: isLand ? "land-plots" : isRent ? "rentals" : "homes-to-buy",
      city: deriveCity(),
      price: Number(form.price) || 0,
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      area_sqft: Number(form.super_area) || 0,
      description: form.overview || "",
      images: ordered,
      video,
      location: form.location.trim(),
      transaction_type: form.transaction_type,
      prop_category: form.prop_category,
      property_type: form.property_type,
      currency: form.currency,
      security_deposit: form.security_deposit ? Number(form.security_deposit) : null,
      availability: form.availability,
      available_date: form.availability === "Select Date" ? form.available_date : null,
      facing: form.facing || null,
      furnishing: form.furnishing || null,
      total_units: form.total_units ? Number(form.total_units) : null,
      total_floors: form.total_floors ? Number(form.total_floors) : null,
      super_area: Number(form.super_area) || 0,
      area_unit: form.area_unit,
      overview: form.overview || "",
      cover_index: 0,
    };
    try {
      const created = await createProperty(payload);
      toast.success("Your property is live!");
      navigate(`/property/${created.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not publish. Try again.");
      setPublishing(false);
    }
  };

  const pct = ((step + 1) / STEPS.length) * 100;
  const typeOptions = PTYPES[form.prop_category] || [];

  return (
    <main className="min-h-screen bg-slate-950" data-testid="list-wizard">
      {/* Progress header */}
      <div className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              data-testid="wizard-back"
              onClick={() => (step === 0 ? navigate(-1) : go(step - 1))}
              className="flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
            >
              <ArrowLeft size={16} /> {step === 0 ? "Cancel" : "Back"}
            </button>
            <span className="text-sm font-medium text-slate-300">
              Step {step + 1} of {STEPS.length} · <span className="text-indigo-400">{STEPS[step]}</span>
            </span>
            <button onClick={() => navigate("/dashboard")} className="text-slate-500 hover:text-white" aria-label="Close">
              <X size={20} />
            </button>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-indigo-500"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-40 pt-8">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.3 }}
          >
            {/* STEP 1: NAME */}
            {step === 0 && (
              <div>
                <h1 className="font-display text-4xl font-semibold text-white">What's your property called?</h1>
                <p className="mt-2 text-slate-400">Give it a name buyers will remember.</p>
                <div className="mt-8">
                  <Label req>Property name</Label>
                  <input data-testid="wz-name" className={inputCls} placeholder="Eg: Prestige Tranquility" value={form.property_name} onChange={(e) => set("property_name", e.target.value)} autoFocus />
                </div>
              </div>
            )}

            {/* STEP 2: LOCATION */}
            {step === 1 && (
              <div>
                <h1 className="font-display text-4xl font-semibold text-white">Where is it located?</h1>
                <p className="mt-2 text-slate-400">Add the locality, city and landmark.</p>
                <div className="mt-8">
                  <Label req>Property location</Label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                    <input data-testid="wz-location" className={`${inputCls} pl-11`} placeholder="Eg: HSR Layout, Bengaluru" value={form.location} onChange={(e) => set("location", e.target.value)} />
                  </div>
                  <button data-testid="wz-current-location" onClick={useCurrentLocation} className="mt-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-2.5 text-sm font-medium text-indigo-200 transition-colors hover:bg-indigo-500/20">
                    {locating ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />} Use current location
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: DETAILS */}
            {step === 2 && (
              <div className="space-y-7">
                <div>
                  <h1 className="font-display text-4xl font-semibold text-white">Property details</h1>
                  <p className="mt-2 text-slate-400">Tell us the essentials.</p>
                </div>
                <div>
                  <Label req>Transaction type</Label>
                  <div className="flex flex-wrap gap-2">
                    {TRANSACTION.map((t) => <Chip key={t} testid={`wz-txn-${t.toLowerCase()}`} active={form.transaction_type === t} onClick={() => set("transaction_type", t)}>{t}</Chip>)}
                  </div>
                </div>
                <div>
                  <Label req>Property category</Label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY.map((t) => <Chip key={t} active={form.prop_category === t} onClick={() => { set("prop_category", t); set("property_type", ""); }}>{t}</Chip>)}
                  </div>
                </div>
                <div>
                  <Label req>Property type</Label>
                  <div className="flex flex-wrap gap-2">
                    {typeOptions.map((t) => <Chip key={t} testid={`wz-ptype-${t.replace(/[^a-z]/gi, "").toLowerCase()}`} active={form.property_type === t} onClick={() => set("property_type", t)}>{t}</Chip>)}
                  </div>
                </div>
                <div>
                  <Label req>{form.transaction_type === "Rent" ? "Monthly rent" : "Property price"}</Label>
                  <div className="flex gap-2">
                    <select className={`${inputCls} w-24`} value={form.currency} onChange={(e) => set("currency", e.target.value)}>
                      {CURRENCY.map((c) => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                    </select>
                    <input data-testid="wz-price" type="number" className={inputCls} placeholder={form.transaction_type === "Rent" ? "Eg: 38000" : "Eg: 8500000"} value={form.price} onChange={(e) => set("price", e.target.value)} />
                  </div>
                  {form.transaction_type === "Rent" && (
                    <div className="mt-3">
                      <Label>Security deposit</Label>
                      <input type="number" className={inputCls} placeholder="Eg: 100000" value={form.security_deposit} onChange={(e) => set("security_deposit", e.target.value)} />
                    </div>
                  )}
                </div>
                <div>
                  <Label req>Available from</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip active={form.availability === "Immediately"} onClick={() => set("availability", "Immediately")}>Immediately</Chip>
                    <Chip active={form.availability === "Select Date"} onClick={() => set("availability", "Select Date")}>Select date</Chip>
                    {form.availability === "Select Date" && (
                      <input data-testid="wz-date" type="date" className={`${inputCls} w-auto`} value={form.available_date} onChange={(e) => set("available_date", e.target.value)} />
                    )}
                  </div>
                </div>
                <div>
                  <Label>Facing</Label>
                  <div className="flex flex-wrap gap-2">
                    {FACING.map((t) => <Chip key={t} active={form.facing === t} onClick={() => set("facing", form.facing === t ? "" : t)}>{t}</Chip>)}
                  </div>
                </div>
                <p className="text-xs text-slate-500">Fields marked with <span className="text-indigo-400">*</span> are mandatory.</p>
              </div>
            )}

            {/* STEP 4: CONFIGURATION */}
            {step === 3 && (
              <div className="space-y-7">
                <div>
                  <h1 className="font-display text-4xl font-semibold text-white">Configuration &amp; area</h1>
                  <p className="mt-2 text-slate-400">A few specifics about the space.</p>
                </div>
                <div>
                  <Label>Furnishing</Label>
                  <div className="flex flex-wrap gap-2">
                    {FURNISHING.map((t) => <Chip key={t} active={form.furnishing === t} onClick={() => set("furnishing", form.furnishing === t ? "" : t)}>{t}</Chip>)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Bedrooms</Label><input type="number" className={inputCls} placeholder="Eg: 3" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} /></div>
                  <div><Label>Bathrooms</Label><input type="number" className={inputCls} placeholder="Eg: 2" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} /></div>
                  <div><Label>Total units</Label><input type="number" className={inputCls} placeholder="Eg: 27" value={form.total_units} onChange={(e) => set("total_units", e.target.value)} /></div>
                  <div><Label>Total floors</Label><input type="number" className={inputCls} placeholder="Eg: 6" value={form.total_floors} onChange={(e) => set("total_floors", e.target.value)} /></div>
                </div>
                <div>
                  <Label req>Super built-up area</Label>
                  <div className="flex gap-2">
                    <input data-testid="wz-area" type="number" className={inputCls} placeholder="Eg: 1200" value={form.super_area} onChange={(e) => set("super_area", e.target.value)} />
                    <select className={`${inputCls} w-28`} value={form.area_unit} onChange={(e) => set("area_unit", e.target.value)}>
                      {AREA_UNIT.map((u) => <option key={u} value={u} className="bg-slate-900">{u}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Overview</Label>
                  <textarea rows={3} className={inputCls} placeholder="Eg: RERA Registered, BBMP Approved, Vaastu Compliant…" value={form.overview} onChange={(e) => set("overview", e.target.value)} />
                </div>
              </div>
            )}

            {/* STEP 5: MEDIA */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h1 className="font-display text-4xl font-semibold text-white">Add photos &amp; video</h1>
                  <p className="mt-2 text-slate-400">Great photos get more leads. Pick a cover shot too.</p>
                </div>
                <div
                  data-testid="wz-dropzone"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); addImages(e.dataTransfer.files); }}
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 py-12 text-center transition-colors hover:border-indigo-500"
                >
                  {uploading ? <Loader2 className="animate-spin text-indigo-400" /> : <Upload className="text-indigo-400" />}
                  <p className="font-medium text-white">Drag &amp; drop or click to upload</p>
                  <p className="text-xs text-slate-500">JPG or PNG, up to 10MB each · max 20 photos</p>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addImages(e.target.files); e.target.value = ""; }} />
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {images.map((src, i) => (
                      <div key={i} className={`group relative aspect-square overflow-hidden rounded-xl border-2 ${cover === i ? "border-indigo-500" : "border-white/10"}`}>
                        <img src={mediaUrl(src)} alt="" className="h-full w-full object-cover" />
                        <button type="button" onClick={() => removeImage(i)} className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"><X size={12} /></button>
                        <button type="button" data-testid={`wz-cover-${i}`} onClick={() => setCover(i)} className={`absolute bottom-1 left-1 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cover === i ? "bg-indigo-600 text-white" : "bg-black/70 text-slate-200 opacity-0 group-hover:opacity-100"}`}>
                          <Star size={10} className={cover === i ? "fill-white" : ""} /> {cover === i ? "Cover" : "Set cover"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  {video ? (
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                      <span className="flex items-center gap-2"><Film size={16} className="text-indigo-400" /> Video added</span>
                      <button type="button" onClick={() => setVideo(null)} className="text-slate-400 hover:text-white"><X size={16} /></button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => videoRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 py-4 text-sm text-slate-300 transition-colors hover:border-indigo-500 hover:text-white">
                      <Film size={18} /> Add a video (optional)
                    </button>
                  )}
                  <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={(e) => { addVideo(e.target.files?.[0]); e.target.value = ""; }} />
                </div>
              </div>
            )}

            {/* STEP 6: PREVIEW */}
            {step === 5 && (
              <div data-testid="wz-preview">
                <h1 className="font-display text-4xl font-semibold text-white">Review &amp; publish</h1>
                <p className="mt-2 text-slate-400">Here's how your listing looks.</p>
                <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  {images[cover] && <img src={mediaUrl(images[cover])} alt="cover" className="aspect-[16/9] w-full object-cover" />}
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold uppercase text-white">{form.transaction_type || "—"}</span>
                      <span className="font-display text-2xl font-semibold text-white">{form.currency === "AED" ? "AED " : ""}{formatPrice(Number(form.price), form.transaction_type === "Rent" ? "month" : "total")}</span>
                    </div>
                    <h2 className="mt-3 font-display text-2xl font-semibold text-white">{form.property_name}</h2>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400"><MapPin size={14} className="text-indigo-400" /> {form.location}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-sm">
                      {[["Category", form.prop_category], ["Type", form.property_type], ["Furnishing", form.furnishing], ["Facing", form.facing], ["Beds", form.bedrooms], ["Baths", form.bathrooms], ["Units", form.total_units], ["Floors", form.total_floors], ["Area", form.super_area ? `${form.super_area} ${form.area_unit}` : ""], ["Available", form.availability === "Select Date" ? form.available_date : "Immediately"]].filter(([, v]) => v).map(([k, v]) => (
                        <span key={k} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300"><span className="text-slate-500">{k}:</span> {v}</span>
                      ))}
                    </div>
                    {form.overview && <p className="mt-4 text-slate-300">{form.overview}</p>}
                    {images.length > 0 && (
                      <div className="mt-4 flex gap-2 overflow-x-auto">
                        {images.map((s, i) => <img key={i} src={mediaUrl(s)} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky footer nav */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4">
          <button onClick={() => (step === 0 ? navigate(-1) : go(step - 1))} className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
            {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < STEPS.length - 1 ? (
            <button data-testid="wizard-next" onClick={next} className="flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:bg-indigo-500 active:scale-95">
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button data-testid="wizard-publish" onClick={publish} disabled={publishing} className="flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:bg-indigo-500 active:scale-95 disabled:opacity-60">
              {publishing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Publish
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
