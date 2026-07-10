import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

export default function LocationShowcase({ cities = [] }) {
  return (
    <section
      data-testid="location-showcase"
      className="relative bg-black py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-indigo-400">
            Discover neighbourhoods
          </p>
          <h2 className="font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Where would you like to live?
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cities.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className={i % 2 === 1 ? "lg:mt-10" : ""}
            >
              <Link
                to={`/search?city=${c.slug}`}
                data-testid={`city-${c.slug}`}
                className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl border border-white/10 p-5"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <div className="relative z-10">
                  <h3 className="font-display text-2xl font-semibold text-white">
                    {c.name}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-300">
                    <MapPin size={14} className="text-indigo-400" />
                    {c.count} {c.count === 1 ? "home" : "homes"} available
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
