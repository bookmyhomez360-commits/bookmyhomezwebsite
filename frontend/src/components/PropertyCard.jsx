import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BedDouble, Bath, Maximize, MapPin } from "lucide-react";
import { formatPrice } from "@/lib/api";

const TYPE_LABEL = { buy: "For Sale", rent: "For Rent", shortstay: "Short Stay" };

export default function PropertyCard({ property, index = 0 }) {
  const img = property.images?.[0];
  return (
    <motion.div
      data-testid={`property-card-${property.id}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
    >
      <Link to={`/property/${property.id}`} className="group block">
        <div className="relative overflow-hidden rounded-2xl border border-white/10">
          <div className="aspect-[4/3] overflow-hidden bg-slate-900">
            {img ? (
              <img
                src={img}
                alt={property.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-600">
                No image
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
          <span className="absolute left-3 top-3 rounded-full bg-indigo-600/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur">
            {TYPE_LABEL[property.type] || property.type}
          </span>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="font-display text-xl font-semibold text-white">
              {formatPrice(property.price, property.price_unit)}
            </p>
          </div>
        </div>

        <div className="px-1 pt-4">
          <h3 className="line-clamp-1 text-lg font-medium text-white transition-colors group-hover:text-indigo-300">
            {property.title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm capitalize text-slate-400">
            <MapPin size={14} className="text-indigo-400" />
            {property.city}
          </p>
          <div className="mt-3 flex items-center gap-4 border-t border-white/10 pt-3 text-sm text-slate-400">
            {property.category === "land-plots" ? (
              <span className="flex items-center gap-1.5">
                <Maximize size={15} /> {property.area_sqft} sqft plot
              </span>
            ) : (
              <>
                <span className="flex items-center gap-1.5">
                  <BedDouble size={15} /> {property.bedrooms}
                </span>
                <span className="flex items-center gap-1.5">
                  <Bath size={15} /> {property.bathrooms}
                </span>
                <span className="flex items-center gap-1.5">
                  <Maximize size={15} /> {property.area_sqft}
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
