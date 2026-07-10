import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Sparkles, MapPin, ChevronDown, ArrowRight } from "lucide-react";
import { HERO_IMAGE } from "@/lib/config";

const TABS = [
  { id: "buy", label: "Buy" },
  { id: "rent", label: "Rent" },
  { id: "shortstay", label: "Short Stay" },
  { id: "agents", label: "Agents" },
];

const HEADLINE = ["Find a home you'll", "actually want to", "come back to"];

export default function Hero({ cities = [] }) {
  const [tab, setTab] = useState("buy");
  const [city, setCity] = useState("");
  const [keyword, setKeyword] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const navigate = useNavigate();

  const runSearch = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (tab === "agents") {
      params.set("tab", "agents");
      if (city) params.set("city", city);
    } else {
      params.set("type", tab);
      if (city) params.set("city", city);
      if (keyword) params.set("q", keyword);
    }
    navigate(`/search?${params.toString()}`);
  };

  const runAi = (e) => {
    e?.preventDefault();
    if (!aiQuery.trim()) return;
    navigate(`/search?ai=${encodeURIComponent(aiQuery.trim())}`);
  };

  return (
    <section
      data-testid="hero"
      className="relative flex min-h-screen items-center overflow-hidden pt-28"
    >
      <div className="absolute inset-0">
        <motion.img
          src={HERO_IMAGE}
          alt="Luxury home"
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 3, ease: [0.16, 1, 0.3, 1] }}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-transparent" />
        <div className="hero-gradient absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.1 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200 backdrop-blur"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
          India&apos;s Happy Home Partner
        </motion.div>

        <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[5.5rem]">
          {HEADLINE.map((line, i) => (
            <span key={i} className="block overflow-hidden py-1">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{
                  duration: 0.9,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 2.2 + i * 0.12,
                }}
              >
                {i === 1 ? (
                  <>
                    actually <span className="italic text-indigo-400">want</span> to
                  </>
                ) : (
                  line
                )}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.7 }}
          className="mt-6 max-w-xl text-base text-slate-300 md:text-lg"
        >
          Buy, rent or stay in India&apos;s most-loved neighbourhoods. Curated homes,
          honest pricing, and a partner who actually cares.
        </motion.p>

        {/* Search panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.8 }}
          className="mt-10 w-full max-w-3xl rounded-2xl border border-white/10 bg-slate-950/60 p-2 backdrop-blur-xl"
          data-testid="hero-search-panel"
        >
          <div className="flex gap-1 rounded-xl bg-white/5 p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                data-testid={`tab-${t.id}`}
                onClick={() => setTab(t.id)}
                className="relative flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
              >
                {tab === t.id && (
                  <motion.span
                    layoutId="active-tab"
                    className="absolute inset-0 rounded-lg bg-indigo-600"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span
                  className={`relative z-10 ${
                    tab === t.id ? "text-white" : "text-slate-300"
                  }`}
                >
                  {t.label}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={runSearch} className="mt-2 flex flex-col gap-2 p-2 sm:flex-row">
            <div className="relative flex-1">
              <MapPin
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400"
              />
              <select
                data-testid="hero-city-select"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-9 text-white outline-none transition-colors focus:border-indigo-500"
              >
                <option value="" className="bg-slate-900">
                  Any city
                </option>
                {cities.map((c) => (
                  <option key={c.slug} value={c.slug} className="bg-slate-900">
                    {c.name} ({c.count})
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            {tab !== "agents" && (
              <input
                data-testid="hero-keyword-input"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search area, project or keyword"
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition-colors focus:border-indigo-500"
              />
            )}

            <button
              type="submit"
              data-testid="hero-search-btn"
              className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition-transform duration-200 hover:bg-indigo-500 active:scale-95"
            >
              <Search size={18} /> Search
            </button>
          </form>

          {/* AI search */}
          <form
            onSubmit={runAi}
            className="mx-2 mb-2 flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2"
          >
            <Sparkles size={18} className="shrink-0 text-indigo-300" />
            <input
              data-testid="hero-ai-input"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Ask AI: 3 BHK to rent in Bengaluru under 60k…"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-indigo-200/60 outline-none"
            />
            <button
              type="submit"
              data-testid="hero-ai-btn"
              className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-indigo-200 transition-colors hover:text-white"
            >
              Ask <ArrowRight size={15} />
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
