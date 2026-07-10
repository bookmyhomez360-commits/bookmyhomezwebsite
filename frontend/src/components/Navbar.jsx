import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { BRAND } from "@/lib/config";

const LINKS = [
  { label: "Buy", to: "/search?type=buy" },
  { label: "Rent", to: "/search?type=rent" },
  { label: "Short Stays", to: "/search?type=shortstay" },
  { label: "Agents", to: "/search?tab=agents" },
];

export default function Navbar({ onListClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      data-testid="navbar"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-slate-950/80 backdrop-blur-xl border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link
          to="/"
          data-testid="nav-logo"
          className="flex items-center gap-3"
        >
          <img
            src={BRAND.logo}
            alt="BookMyHomez"
            className="h-11 w-11 rounded-xl bg-white object-contain p-0.5"
          />
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold text-white">
              BookMyHomez
            </p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
              Happy Home Partner
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase().replace(/\s/g, "-")}`}
              className="group relative text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-indigo-500 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            data-testid="nav-list-property"
            onClick={onListClick}
            className="hidden rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-transform duration-200 hover:bg-indigo-500 active:scale-95 md:inline-flex"
          >
            List your property
          </button>
          <button
            data-testid="nav-mobile-toggle"
            className="text-white md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="overflow-hidden border-t border-white/10 bg-slate-950/95 px-4 py-4 md:hidden"
        >
          {LINKS.map((l) => (
            <button
              key={l.label}
              data-testid={`nav-mobile-${l.label.toLowerCase().replace(/\s/g, "-")}`}
              onClick={() => {
                navigate(l.to);
                setOpen(false);
              }}
              className="block w-full py-3 text-left text-slate-200"
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              onListClick?.();
            }}
            className="mt-3 w-full rounded-full bg-indigo-600 py-3 font-semibold text-white"
          >
            List your property — free
          </button>
        </motion.div>
      )}
    </motion.header>
  );
}
