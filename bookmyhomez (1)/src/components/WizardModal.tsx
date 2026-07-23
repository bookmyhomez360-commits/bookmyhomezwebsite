import React, { useState } from 'react';
import { WizardData, Property, CategoryType } from '../types';
import {
  X,
  MapPin,
  Crosshair,
  Search,
  PlusCircle,
  Armchair,
  ShieldAlert,
  Camera,
  Video,
  CheckCircle,
  Lock,
  CloudUpload,
  ArrowLeft,
  ArrowRight,
  Check,
} from 'lucide-react';

interface WizardModalProps {
  isOpen: boolean;
  isEditing: boolean;
  editingId: number | null;
  currentUser: any;
  onClose: () => void;
  onPublish: (wizardData: WizardData, isEditing: boolean, editingId: number | null) => void;
  formatCurrency: (val: number) => string;
}

const STEP_TITLES = [
  'Basic Intent & Title',
  'Property Location & GPS',
  'Property Configuration Details',
  'Furnishings, Amenities & Pricing',
  'Media Photos & Video Upload',
  'Summary & Final Preview',
];

const SOCIETY_PRESETS = [
  'Prestige Shantiniketan',
  'Lodha Park',
  'Godrej Woods',
  'Sobha Dream Acres',
  'Brigade Meadows',
  'DLF CyberCity',
];

const AMENITY_OPTIONS = [
  'Lift',
  'Power Backup',
  'CCTV Security',
  'Swimming Pool',
  'Gymnasium',
  'Park / Garden',
  'Clubhouse',
  'Intercom',
];

