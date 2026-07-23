import React, { useState } from 'react';
import { Property, User } from '../types';
import {
  MapPin,
  Heart,
  Eye,
  RefreshCw,
  Edit,
  Trash2,
  Lock,
  CheckCircle,
  Share2,
  Check,
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  currentUser: User | null;
  isSaved: boolean;
  onToggleSave: (id: number) => void;
  onViewDetails: (property: Property) => void;
  onToggleStatus: (property: Property) => void;
  onEdit: (property: Property) => void;
  onDelete: (id: number) => void;
  formatCurrency: (val: number) => string;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  currentUser,
  isSaved,
  onToggleSave,
  onViewDetails,
  onToggleStatus,
  onEdit,
  onDelete,
  formatCurrency,
}) => {
  const [copied, setCopied] = useState(false);
  const isOwner = currentUser && (currentUser.id === property.ownerId || currentUser.role === 'Administrator');

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-800 hover:border-indigo-500/50 transition duration-300 flex flex-col group relative">
      
      {/* Property Image Container */}
      <div className="relative h-60 overflow-hidden bg-slate-900">
        <img
          src={property.images && property.images[0] ? property.images[0] : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />

        {/* Category Tag */}
        <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-indigo-300 text-[10px] font-black px-3 py-1 rounded-full uppercase border border-indigo-500/30">
          {property.category}
        </span>

        {/* PROMINENT AVAILABLE / BOOKED SLAB BADGE */}
        <span
          className={`absolute top-3 right-3 px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wide shadow-2xl border backdrop-blur-md flex items-center gap-1.5 ${
            property.status === 'Booked'
              ? 'bg-rose-600/95 text-white border-rose-400'
              : 'bg-emerald-500/95 text-slate-950 border-emerald-300'
          }`}
        >
          {property.status === 'Booked' ? (
            <Lock className="w-3 h-3 text-white" />
          ) : (
            <CheckCircle className="w-3 h-3 text-slate-950" />
          )}
          {property.status || 'Available'}
        </span>

        {/* Top Right Buttons: Share & Favorite */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-slate-950/80 text-slate-300 hover:text-indigo-400 flex items-center justify-center transition cursor-pointer"
            title="Share Property"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(property.id);
            }}
            className="w-9 h-9 rounded-full bg-slate-950/80 text-slate-300 hover:text-rose-500 flex items-center justify-center transition cursor-pointer"
            title="Save Property"
          >
            <Heart
              className={`w-4 h-4 ${isSaved ? 'text-rose-500 fill-rose-500' : ''}`}
            />
          </button>
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-3 left-3 text-white">
          <div className="text-2xl font-black text-emerald-400 drop-shadow-md">
            ₹{formatCurrency(property.price)}
          </div>
        </div>
      </div>

      {/* Property Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition line-clamp-1 mb-1">
            {property.title}
          </h3>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">
              {property.locality}, {property.city}
            </span>
          </p>
          <p className="text-[11px] text-slate-500 mb-4 flex items-center justify-between">
            <span>
              Listed by:{' '}
              <span className="text-slate-300 font-bold">
                {property.ownerName || 'Verified Agent'}
              </span>
            </span>
            {copied && (
              <span className="text-emerald-400 font-bold text-[10px]">
                Link Copied!
              </span>
            )}
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <button
            onClick={() => onViewDetails(property)}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" /> View Details
          </button>

          <button
            onClick={handleShare}
            className="p-2.5 bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 rounded-xl text-xs font-bold transition cursor-pointer"
            title="Share Property"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>

          {isOwner && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onToggleStatus(property)}
                className="px-2.5 py-2.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 rounded-xl text-xs font-bold transition cursor-pointer"
                title="Toggle Available / Booked"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onEdit(property)}
                className="px-2.5 py-2.5 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                title="Edit Property"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(property.id)}
                className="px-2.5 py-2.5 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                title="Delete Property"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
