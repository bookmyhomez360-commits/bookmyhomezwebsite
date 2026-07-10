import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, Phone, Mail, MapPin } from "lucide-react";
import { BRAND, whatsappLink } from "@/lib/config";

const QUICK = [
  { label: "About Us", to: "/#manifesto" },
  { label: "Buy", to: "/search?type=buy" },
  { label: "Rent", to: "/search?type=rent" },
  { label: "Short Stays", to: "/search?type=shortstay" },
  { label: "Agents", to: "/search?tab=agents" },
];

export default function Footer({ onListClick }) {
  return (
    <footer data-testid="footer" className="relative border-t border-white/10 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <img src={BRAND.logo} alt="BookMyHomez" className="h-12 w-12 rounded-xl bg-white object-contain p-0.5" />
              <div>
                <p className="font-display text-xl font-semibold text-white">BookMyHomez</p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Your Happy Home Partner</p>
              </div>
            </div>
            <p className="mt-6 max-w-sm text-slate-400">
              Curated homes to buy, rent and stay across India&apos;s most-loved
              cities — with honest pricing and a partner who genuinely cares.
            </p>
            <div className="mt-6 flex gap-3">
              <a data-testid="social-whatsapp" href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-slate-300 transition-all duration-300 hover:border-indigo-500 hover:bg-indigo-600 hover:text-white">
                <svg viewBox="0 0 32 32" className="h-5 w-5 fill-current"><path d="M16.004 3C9.383 3 4 8.383 4 15.004c0 2.117.555 4.184 1.61 6.008L4 29l8.184-1.57a12 12 0 0 0 3.82.625h.004C22.629 28.055 28 22.672 28 16.05 28 9.43 22.625 3 16.004 3Zm0 21.906h-.004a9.9 9.9 0 0 1-3.375-.594l-.242-.098-4.855.934.965-4.73-.157-.243a9.86 9.86 0 0 1-1.52-5.078c0-5.48 4.461-9.938 9.945-9.938 2.656 0 5.152 1.035 7.031 2.914a9.86 9.86 0 0 1 2.914 7.027c-.004 5.48-4.461 9.938-9.949 9.938Zm5.457-7.442c-.297-.148-1.762-.87-2.035-.969-.273-.098-.473-.148-.672.15-.199.296-.77.968-.945 1.167-.172.199-.348.223-.645.075-.297-.15-1.258-.464-2.394-1.477-.883-.789-1.48-1.762-1.652-2.059-.172-.297-.02-.457.129-.605.133-.133.297-.348.445-.523.149-.172.199-.297.297-.496.098-.199.05-.372-.024-.52-.075-.148-.672-1.62-.918-2.219-.242-.582-.488-.504-.672-.512l-.573-.011c-.199 0-.522.074-.796.371-.273.297-1.043 1.02-1.043 2.488 0 1.469 1.066 2.887 1.215 3.086.148.199 2.098 3.203 5.078 4.492.71.309 1.262.492 1.695.629.712.227 1.36.195 1.872.117.571-.086 1.762-.719 2.008-1.414.246-.695.246-1.293.172-1.414-.074-.121-.273-.199-.57-.348Z" /></svg>
              </a>
              <a data-testid="social-instagram" href={BRAND.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-slate-300 transition-all duration-300 hover:border-indigo-500 hover:bg-indigo-600 hover:text-white">
                <Instagram size={19} />
              </a>
              <a data-testid="social-facebook" href={BRAND.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-slate-300 transition-all duration-300 hover:border-indigo-500 hover:bg-indigo-600 hover:text-white">
                <Facebook size={19} />
              </a>
              <a data-testid="social-youtube" href={BRAND.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-slate-300 transition-all duration-300 hover:border-indigo-500 hover:bg-indigo-600 hover:text-white">
                <Youtube size={19} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-5 text-sm uppercase tracking-[0.2em] text-white">Quick Links</h4>
            <ul className="space-y-3">
              {QUICK.map((q) => (
                <li key={q.label}>
                  <Link data-testid={`footer-link-${q.label.toLowerCase().replace(/\s/g, "-")}`} to={q.to} className="text-slate-400 transition-colors hover:text-indigo-300">
                    {q.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-sm uppercase tracking-[0.2em] text-white">Company</h4>
            <ul className="space-y-3">
              <li><button data-testid="footer-list-with-us" onClick={onListClick} className="text-slate-400 transition-colors hover:text-indigo-300">List with Us</button></li>
              <li><a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="text-slate-400 transition-colors hover:text-indigo-300">Contact</a></li>
              <li><Link to="/search" className="text-slate-400 transition-colors hover:text-indigo-300">All Listings</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-sm uppercase tracking-[0.2em] text-white">Get in touch</h4>
            <ul className="space-y-4 text-slate-400">
              <li>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 transition-colors hover:text-indigo-300">
                  <Phone size={17} className="mt-0.5 text-indigo-400" />
                  <span>+91 {BRAND.whatsapp}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${BRAND.email}`} className="flex items-start gap-3 transition-colors hover:text-indigo-300">
                  <Mail size={17} className="mt-0.5 text-indigo-400" />
                  <span>{BRAND.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={17} className="mt-0.5 text-indigo-400" />
                <span>{BRAND.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 text-sm text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} BookMyHomez. All rights reserved.</p>
          <p>Made with care for happy homes.</p>
        </div>
      </div>
    </footer>
  );
}
