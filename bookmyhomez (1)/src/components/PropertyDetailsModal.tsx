import React, { useState } from 'react';
import { Property, User } from '../types';
import {
  X,
  MapPin,
  MessageCircle,
  RefreshCw,
  Lock,
  CheckCircle,
  Building,
  Home,
  Check,
  Share2,
} from 'lucide-react';

interface PropertyDetailsModalProps {
  property: Property | null;
  currentUser: User | null;
  onClose: () => void;
  onToggleStatus: (property: Property) => void;
  formatCurrency: (val: number) => string;
}

export const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  property,
  currentUser,
  onClose,
  onToggleStatus,
  formatCurrency,
}) => {
  const [copied, setCopied] = useState(false);
  if (!property) return null;

  const isOwner =
    currentUser &&
    (currentUser.id === property.ownerId || currentUser.role === 'Administrator');

  const whatsappMessage = encodeURIComponent(
    `Hi, I am interested in your property "${property.title}" listed on BookMyHomez for ₹${formatCurrency(
      property.price
    )}.`
  );

  const handleShare = () => {
    const shareText = `Check out "${property.title}" in ${property.locality}, ${property.city} for ₹${formatCurrency(property.price)} on BookMyHomez!`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      navigator
        .share({
          title: property.title,
          text: shareText,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cover Image */}
        <div className="relative h-72 rounded-2xl overflow-hidden mb-6 bg-slate-950">
          <img
            src={
              property.images && property.images[0]
                ? property.images[0]
                : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80'
            }
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-slate-950/80 backdrop-blur-md text-indigo-300 text-xs font-bold px-3 py-1 rounded-full uppercase border border-indigo-500/30">
              {property.category}
            </span>
            <span
              className={`text-xs font-black px-3.5 py-1.5 rounded-xl uppercase shadow-2xl flex items-center gap-1.5 border backdrop-blur-md ${
                property.status === 'Booked'
                  ? 'bg-rose-600 text-white border-rose-400'
                  : 'bg-emerald-500 text-slate-950 border-emerald-300'
              }`}
            >
              {property.status === 'Booked' ? (
                <Lock className="w-3.5 h-3.5" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5" />
              )}
              {property.status || 'Available'}
            </span>
          </div>

          <button
            onClick={handleShare}
            className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 hover:bg-indigo-600 transition cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-indigo-400" />
            <span>{copied ? 'Link Copied!' : 'Share Property'}</span>
          </button>
        </div>

        {/* Title & Location */}
        <h2 className="text-2xl font-black text-white mb-1">{property.title}</h2>
        <p className="text-xs text-slate-400 mb-3 flex items-center gap-1">
          <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            {property.locality}, {property.city}
          </span>
        </p>

        <div className="text-3xl font-black text-emerald-400 mb-6">
          ₹{formatCurrency(property.price)}
          {property.category === 'Rent' && (
            <span className="text-xs text-slate-400 font-normal ml-1">/ month</span>
          )}
        </div>

        {/* Specs Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800 mb-6 text-xs">
          <div>
            <span className="text-slate-500 block">Sub-Type:</span>
            <span className="font-bold text-white flex items-center gap-1 mt-0.5">
              <Building className="w-3.5 h-3.5 text-indigo-400" />
              {property.subType || 'Apartment'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">BHK Config:</span>
            <span className="font-bold text-white flex items-center gap-1 mt-0.5">
              <Home className="w-3.5 h-3.5 text-indigo-400" />
              {property.bhk || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Built-up Area:</span>
            <span className="font-bold text-white mt-0.5 block">
              {property.area} sq.ft
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Furnishing:</span>
            <span className="font-bold text-white mt-0.5 block">
              {property.furnishing || 'Semi Furnished'}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Description & Highlights
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800">
            {property.description}
          </p>
        </div>

        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Society Amenities
            </h4>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="bg-indigo-500/10 text-indigo-300 text-xs px-3 py-1.5 rounded-xl border border-indigo-500/20 flex items-center gap-1.5 font-medium"
                >
                  <Check className="w-3.5 h-3.5 text-indigo-400" />
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/919916475749?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-600/30"
            >
              <MessageCircle className="w-4 h-4 fill-white" /> WhatsApp Owner
            </a>

            <button
              onClick={handleShare}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-3 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-indigo-400" /> Share
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && (
              <button
                onClick={() => onToggleStatus(property)}
                className="bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 font-bold px-4 py-3 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Toggle Status ({property.status || 'Available'})
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-3 rounded-xl text-xs font-bold cursor-pointer transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
