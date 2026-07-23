import React, { useState, useEffect } from 'react';
import { Home, ChevronLeft, ChevronRight, Sparkles, Maximize2, Minimize2, Play, Pause, MapPin, X, Eye } from 'lucide-react';

export interface VillaInfo {
  name: string;
  tagline: string;
  location: string;
  image: string;
  price: string;
  bhk: string;
  heroHeadline: string;
  heroHighlight: string;
  heroSubtext: string;
  badgeText: string;
}

export const REAL_VILLA_LIST: VillaInfo[] = [
  {
    name: 'Prestige Luxury Pool Villa',
    tagline: 'Modern 4 BHK Independent Villa with Infinity Pool & Private Lawn',
    location: 'Indiranagar, Bengaluru',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=85',
    price: '₹2.45 Cr',
    bhk: '4 BHK Villa',
    heroHeadline: 'Find a home you’ll ',
    heroHighlight: 'actually want to come back to',
    heroSubtext: 'Explore 4 BHK luxury pool villas in Indiranagar, Bengaluru with private lawns, sunlit living & smart security.',
    badgeText: '✨ 100% Verified Luxury Villa • Indiranagar, Bengaluru',
  },
  {
    name: 'Grand Mediterranean Estate',
    tagline: 'Architectural Glass & Teak Wood Villa with Landscaped Gardens',
    location: 'Jubilee Hills, Hyderabad',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85',
    price: '₹3.80 Cr',
    bhk: '5 BHK Villa',
    heroHeadline: 'Palatial Mediterranean living in ',
    heroHighlight: 'Tuscan Stone & Teak Wood',
    heroSubtext: '5 BHK architectural estate in Jubilee Hills, Hyderabad with landscaped courtyards & rooftop terraces.',
    badgeText: '👑 Royal Tuscan Mansion • Jubilee Hills, Hyderabad',
  },
  {
    name: 'Pacific Coastal Glass House',
    tagline: 'Sunlit Coastal Luxury Residence with Panoramic Balconies',
    location: 'ECR Coast Road, Chennai',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=85',
    price: '₹1.95 Cr',
    bhk: '3 BHK Villa',
    heroHeadline: 'Fresh sea breeze & ',
    heroHighlight: 'panoramic oceanview balconies',
    heroSubtext: '3 BHK coastal glass sanctuary along ECR, Chennai featuring double-height ceilings & private sun deck.',
    badgeText: '🌊 Coastal Beachfront Villa • ECR Road, Chennai',
  },
  {
    name: 'Sunset Horizon Smart Mansion',
    tagline: 'Illuminated Night Mansion with Smart Home Automation & Security',
    location: 'Bandra West, Mumbai',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=2000&q=85',
    price: '₹4.50 Cr',
    bhk: '5 BHK Villa',
    heroHeadline: 'Illuminated night mansion with ',
    heroHighlight: 'breathtaking city skyline views',
    heroSubtext: '5 BHK automated sky mansion in Bandra West, Mumbai with infinity pool, private elevator & ambient lights.',
    badgeText: '🌆 Sunset Horizon Sky Mansion • Bandra West, Mumbai',
  },
  {
    name: 'Contemporary Garden Sky Villa',
    tagline: 'Multi-Level Duplex Villa with Double-Height Living Room & Skylight',
    location: 'Golf Course Road, Gurgaon',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=85',
    price: '₹2.90 Cr',
    bhk: '4 BHK Duplex',
    heroHeadline: 'Multi-level duplex villa with ',
    heroHighlight: 'soaring skylights & garden deck',
    heroSubtext: '4 BHK duplex residence on Golf Course Road, Gurgaon with double-height living lounge & organic terrace garden.',
    badgeText: '🍃 Eco-Modernist Sky Duplex • Gurgaon',
  },
  {
    name: 'Classic Suburban Heritage House',
    tagline: 'Charming Pitched-Roof Villa with Paved Driveway & Courtyard',
    location: 'Koregaon Park, Pune',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=2000&q=85',
    price: '₹1.75 Cr',
    bhk: '3 BHK House',
    heroHeadline: 'Quiet suburban sanctuary with ',
    heroHighlight: 'pitched roof & paved courtyard',
    heroSubtext: '3 BHK heritage villa in Koregaon Park, Pune featuring tranquil lawns, paved driveways & family lounges.',
    badgeText: '🏡 Heritage Suburban House • Koregaon Park, Pune',
  },
];

