import React from 'react';
import { Logo } from './Logo';
import { CategoryType } from '../types';
import {
  MessageCircle,
  Instagram,
  Mail,
  Youtube,
  Facebook,
} from 'lucide-react';

interface FooterProps {
  navigateToCategory: (cat: CategoryType) => void;
  filterByLocation: (city: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  navigateToCategory,
  filterByLocation,
}) => {
  return (
    <footer className="bg-[#05070E] border-t border-slate-800/80 text-slate-400 py-12 mt-20 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800/80">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-16 px-2.5 py-1 flex items-center justify-center bg-white rounded-xl shadow-md border border-slate-700/30 overflow-hidden">
                <Logo className="h-14 w-auto max-w-full" />
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              BookMyHomez is India’s premier verified real estate portal connecting home
              seekers, owners, and agents with total clarity and zero brokerage friction.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => navigateToCategory('Buy')}
                  className="hover:text-indigo-400 transition cursor-pointer"
                >
                  Homes for Sale
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToCategory('Rent')}
                  className="hover:text-indigo-400 transition cursor-pointer"
                >
                  Rental Flats & PGs
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToCategory('Short Stay')}
                  className="hover:text-indigo-400 transition cursor-pointer"
                >
                  Short Stays & Resorts
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToCategory('Plots')}
                  className="hover:text-indigo-400 transition cursor-pointer"
                >
                  Land & Residential Plots
                </button>
              </li>
            </ul>
          </div>

          {/* Prime Cities */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Prime Cities
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => filterByLocation('Bengaluru')}
                  className="hover:text-indigo-400 transition cursor-pointer"
                >
                  Bengaluru Real Estate
                </button>
              </li>
              <li>
                <button
                  onClick={() => filterByLocation('Mumbai')}
                  className="hover:text-indigo-400 transition cursor-pointer"
                >
                  Mumbai Properties
                </button>
              </li>
              <li>
                <button
                  onClick={() => filterByLocation('Pune')}
                  className="hover:text-indigo-400 transition cursor-pointer"
                >
                  Pune Properties
                </button>
              </li>
              <li>
                <button
                  onClick={() => filterByLocation('Jaipur')}
                  className="hover:text-indigo-400 transition cursor-pointer"
                >
                  Jaipur Villas & Plots
                </button>
              </li>
            </ul>
          </div>

          {/* Social Links & Contact */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Connect With Us
            </h4>
            <div className="flex items-center gap-3 mb-4">
              <a
                href="https://wa.me/919916475749"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500 text-emerald-400 flex items-center justify-center transition"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4 fill-emerald-400" />
              </a>

              <a
                href="https://www.instagram.com/book.myhomez?igsh=MXJ1NXAyMGdybzdzaA=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-pink-500 text-pink-400 flex items-center justify-center transition"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href="mailto:bookmyhomez360@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500 text-rose-400 flex items-center justify-center transition"
                title="Email"
              >
                <Mail className="w-4 h-4" />
              </a>

              <a
                href="https://youtube.com/@bookmyhomez?si=uf7lYpboUeimRswW"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500 text-red-500 flex items-center justify-center transition"
                title="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>

              <a
                href="https://www.facebook.com/profile.php?id=61579564084213&mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500 text-blue-400 flex items-center justify-center transition"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
            <p className="text-[11px] text-slate-500">Phone: +91 9916475749</p>
          </div>

        </div>

        <div className="pt-8 text-center text-[11px] text-slate-600">
          © 2026 BookMyHomez. All rights reserved. Your Happy Home Partner.
        </div>
      </div>
    </footer>
  );
};
