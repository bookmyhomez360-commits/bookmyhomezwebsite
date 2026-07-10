import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { CATEGORY_IMAGES } from "@/lib/config";

const CARDS = [
  { slug: "homes-to-buy", name: "Homes to Buy", type: "buy", desc: "Own your forever address" },
  { slug: "rentals", name: "Rentals", type: "rent", desc: "Flexible living, zero fuss" },
  { slug: "short-stays", name: "Short Stays", type: "shortstay", desc: "Weekends & workations" },
  { slug: "land-plots", name: "Land & Plots", type: "buy", cat: "land-plots", desc: "Build from the ground up" },
];

export default function CategoryGrid() {
  return (
    <section data-testid="category-grid" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-indigo-400">
              What are you looking for
            </p>
            <h2 className="font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Every kind of home,<br />
              <span className="italic text-slate-400">one happy partner.</span>
            </h2>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((c, i) => {
            const params = new URLSearchParams();
            if (c.cat) params.set("category", c.cat);
            else params.set("type", c.type);
            return (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
              >
                <Link
                  to={`/search?${params.toString()}`}
                  data-testid={`category-${c.slug}`}
                  className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl border border-white/10 p-5"
                >
                  <img
                    src={CATEGORY_IMAGES[c.slug]}
                    alt={c.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent transition-opacity duration-300 group-hover:from-slate-950" />
                  <div className="relative z-10">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-display text-2xl font-semibold text-white">
                        {c.name}
                      </h3>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 group-hover:bg-indigo-600 group-hover:-translate-y-0.5">
                        <ArrowUpRight size={18} />
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">{c.desc}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