interface ThreeBackgroundProps {
  activeVillaIndex?: number;
  onVillaChange?: (index: number) => void;
}

export const ThreeBackground: React.FC<ThreeBackgroundProps> = ({
  activeVillaIndex: propActiveIndex,
  onVillaChange,
}) => {
  const [internalActiveIndex, setInternalActiveIndex] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeIndex = propActiveIndex !== undefined ? propActiveIndex : internalActiveIndex;

  const setActiveIndex = (idx: number) => {
    if (onVillaChange) {
      onVillaChange(idx);
    }
    setInternalActiveIndex(idx);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setActiveIndex((activeIndex + 1) % REAL_VILLA_LIST.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPlaying, activeIndex]);

  const handlePrev = () => {
    setActiveIndex((activeIndex - 1 + REAL_VILLA_LIST.length) % REAL_VILLA_LIST.length);
  };

  const handleNext = () => {
    setActiveIndex((activeIndex + 1) % REAL_VILLA_LIST.length);
  };

  const currentVilla = REAL_VILLA_LIST[activeIndex];

  return (
    <>
      {/* Background HD Villa Imagery with Smooth Crossfade */}
      <div
        className={`fixed inset-0 w-full h-full transition-all duration-700 overflow-hidden ${
          isFocusMode ? 'z-40' : 'pointer-events-none z-0'
        }`}
      >
        {REAL_VILLA_LIST.map((villa, idx) => {
          const isActive = idx === activeIndex;
          return (
            <div
              key={villa.name}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
              }`}
            >
              <img
                src={villa.image}
                alt={villa.name}
                className="w-full h-full object-cover brightness-[0.62] contrast-[1.12] transition-transform duration-[10000ms]"
              />
              {/* Crisp Dark Vignette Overlay */}
              <div
                className={`absolute inset-0 transition-opacity duration-500 ${
                  isFocusMode
                    ? 'bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-slate-950/40'
                    : 'bg-gradient-to-t from-[#090D16] via-[#090D16]/60 to-[#090D16]/40'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Floating Interactive Real House Showcase Bar */}
      {isCollapsed ? (
        <button
          onClick={() => setIsCollapsed(false)}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-indigo-500/40 px-3.5 py-2 rounded-full shadow-xl transition-all hover:scale-105 cursor-pointer text-xs font-bold"
          style={{ pointerEvents: 'auto' }}
          title="Expand Villa Showcase Bar"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Villa Showcase</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1" />
        </button>
      ) : (
        <div
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 bg-slate-900/95 backdrop-blur-xl border border-indigo-500/40 hover:border-indigo-500/80 p-2 sm:p-2.5 rounded-2xl shadow-2xl transition duration-300 max-w-[calc(100vw-2rem)]"
          style={{ pointerEvents: 'auto' }}
        >
          <div className="w-9 h-9 rounded-lg overflow-hidden border border-amber-400/50 shadow-sm flex-shrink-0 relative">
            <img
              src={currentVilla.image}
              alt={currentVilla.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-indigo-950/20"></div>
            <Home className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow-md" />
          </div>

          <div className="max-w-[150px] sm:max-w-[180px]">
            <div className="flex items-center gap-1 text-[9px] uppercase font-black tracking-wider text-amber-400">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="truncate">Villa Showcase</span>
            </div>
            <p className="text-xs font-bold text-white truncate">{currentVilla.name}</p>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
              <MapPin className="w-2.5 h-2.5 text-indigo-400 flex-shrink-0" />
              <span className="truncate">{currentVilla.location}</span>
            </div>
          </div>

          {/* Compact Controls */}
          <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              title={isPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition cursor-pointer"
              title="Previous House"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition cursor-pointer"
              title="Next House"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isFocusMode
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 hover:bg-indigo-600 text-slate-200'
              }`}
              title={isFocusMode ? 'Exit Fullscreen' : 'Fullscreen House View'}
            >
              {isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Close / Minimize Button */}
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-500/80 text-slate-400 hover:text-white transition cursor-pointer ml-1"
              title="Minimize Showcase Bar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
