import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, Instagram, Facebook, Youtube } from "lucide-react";
import { BRAND, whatsappLink } from "@/lib/config";

const WhatsAppIcon = ({ size = 17 }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className="fill-current">
    <path d="M16.004 3C9.383 3 4 8.383 4 15.004c0 2.117.555 4.184 1.61 6.008L4 29l8.184-1.57a12 12 0 0 0 3.82.625h.004C22.629 28.055 28 22.672 28 16.05 28 9.43 22.625 3 16.004 3Zm0 21.906h-.004a9.9 9.9 0 0 1-3.375-.594l-.242-.098-4.855.934.965-4.73-.157-.243a9.86 9.86 0 0 1-1.52-5.078c0-5.48 4.461-9.938 9.945-9.938 2.656 0 5.152 1.035 7.031 2.914a9.86 9.86 0 0 1 2.914 7.027c-.004 5.48-4.461 9.938-9.949 9.938Zm5.457-7.442c-.297-.148-1.762-.87-2.035-.969-.273-.098-.473-.148-.672.15-.199.296-.77.968-.945 1.167-.172.199-.348.223-.645.075-.297-.15-1.258-.464-2.394-1.477-.883-.789-1.48-1.762-1.652-2.059-.172-.297-.02-.457.129-.605.133-.133.297-.348.445-.523.149-.172.199-.297.297-.496.098-.199.05-.372-.024-.52-.075-.148-.672-1.62-.918-2.219-.242-.582-.488-.504-.672-.512l-.573-.011c-.199 0-.522.074-.796.371-.273.297-1.043 1.02-1.043 2.488 0 1.469 1.066 2.887 1.215 3.086.148.199 2.098 3.203 5.078 4.492.71.309 1.262.492 1.695.629.712.227 1.36.195 1.872.117.571-.086 1.762-.719 2.008-1.414.246-.695.246-1.293.172-1.414-.074-.121-.273-.199-.57-.348Z" />
  </svg>
);

const SOCIALS = [
  { key: "whatsapp", href: whatsappLink(), Icon: WhatsAppIcon, label: "WhatsApp" },
  { key: "instagram", href: BRAND.instagram, Icon: Instagram, label: "Instagram" },
  { key: "facebook", href: BRAND.facebook, Icon: Facebook, label: "Facebook" },
  { key: "youtube", href: BRAND.youtube, Icon: Youtube, label: "YouTube" },
];

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
          <div className="hidden items-center gap-1.5 lg:flex">
            {SOCIALS.map(({ key, href, Icon, label }) => (
              <a
                key={key}
                data-testid={`nav-social-${key}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-300 transition-all duration-300 hover:border-indigo-500 hover:bg-indigo-600 hover:text-white"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
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
          <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4">
            {SOCIALS.map(({ key, href, Icon, label }) => (
              <a
                key={key}
                data-testid={`nav-mobile-social-${key}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-300 transition-colors hover:bg-indigo-600 hover:text-white"
              >
                <Icon size={17} />
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
