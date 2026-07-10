import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Search, Loader2, SlidersHorizontal, Star, Phone } from "lucide-react";
import { getProperties, getCities, getAgents, aiSearch } from "@/lib/api";
import { whatsappLink } from "@/lib/config";
import PropertyCard from "@/components/PropertyCard";

const TYPES = [
  { v: "", l: "All Types" },
  { v: "buy", l: "Buy" },
  { v: "rent", l: "Rent" },
  { v: "shortstay", l: "Short Stay" },
];

const field =
  "rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-indigo-500";

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const [cities, setCities] = useState([]);
  const [agents, setAgents] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiText, setAiText] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const isAgents = params.get("tab") === "agents";
  const aiParam = params.get("ai");

  useEffect(() => {
    getCities().then(setCities).catch(() => {});
  }, []);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("ai");
    setParams(next);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (isAgents) {
        const data = await getAgents(params.get("city") || undefined);
        setAgents(data);
      } else if (aiParam) {
        setAiLoading(true);
        const res = await aiSearch(aiParam);
        setItems(res.properties);
        setAiReply(res.reply);
        setAiLoading(false);
      } else {
        const data = await getProperties({
          type: params.get("type") || undefined,
          city: params.get("city") || undefined,
          category: params.get("category") || undefined,
          bedrooms: params.get("bedrooms") || undefined,
          q: params.get("q") || undefined,
        });
        // client-side sort
        const sort = params.get("sort");
        if (sort === "low") data.sort((a, b) => a.price - b.price);
        if (sort === "high") data.sort((a, b) => b.price - a.price);
        setItems(data);
        setAiReply("");
      }
    } finally {
      setLoading(false);
    }
  }, [params, isAgents, aiParam]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const submitAi = (e) => {
    e.preventDefault();
    if (!aiText.trim()) return;
    const next = new URLSearchParams();
    next.set("ai", aiText.trim());
    setParams(next);
  };

  return (
    <main className="min-h-screen pt-28">
      <div className="mx-auto max-w-7xl px-4 pb-24 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="text-sm text-slate-400 transition-colors hover:text-white">
            ← Back home
          </Link>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">
            {isAgents ? "Meet our agents" : "Explore homes"}
          </h1>
        </div>

        {/* AI search bar */}
        {!isAgents && (
          <form
            onSubmit={submitAi}
            className="mb-6 flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3"
          >
            <Sparkles size={18} className="shrink-0 text-indigo-300" />
            <input
              data-testid="results-ai-input"
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              placeholder="Ask AI in plain English: villa to buy in Jaipur under 6 Cr…"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-indigo-200/60 outline-none"
            />
            <button data-testid="results-ai-btn" type="submit" className="flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500">
              <Search size={15} /> Ask
            </button>
          </form>
        )}

        {aiReply && (
          <div data-testid="ai-reply" className="mb-6 flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
            <Sparkles size={18} className="mt-0.5 shrink-0 text-indigo-400" />
            <p className="text-slate-200">{aiReply}</p>
          </div>
        )}

        {/* Filters */}
        {!isAgents && (
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 text-sm text-slate-400">
              <SlidersHorizontal size={16} /> Filters
            </span>
            <select data-testid="filter-type" className={field} value={params.get("type") || ""} onChange={(e) => update("type", e.target.value)}>
              {TYPES.map((t) => (
                <option key={t.v} value={t.v} className="bg-slate-900">{t.l}</option>
              ))}
            </select>
            <select data-testid="filter-city" className={field} value={params.get("city") || ""} onChange={(e) => update("city", e.target.value)}>
              <option value="" className="bg-slate-900">All Cities</option>
              {cities.map((c) => (
                <option key={c.slug} value={c.slug} className="bg-slate-900">{c.name}</option>
              ))}
            </select>
            <select data-testid="filter-beds" className={field} value={params.get("bedrooms") || ""} onChange={(e) => update("bedrooms", e.target.value)}>
              <option value="" className="bg-slate-900">Any Beds</option>
              <option value="1" className="bg-slate-900">1+ Beds</option>
              <option value="2" className="bg-slate-900">2+ Beds</option>
              <option value="3" className="bg-slate-900">3+ Beds</option>
              <option value="4" className="bg-slate-900">4+ Beds</option>
            </select>
            <select data-testid="filter-sort" className={field} value={params.get("sort") || ""} onChange={(e) => update("sort", e.target.value)}>
              <option value="" className="bg-slate-900">Sort</option>
              <option value="low" className="bg-slate-900">Price: Low to High</option>
              <option value="high" className="bg-slate-900">Price: High to Low</option>
            </select>
          </div>
        )}

        {/* Results */}
        {loading || aiLoading ? (
          <div className="flex items-center justify-center py-32 text-slate-400">
            <Loader2 className="mr-2 animate-spin" /> Loading…
          </div>
        ) : isAgents ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((a, i) => (
              <motion.div
                key={a.id}
                data-testid={`agent-card-${a.id}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex items-center gap-4">
                  <img src={a.image} alt={a.name} className="h-16 w-16 rounded-full object-cover" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">{a.name}</h3>
                    <p className="text-sm capitalize text-slate-400">{a.city}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-indigo-300">{a.specialization}</p>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-sm text-slate-300">
                  <span className="flex items-center gap-1">
                    <Star size={15} className="fill-yellow-400 text-yellow-400" /> {a.rating} · {a.deals} deals
                  </span>
                  <a href={whatsappLink(`Hi, I'd like to connect with ${a.name}`)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1.5 text-white transition-colors hover:bg-indigo-500">
                    <Phone size={14} /> Contact
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        ) : items.length ? (
          <>
            <p data-testid="results-count" className="mb-6 text-sm text-slate-400">
              {items.length} {items.length === 1 ? "home" : "homes"} found
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p, i) => (
                <PropertyCard key={p.id} property={p} index={i} />
              ))}
            </div>
          </>
        ) : (
          <div data-testid="no-results" className="py-24 text-center">
            <p className="font-display text-2xl text-white">No homes match your search</p>
            <p className="mt-2 text-slate-400">Try adjusting your filters or ask our AI.</p>
          </div>
        )}
      </div>
    </main>
  );
}
