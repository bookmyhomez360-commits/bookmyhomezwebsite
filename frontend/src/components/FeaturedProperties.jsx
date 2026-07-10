import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getProperties } from "@/lib/api";
import PropertyCard from "@/components/PropertyCard";

export default function FeaturedProperties() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getProperties({ featured: true, limit: 6 })
      .then(setItems)
      .catch(() => {});
  }, []);

  if (!items.length) return null;

  return (
    <section data-testid="featured-properties" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-indigo-400">
              Handpicked for you
            </p>
            <h2 className="font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Featured homes
            </h2>
          </div>
          <Link
            to="/search"
            data-testid="view-all-properties"
            className="group inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            View all listings
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        <motion.div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p, i) => (
            <PropertyCard key={p.id} property={p} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