export const WizardModal: React.FC<WizardModalProps> = ({
  isOpen,
  isEditing,
  editingId,
  onClose,
  onPublish,
  formatCurrency,
}) => {
  const [wizardStep, setWizardStep] = useState(1);
  const [societySearchQuery, setSocietySearchQuery] = useState('');

  const [wizardData, setWizardData] = useState<WizardData>({
    title: '',
    propType: 'Residential',
    category: 'Buy',
    status: 'Available',
    city: 'Bengaluru',
    locality: 'Indiranagar',
    subType: 'Apartment',
    bhk: '3 BHK',
    area: 1500,
    propertyAge: '1-5 Years',
    bathrooms: '2',
    balconies: '1',
    furnishing: 'Fully Furnished',
    furnishings: { Sofa: 1, Fridge: 1, AC: 2, TV: 1, Wardrobe: 2 },
    amenities: ['Lift', 'Power Backup', 'CCTV Security'],
    price: 12500000,
    deposit: 100000,
    availDate: '2026-03-01',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    ],
  });

  if (!isOpen) return null;

  const progressPercent = Math.round((wizardStep / 6) * 100);

  const filteredSocieties = societySearchQuery
    ? SOCIETY_PRESETS.filter((s) =>
        s.toLowerCase().includes(societySearchQuery.toLowerCase())
      )
    : [];

  const useCurrentGPSLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setWizardData((prev) => ({
            ...prev,
            locality: 'Indiranagar Prime (GPS Verified)',
          }));
          alert('Successfully fetched GPS location coordinates!');
        },
        () => {
          alert('Location access denied. Using default location.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const addSocietyManually = () => {
    if (societySearchQuery) {
      setWizardData((prev) => ({ ...prev, locality: societySearchQuery }));
      setSocietySearchQuery('');
    }
  };

  const toggleAmenity = (amenity: string) => {
    setWizardData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const addDemoImage = () => {
    if (wizardData.images.length < 30) {
      const presets = [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80',
      ];
      setWizardData((prev) => ({
        ...prev,
        images: [...prev.images, presets[prev.images.length % presets.length]],
      }));
    } else {
      alert('Maximum 30 images allowed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                {isEditing ? 'Edit Property' : 'Post Property Wizard'}
              </span>
              <h3 className="text-base sm:text-lg font-black text-white mt-1">
                Step {wizardStep} of 6: {STEP_TITLES[wizardStep - 1]}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-800 h-2.5 rounded-full overflow-hidden relative border border-slate-700/50">
              <div
                className="bg-gradient-to-r from-violet-500 via-amber-400 to-indigo-500 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-xs font-black text-indigo-400">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* STEP 1 */}
          {wizardStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Property Name / Title *
                </label>
                <input
                  type="text"
                  value={wizardData.title}
                  onChange={(e) =>
                    setWizardData({ ...wizardData, title: e.target.value })
                  }
                  placeholder="e.g. Skyline Luxury 3BHK Apartment in Indiranagar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Property Type *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Residential', 'Commercial'].map((t) => (
                      <button
                        key={t}
                        onClick={() =>
                          setWizardData({ ...wizardData, propType: t })
                        }
                        className={`p-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                          wizardData.propType === t
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Listing Intent *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      ['Buy', 'Rent', 'Short Stay', 'Plots', 'PG/Co-living'] as CategoryType[]
                    ).map((cat) => (
                      <button
                        key={cat}
                        onClick={() =>
                          setWizardData({ ...wizardData, category: cat })
                        }
                        className={`p-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          wizardData.category === cat
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Initial Availability Status *
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() =>
                      setWizardData({ ...wizardData, status: 'Available' })
                    }
                    className={`flex-1 p-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                      wizardData.status !== 'Booked'
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" /> Available
                  </button>
                  <button
                    onClick={() =>
                      setWizardData({ ...wizardData, status: 'Booked' })
                    }
                    className={`flex-1 p-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                      wizardData.status === 'Booked'
                        ? 'bg-rose-600 text-white shadow-lg'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <Lock className="w-4 h-4" /> Booked
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {wizardStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300">
                  Property Location & Society *
                </label>
                <button
                  onClick={useCurrentGPSLocation}
                  className="text-xs bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white px-3.5 py-2 rounded-xl border border-indigo-500/30 transition flex items-center gap-1.5 cursor-pointer font-bold"
                >
                  <Crosshair className="w-3.5 h-3.5" /> Use Current Location
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    City *
                  </label>
                  <select
                    value={wizardData.city}
                    onChange={(e) =>
                      setWizardData({ ...wizardData, city: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-bold focus:outline-none"
                  >
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Pune">Pune</option>
                    <option value="Jaipur">Jaipur</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Locality / Area *
                  </label>
                  <input
                    type="text"
                    value={wizardData.locality}
                    onChange={(e) =>
                      setWizardData({ ...wizardData, locality: e.target.value })
                    }
                    placeholder="e.g. Indiranagar, Koramangala..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Search Building / Society Auto-complete
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={societySearchQuery}
                    onChange={(e) => setSocietySearchQuery(e.target.value)}
                    placeholder="Type society name e.g. Prestige Shantiniketan..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-3 text-xs text-white"
                  />
                </div>

                {societySearchQuery && (
                  <div className="mt-2 bg-slate-950 border border-slate-800 rounded-xl p-2 space-y-1">
                    {filteredSocieties.map((soc) => (
                      <div
                        key={soc}
                        onClick={() => {
                          setWizardData({ ...wizardData, locality: soc });
                          setSocietySearchQuery('');
                        }}
                        className="px-3 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-300 cursor-pointer flex items-center justify-between"
                      >
                        <span>
                          <MapPin className="w-3.5 h-3.5 text-indigo-400 inline mr-2" />
                          {soc}
                        </span>
                        <span className="text-[10px] text-indigo-400 font-bold">
                          Select
                        </span>
                      </div>
                    ))}
                    <div
                      onClick={addSocietyManually}
                      className="px-3 py-2 rounded-lg hover:bg-slate-800 text-xs text-amber-400 cursor-pointer flex items-center gap-2 border-t border-slate-800"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Add "{societySearchQuery}" Manually
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {wizardStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Sub-Type
                  </label>
                  <select
                    value={wizardData.subType}
                    onChange={(e) =>
                      setWizardData({ ...wizardData, subType: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-semibold"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Independent House / Villa">
                      Independent House / Villa
                    </option>
                    <option value="Builder Floor">Builder Floor</option>
                    <option value="Studio Apartment">Studio Apartment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    BHK Config
                  </label>
                  <select
                    value={wizardData.bhk}
                    onChange={(e) =>
                      setWizardData({ ...wizardData, bhk: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-semibold"
                  >
                    <option value="1 RK">1 RK</option>
                    <option value="1 BHK">1 BHK</option>
                    <option value="1.5 BHK">1.5 BHK</option>
                    <option value="2 BHK">2 BHK</option>
                    <option value="2.5 BHK">2.5 BHK</option>
                    <option value="3 BHK">3 BHK</option>
                    <option value="3.5 BHK">3.5 BHK</option>
                    <option value="4+ BHK">4+ BHK / Villa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Built-up Area (sq.ft)
                  </label>
                  <input
                    type="number"
                    value={wizardData.area}
                    onChange={(e) =>
                      setWizardData({
                        ...wizardData,
                        area: Number(e.target.value),
                      })
                    }
                    placeholder="1500"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Age of Property (yrs)
                  </label>
                  <input
                    type="text"
                    value={wizardData.propertyAge}
                    onChange={(e) =>
                      setWizardData({ ...wizardData, propertyAge: e.target.value })
                    }
                    placeholder="e.g. 1-5 Years"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Bathrooms
                  </label>
                  <select
                    value={wizardData.bathrooms}
                    onChange={(e) =>
                      setWizardData({ ...wizardData, bathrooms: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4+">4+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Balconies
                  </label>
                  <select
                    value={wizardData.balconies}
                    onChange={(e) =>
                      setWizardData({ ...wizardData, balconies: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  >
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3+">3+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Furnishing Status
                  </label>
                  <select
                    value={wizardData.furnishing}
                    onChange={(e) =>
                      setWizardData({ ...wizardData, furnishing: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-bold text-indigo-400"
                  >
                    <option value="Fully Furnished">Fully Furnished</option>
                    <option value="Semi Furnished">Semi Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {wizardStep === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
                  <Armchair className="w-4 h-4 text-indigo-400" /> Flat Furnishings & Appliances (Select Qty)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    'Sofa',
                    'Fridge',
                    'AC',
                    'TV',
                    'Wardrobe',
                    'Washing Machine',
                    'Microwave',
                    'Chimney',
                  ].map((item) => (
                    <div
                      key={item}
                      className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col items-center"
                    >
                      <span className="text-xs font-bold text-white mb-2">{item}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setWizardData((prev) => ({
                              ...prev,
                              furnishings: {
                                ...prev.furnishings,
                                [item]: Math.max(0, (prev.furnishings[item] || 0) - 1),
                              },
                            }))
                          }
                          className="w-7 h-7 rounded-lg bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-indigo-400 w-5 text-center">
                          {wizardData.furnishings[item] || 0}
                        </span>
                        <button
                          onClick={() =>
                            setWizardData((prev) => ({
                              ...prev,
                              furnishings: {
                                ...prev.furnishings,
                                [item]: (prev.furnishings[item] || 0) + 1,
                              },
                            }))
                          }
                          className="w-7 h-7 rounded-lg bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" /> Society Amenities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AMENITY_OPTIONS.map((amenity) => {
                    const active = wizardData.amenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                          active
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {active && <Check className="w-3.5 h-3.5" />} {amenity}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Monthly Rent / Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={wizardData.price}
                    onChange={(e) =>
                      setWizardData({
                        ...wizardData,
                        price: Number(e.target.value),
                      })
                    }
                    placeholder="45000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-black text-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Security Deposit (₹)
                  </label>
                  <input
                    type="number"
                    value={wizardData.deposit}
                    onChange={(e) =>
                      setWizardData({
                        ...wizardData,
                        deposit: Number(e.target.value),
                      })
                    }
                    placeholder="100000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Availability Date
                  </label>
                  <input
                    type="date"
                    value={wizardData.availDate}
                    onChange={(e) =>
                      setWizardData({ ...wizardData, availDate: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {wizardStep === 5 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-indigo-400" /> Photos & Video Upload
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  Support up to 30 images and 2 videos. First image is automatically set as Cover Photo.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  {wizardData.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative h-28 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group"
                    >
                      <img src={img} alt="Property" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-2 left-2 bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">
                          Cover Photo
                        </span>
                      )}
                      <button
                        onClick={() =>
                          setWizardData((prev) => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== idx),
                          }))
                        }
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs opacity-80 hover:opacity-100 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <div
                    onClick={addDemoImage}
                    className="h-28 rounded-2xl border-2 border-dashed border-slate-800 hover:border-indigo-500 bg-slate-950 flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-white transition"
                  >
                    <PlusCircle className="w-5 h-5 mb-1" />
                    <span className="text-[11px] font-bold">Add Photo</span>
                    <span className="text-[9px] text-slate-500">
                      ({wizardData.images.length}/30)
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Video Walkthrough (Max 2 videos)
                </label>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
                  <Video className="w-6 h-6 text-indigo-400" />
                  <div className="text-xs">
                    <p className="font-bold text-white">
                      Video Walkthrough HD Preset Attached
                    </p>
                    <p className="text-[10px] text-slate-500">
                      1 video uploaded successfully
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6 */}
          {wizardStep === 6 && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 font-black px-3 py-1 rounded-full uppercase">
                      {wizardData.category}
                    </span>
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-full uppercase ${
                        wizardData.status === 'Booked'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {wizardData.status || 'Available'}
                    </span>
                  </div>
                  <span className="text-xl font-black text-emerald-400">
                    ₹{formatCurrency(wizardData.price)}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white">{wizardData.title}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  {wizardData.locality}, {wizardData.city}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 block">Type:</span>
                    <span className="font-bold text-white">{wizardData.subType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Config:</span>
                    <span className="font-bold text-white">{wizardData.bhk}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Area:</span>
                    <span className="font-bold text-white">{wizardData.area} sq.ft</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Furnishing:</span>
                    <span className="font-bold text-white">
                      {wizardData.furnishing}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Controls */}
        <div className="p-5 border-t border-slate-800 bg-slate-950 flex justify-between items-center">
          {wizardStep > 1 ? (
            <button
              onClick={() => setWizardStep((prev) => prev - 1)}
              className="px-5 py-2.5 border border-slate-800 rounded-xl text-xs text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div></div>
          )}

          {wizardStep < 6 ? (
            <button
              onClick={() => setWizardStep((prev) => prev + 1)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer flex items-center gap-1.5"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => onPublish(wizardData, isEditing, editingId)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black px-7 py-3 rounded-xl text-xs shadow-xl shadow-amber-500/20 transition cursor-pointer flex items-center gap-2"
            >
              <CloudUpload className="w-4 h-4" /> Publish via POST (/api/properties)
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
