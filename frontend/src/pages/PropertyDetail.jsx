import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BedDouble, Bath, Maximize, MapPin, Loader2, ArrowLeft, Phone, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { getProperty, createEnquiry, formatPrice, mediaUrl } from "@/lib/api";
import { whatsappLink } from "@/lib/config";

const TYPE_LABEL = { buy: "For Sale", rent: "For Rent", shortstay: "Short Stay" };

export default function PropertyDetail() {
  const { id } = useParams();
  const [prop, setProp] = useState(null);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [enq, setEnq] = useState({ name: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submitEnquiry = async (e) => {
    e.preventDefault();
    if (!enq.name || !enq.phone) {
      toast.error("Please enter your name and phone");
      return;
    }
    setSending(true);
    try {
      await createEnquiry(id, enq);
      setSent(true);
      toast.success("Enquiry sent! The owner will reach out soon.");
    } catch {
      toast.error("Could not send enquiry. Try again.");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    getProperty(id)
      .then((d) => setProp(d))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        <Loader2 className="mr-2 animate-spin" /> Loading…
      </div>
    );

  if (notFound || !prop)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="font-display text-3xl text-white">Property not found</p>
        <Link to="/search" className="rounded-full bg-indigo-600 px-6 py-3 text-white">
          Browse listings
        </Link>
      </div>
    );

  const images = prop.images?.length ? prop.images : [];

  return (
    <main className="min-h-screen pt-28" data-testid="property-detail">
      <div className="mx-auto max-w-6xl px-4 pb-24 md:px-8">
        <Link to="/search" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white">
          <ArrowLeft size={16} /> Back to listings
        </Link>

        {/* Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-2xl border border-white/10"
        >
          <div className="aspect-[16/9] bg-slate-900">
            {images[active] && (
              <img src={mediaUrl(images[active])} alt={prop.title} className="h-full w-full object-cover" />
            )}
          </div>
        </motion.div>
        {images.length > 1 && (
          <div className="mt-3 flex gap-3 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                data-testid={`thumb-${i}`}
                className={`h-20 w-28 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                  active === i ? "border-indigo-500" : "border-transparent opacity-70"
                }`}
              >
                <img src={mediaUrl(img)} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {prop.video && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10" data-testid="property-video">
            <video src={mediaUrl(prop.video)} controls className="h-full w-full bg-black" />
          </div>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <span className="rounded-full bg-indigo-600/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              {TYPE_LABEL[prop.type] || prop.type}
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">
              {prop.title}
            </h1>
            <p className="mt-3 flex items-center gap-2 capitalize text-slate-400">
              <MapPin size={16} className="text-indigo-400" /> {prop.city}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              {prop.category !== "land-plots" && (
                <>
                  <Stat icon={<BedDouble size={18} />} label="Bedrooms" value={prop.bedrooms} />
                  <Stat icon={<Bath size={18} />} label="Bathrooms" value={prop.bathrooms} />
                </>
              )}
              <Stat icon={<Maximize size={18} />} label="Area" value={`${prop.area_sqft} sqft`} />
            </div>

            <div className="mt-10 border-t border-white/10 pt-8">
              <h2 className="font-display text-2xl font-semibold text-white">About this property</h2>
              <p className="mt-4 leading-relaxed text-slate-300">{prop.description}</p>
            </div>
          </div>

          {/* Sticky CTA */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm uppercase tracking-widest text-slate-400">Price</p>
              <p className="mt-1 font-display text-3xl font-semibold text-white">
                {formatPrice(prop.price, prop.price_unit)}
              </p>
              <a
                data-testid="detail-whatsapp"
                href={whatsappLink(`Hi BookMyHomez, I'm interested in "${prop.title}" (${prop.city}).`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 py-3.5 font-semibold text-white transition-transform duration-200 hover:bg-indigo-500 active:scale-95"
              >
                <Phone size={18} /> Enquire on WhatsApp
              </a>
              <p className="mt-4 text-center text-xs text-slate-500">
                Zero brokerage · Verified listing
              </p>
            </div>

            {/* Enquiry form -> lead */}
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-6" data-testid="enquiry-box">
              {sent ? (
                <div className="flex flex-col items-center py-4 text-center">
                  <CheckCircle2 className="text-green-400" size={32} />
                  <p className="mt-3 font-medium text-white">Enquiry sent!</p>
                  <p className="mt-1 text-sm text-slate-400">The owner will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={submitEnquiry} className="space-y-3">
                  <p className="font-medium text-white">Request a callback</p>
                  <input data-testid="enq-name" className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-indigo-500" placeholder="Your name" value={enq.name} onChange={(e) => setEnq({ ...enq, name: e.target.value })} />
                  <input data-testid="enq-phone" className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-indigo-500" placeholder="Phone number" value={enq.phone} onChange={(e) => setEnq({ ...enq, phone: e.target.value })} />
                  <textarea data-testid="enq-message" rows={2} className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-indigo-500" placeholder="Message (optional)" value={enq.message} onChange={(e) => setEnq({ ...enq, message: e.target.value })} />
                  <button type="submit" data-testid="enq-submit" disabled={sending} className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 font-semibold text-slate-900 transition-transform duration-200 hover:bg-slate-100 active:scale-95 disabled:opacity-60">
                    {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={16} />} Send enquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3">
      <span className="text-indigo-400">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
        <p className="font-medium text-white">{value}</p>
      </div>
    </div>
  );
}
