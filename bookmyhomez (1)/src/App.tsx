import { useState, useEffect, useMemo } from 'react';
import { ThreeBackground, REAL_VILLA_LIST } from './components/ThreeBackground';
import { SplashScreen } from './components/SplashScreen';
import { Header } from './components/Header';
import { PropertyCard } from './components/PropertyCard';
import { PropertyDetailsModal } from './components/PropertyDetailsModal';
import { WizardModal } from './components/WizardModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import {
  Property,
  User,
  CategoryType,
  GoogleAccount,
  WizardData,
} from './types';
import {
  INITIAL_PROPERTIES,
  GOOGLE_ACCOUNTS,
  REGISTERED_USERS,
} from './data/initialProperties';
import {
  seedInitialPropertiesIfEmpty,
  seedInitialUsersIfEmpty,
  subscribeToProperties,
  savePropertyToFirestore,
  updatePropertyInFirestore,
  deletePropertyFromFirestore,
  saveUserToFirestore,
} from './firebase';
import {
  ShieldCheck,
  Sliders,
  Search,
  MapPin,
  ChevronDown,
  ArrowRight,
  House,
  Key,
  Umbrella,
  Grid3X3,
  SearchX,
  Heart,
  PlusCircle,
  ArrowLeft,
} from 'lucide-react';

export default function App() {
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [activeVillaIndex, setActiveVillaIndex] = useState(0);
  const [currentTab, setCurrentTab] = useState<'explore' | 'listings' | 'favorites' | 'my_properties'>('explore');
  const [activeFilterCategory, setActiveFilterCategory] = useState<CategoryType>('All');
  const [filterCity, setFilterCity] = useState('All');
  const [filterBhk, setFilterBhk] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');

  // User State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bmh_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        localStorage.removeItem('bmh_current_user');
      }
    }
    return null;
  });

  // Saved Properties State
  const [savedProperties, setSavedProperties] = useState<number[]>(() => {
    const saved = localStorage.getItem('bmh_saved_properties');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [1, 3];
  });

  // Properties State
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);

  // Modals State
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Registered Users State
  const [registeredUsers, setRegisteredUsers] = useState<(User & { password?: string })[]>(() => {
    const saved = localStorage.getItem('bmh_registered_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return REGISTERED_USERS;
  });

  // Sync users to localStorage
  useEffect(() => {
    localStorage.setItem('bmh_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  const handleRegisterUser = (newUser: User & { password?: string }) => {
    setRegisteredUsers((prev) => {
      const exists = prev.some((u) => u.email.toLowerCase() === newUser.email.toLowerCase());
      if (exists) return prev;
      return [...prev, newUser];
    });
    saveUserToFirestore(newUser).catch(() => {});
  };

  useEffect(() => {
    localStorage.setItem('bmh_saved_properties', JSON.stringify(savedProperties));
  }, [savedProperties]);

  // Real-time Firestore sync & initial seeding
  useEffect(() => {
    seedInitialPropertiesIfEmpty();
    seedInitialUsersIfEmpty();

    const unsubscribe = subscribeToProperties((liveProperties) => {
      if (liveProperties && liveProperties.length > 0) {
        setProperties(liveProperties);
      }
    });

    return () => unsubscribe();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN').format(val || 0);
  };

  const navigateTo = (tab: any) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCategory = (cat: CategoryType) => {
    setActiveFilterCategory(cat);
    setCurrentTab('listings');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filterByLocation = (city: string) => {
    setFilterCity(city);
    setCurrentTab('listings');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const countByCategory = (cat: CategoryType) => {
    return properties.filter((p) => p.category === cat).length;
  };

  const isSaved = (id: number) => savedProperties.includes(id);

  const toggleSave = (id: number) => {
    setSavedProperties((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleStatus = async (item: Property) => {
    const updatedStatus = item.status === 'Booked' ? 'Available' : 'Booked';
    setProperties((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, status: updatedStatus } : p))
    );
    if (selectedProperty && selectedProperty.id === item.id) {
      setSelectedProperty({ ...selectedProperty, status: updatedStatus });
    }

    try {
      await updatePropertyInFirestore(item.id, { status: updatedStatus });
      await fetch(`/api/properties/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: updatedStatus }),
      });
    } catch {
      // ignore
    }
  };

  const handleDeleteProperty = async (id: number) => {
    if (confirm('Are you sure you want to delete this property?')) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
      if (selectedProperty && selectedProperty.id === id) {
        setSelectedProperty(null);
      }
      try {
        await deletePropertyFromFirestore(id);
        await fetch(`/api/properties/${id}`, { method: 'DELETE' });
      } catch {
        // ignore
      }
    }
  };

  const openWizard = () => {
    if (!currentUser) {
      setShowAuthModal(true);
    } else {
      setIsEditing(false);
      setEditingId(null);
      setShowWizardModal(true);
    }
  };

  const openEditWizard = (item: Property) => {
    setIsEditing(true);
    setEditingId(item.id);
    setShowWizardModal(true);
  };

  const handlePublishListing = async (
    wizardData: WizardData,
    editingFlag: boolean,
    editId: number | null
  ) => {
    const payload: Property = {
      id: editingFlag && editId ? editId : Date.now(),
      title: wizardData.title || 'New Verified Property',
      category: wizardData.category,
      status: wizardData.status || 'Available',
      city: wizardData.city,
      locality: wizardData.locality,
      bhk: wizardData.bhk,
      area: wizardData.area,
      price: wizardData.price,
      deposit: wizardData.deposit,
      availDate: wizardData.availDate,
      propertyAge: wizardData.propertyAge,
      bathrooms: wizardData.bathrooms,
      balconies: wizardData.balconies,
      furnishing: wizardData.furnishing,
      furnishings: wizardData.furnishings,
      amenities: wizardData.amenities,
      propType: wizardData.propType,
      subType: wizardData.subType,
      ownerId: currentUser ? currentUser.id : 'usr_guest',
      ownerName: currentUser ? currentUser.name : 'Owner',
      description: 'Verified real estate property posted via BookMyHomez multi-step listing wizard.',
      images: wizardData.images,
    };

    if (editingFlag && editId) {
      setProperties((prev) =>
        prev.map((p) => (p.id === editId ? payload : p))
      );
    } else {
      setProperties((prev) => [payload, ...prev]);
    }

    setShowWizardModal(false);
    navigateTo('my_properties');

    try {
      await savePropertyToFirestore(payload);
      if (editingFlag && editId) {
        await fetch(`/api/properties/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
    } catch {
      // ignore
    }
  };

  // Filtered Properties Computation
  const filteredProperties = useMemo(() => {
    let result = properties.filter((item) => {
      const matchCat =
        activeFilterCategory === 'All' || item.category === activeFilterCategory;
      const matchCity =
        filterCity === 'All' ||
        item.city.toLowerCase() === filterCity.toLowerCase();
      const matchBhk = filterBhk === 'All' || item.bhk === filterBhk;

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.locality.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      return matchCat && matchCity && matchBhk && matchQuery;
    });

    if (sortBy === 'price_low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => b.price - a.price);
    } else {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [properties, activeFilterCategory, filterCity, filterBhk, searchQuery, sortBy]);

  const savedListings = useMemo(() => {
    return properties.filter((p) => savedProperties.includes(p.id));
  }, [properties, savedProperties]);

  const userProperties = useMemo(() => {
    return currentUser
      ? properties.filter(
          (p) => p.ownerId === currentUser.id || currentUser.role === 'Administrator'
        )
      : [];
  }, [properties, currentUser]);

  const resetFilters = () => {
    setFilterCity('All');
    setFilterBhk('All');
    setActiveFilterCategory('All');
    setSearchQuery('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#090D16] text-slate-100 font-sans selection:bg-indigo-600 selection:text-white relative">
      
      {/* 3D Villa Canvas Background */}
      <ThreeBackground
        activeVillaIndex={activeVillaIndex}
        onVillaChange={setActiveVillaIndex}
      />

      <div className="flex flex-col flex-1 min-h-screen relative z-10">
        
        {/* Splash Screen */}
        {showSplashScreen && (
          <SplashScreen onDismiss={() => setShowSplashScreen(false)} />
        )}

        {/* Header */}
        <Header
          currentTab={currentTab}
          activeFilterCategory={activeFilterCategory}
          navigateTo={navigateTo}
          navigateToCategory={navigateToCategory}
          openWizard={openWizard}
          openAuthModal={() => setShowAuthModal(true)}
          savedCount={savedProperties.length}
          currentUser={currentUser}
          myPropertiesCount={userProperties.length}
          logout={() => setCurrentUser(null)}
        />

        {/* Main Content Area */}
        <main className="flex-1">

          {/* EXPLORE / HOME TAB */}
          {currentTab === 'explore' && (
            <div>
              {/* Hero Section */}
              <section className="relative min-h-[540px] lg:min-h-[620px] flex items-center justify-center px-4 py-16 overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-transparent to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-center">
                  {/* Dynamic House Text Container - Keyed to activeVillaIndex for staggered entry */}
                  {(() => {
                    const currentVilla = REAL_VILLA_LIST[activeVillaIndex] || REAL_VILLA_LIST[0];
                    return (
                      <div key={activeVillaIndex} className="animate-hero-text-stagger">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-lg">
                          <ShieldCheck className="w-4 h-4 text-amber-400" />
                          {currentVilla.badgeText}
                        </span>

                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none mb-6">
                          {currentVilla.heroHeadline}{' '}
                          <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-amber-300 bg-clip-text text-transparent">
                            {currentVilla.heroHighlight}
                          </span>
                        </h1>

                        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-medium mb-10 leading-relaxed">
                          {currentVilla.heroSubtext}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Search Control Glass Panel */}
                  <div className="bg-slate-900/80 backdrop-blur-xl p-3 sm:p-5 rounded-3xl shadow-2xl border border-slate-700/60 max-w-3xl mx-auto text-left">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800/80 overflow-x-auto no-scrollbar">
                      {(
                        ['All', 'Buy', 'Rent', 'Short Stay', 'Plots'] as CategoryType[]
                      ).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => navigateToCategory(cat)}
                          className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
                            activeFilterCategory === cat && currentTab === 'listings'
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                          }`}
                        >
                          {cat === 'All' ? 'All Categories' : cat}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1">
                          Location / City
                        </label>
                        <div className="relative">
                          <MapPin className="w-3.5 h-3.5 absolute left-3.5 top-3.5 text-indigo-400" />
                          <select
                            value={filterCity}
                            onChange={(e) => setFilterCity(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 appearance-none"
                          >
                            <option value="All">All Cities (India)</option>
                            <option value="Bengaluru">Bengaluru</option>
                            <option value="Mumbai">Mumbai</option>
                            <option value="Pune">Pune</option>
                            <option value="Jaipur">Jaipur</option>
                            <option value="Delhi NCR">Delhi NCR</option>
                            <option value="Hyderabad">Hyderabad</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 absolute right-3.5 top-3.5 text-slate-500 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1">
                          Search Keywords
                        </label>
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-3.5 top-3.5 text-slate-500" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Society, locality, BHK..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1">
                            BHK Config
                          </label>
                          <select
                            value={filterBhk}
                            onChange={(e) => setFilterBhk(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                          >
                            <option value="All">Any BHK</option>
                            <option value="1 BHK">1 BHK</option>
                            <option value="2 BHK">2 BHK</option>
                            <option value="3 BHK">3 BHK</option>
                            <option value="4+ BHK">4+ BHK / Villa</option>
                          </select>
                        </div>
                        <button
                          onClick={() => navigateToCategory(activeFilterCategory)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/30 cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5" /> Search
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Categories Navigation Grid */}
              <section className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      Explore Categories
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Select a category to view dedicated property listings on a new page
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                  <div
                    onClick={() => navigateToCategory('Buy')}
                    className="group cursor-pointer bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/90 transition duration-300"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">
                      <House className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition">
                      Homes to Buy
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Luxury flats, apartments & villas
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-indigo-400 mt-4">
                      Browse {countByCategory('Buy')} listings{' '}
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition transform" />
                    </span>
                  </div>

                  <div
                    onClick={() => navigateToCategory('Rent')}
                    className="group cursor-pointer bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/90 transition duration-300"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">
                      <Key className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                      Rentals & PGs
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Furnished flats & coliving spaces
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-400 mt-4">
                      Browse {countByCategory('Rent')} listings{' '}
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition transform" />
                    </span>
                  </div>

                  <div
                    onClick={() => navigateToCategory('Short Stay')}
                    className="group cursor-pointer bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/90 transition duration-300"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">
                      <Umbrella className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition">
                      Short Stays
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Serviced homes & vacation retreats
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-amber-400 mt-4">
                      Browse {countByCategory('Short Stay')} listings{' '}
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition transform" />
                    </span>
                  </div>

                  <div
                    onClick={() => navigateToCategory('Plots')}
                    className="group cursor-pointer bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 hover:border-violet-500/50 hover:bg-slate-900/90 transition duration-300"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">
                      <Grid3X3 className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-violet-400 transition">
                      Land & Plots
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Residential & commercial land
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-violet-400 mt-4">
                      Browse {countByCategory('Plots')} listings{' '}
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition transform" />
                    </span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* LISTINGS CATEGORY VIEW */}
          {currentTab === 'listings' && (
            <section className="max-w-7xl mx-auto px-4 py-8">
              {/* Category Header Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/30 p-6 sm:p-8 rounded-3xl border border-slate-800 mb-8">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                  <button
                    onClick={() => navigateTo('explore')}
                    className="hover:text-indigo-400 flex items-center gap-1 transition cursor-pointer"
                  >
                    <House className="w-3.5 h-3.5" /> Home
                  </button>
                  <span>/</span>
                  <span className="text-indigo-400 font-bold uppercase tracking-wider">
                    {activeFilterCategory === 'All' ? 'All Properties' : activeFilterCategory}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white">
                      {activeFilterCategory === 'All'
                        ? 'Browse All Real Estate'
                        : activeFilterCategory === 'Buy'
                        ? 'Homes for Sale'
                        : activeFilterCategory === 'Rent'
                        ? 'Rental Homes & PGs'
                        : activeFilterCategory === 'Short Stay'
                        ? 'Short Stay & Vacation Rentals'
                        : 'Land & Residential Plots'}
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Displaying {filteredProperties.length} verified listings matching your preferences
                    </p>
                  </div>

                  <button
                    onClick={() => navigateTo('explore')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition flex items-center gap-2 self-start md:self-auto cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-6 overflow-x-auto no-scrollbar pt-4 border-t border-slate-800/80">
                  {(
                    ['All', 'Buy', 'Rent', 'Short Stay', 'Plots'] as CategoryType[]
                  ).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveFilterCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
                        activeFilterCategory === cat
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {cat === 'All' ? 'All Types' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Bar */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 mb-8 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1">
                    City
                  </label>
                  <select
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-semibold"
                  >
                    <option value="All">All Cities</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Pune">Pune</option>
                    <option value="Jaipur">Jaipur</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1">
                    BHK Config
                  </label>
                  <select
                    value={filterBhk}
                    onChange={(e) => setFilterBhk(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-semibold"
                  >
                    <option value="All">Any BHK</option>
                    <option value="1 BHK">1 BHK</option>
                    <option value="2 BHK">2 BHK</option>
                    <option value="3 BHK">3 BHK</option>
                    <option value="4+ BHK">4+ BHK / Villa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1">
                    Search Keywords
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search locality..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1">
                    Sort Order
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-semibold"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Grid or Empty */}
              {filteredProperties.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800">
                  <SearchX className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-1">No properties found</h3>
                  <p className="text-xs text-slate-500">
                    Try adjusting your filters or resetting your search criteria
                  </p>
                  <button
                    onClick={resetFilters}
                    className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map((item) => (
                    <PropertyCard
                      key={item.id}
                      property={item}
                      currentUser={currentUser}
                      isSaved={isSaved(item.id)}
                      onToggleSave={toggleSave}
                      onViewDetails={(prop) => setSelectedProperty(prop)}
                      onToggleStatus={toggleStatus}
                      onEdit={openEditWizard}
                      onDelete={handleDeleteProperty}
                      formatCurrency={formatCurrency}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* FAVORITES TAB */}
          {currentTab === 'favorites' && (
            <section className="max-w-7xl mx-auto px-4 py-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-3">
                    <Heart className="w-6 h-6 text-rose-500 fill-rose-500" /> Saved Properties
                  </h2>
                </div>
                <button
                  onClick={() => navigateTo('explore')}
                  className="text-xs bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-slate-300 hover:text-white cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              </div>

              {savedListings.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
                  <Heart className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-1">No Saved Properties</h3>
                  <p className="text-xs text-slate-500">
                    Click the heart icon on any property to bookmark it here
                  </p>
                  <button
                    onClick={() => navigateTo('explore')}
                    className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-3 rounded-xl cursor-pointer transition"
                  >
                    Explore Homes
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedListings.map((item) => (
                    <PropertyCard
                      key={item.id}
                      property={item}
                      currentUser={currentUser}
                      isSaved={true}
                      onToggleSave={toggleSave}
                      onViewDetails={(prop) => setSelectedProperty(prop)}
                      onToggleStatus={toggleStatus}
                      onEdit={openEditWizard}
                      onDelete={handleDeleteProperty}
                      formatCurrency={formatCurrency}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* MY PROPERTIES TAB */}
          {currentTab === 'my_properties' && (
            <section className="max-w-7xl mx-auto px-4 py-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    My Listed Properties ({currentUser ? currentUser.name : ''})
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage and update properties you have published
                  </p>
                </div>
                <button
                  onClick={openWizard}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer shadow-lg shadow-blue-600/30 flex items-center gap-2 transition"
                >
                  <PlusCircle className="w-4 h-4" /> Post Property
                </button>
              </div>

              {userProperties.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
                  <h3 className="text-lg font-bold text-white mb-1">
                    No Properties Posted by You
                  </h3>
                  <p className="text-xs text-slate-500">
                    You haven't published any property listings yet
                  </p>
                  <button
                    onClick={openWizard}
                    className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3 rounded-xl cursor-pointer shadow-lg shadow-blue-600/30 transition"
                  >
                    Post Property Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {userProperties.map((item) => (
                    <PropertyCard
                      key={item.id}
                      property={item}
                      currentUser={currentUser}
                      isSaved={isSaved(item.id)}
                      onToggleSave={toggleSave}
                      onViewDetails={(prop) => setSelectedProperty(prop)}
                      onToggleStatus={toggleStatus}
                      onEdit={openEditWizard}
                      onDelete={handleDeleteProperty}
                      formatCurrency={formatCurrency}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

        </main>

        {/* Modals */}
        <PropertyDetailsModal
          property={selectedProperty}
          currentUser={currentUser}
          onClose={() => setSelectedProperty(null)}
          onToggleStatus={toggleStatus}
          formatCurrency={formatCurrency}
        />

        <WizardModal
          isOpen={showWizardModal}
          isEditing={isEditing}
          editingId={editingId}
          currentUser={currentUser}
          onClose={() => setShowWizardModal(false)}
          onPublish={handlePublishListing}
          formatCurrency={formatCurrency}
        />

        <AuthModal
          isOpen={showAuthModal}
          googleAccounts={GOOGLE_ACCOUNTS}
          registeredUsers={registeredUsers}
          onClose={() => setShowAuthModal(false)}
          onRegisterUser={handleRegisterUser}
          onSelectGoogleAccount={(acc) => {
            const userObj: User = {
              name: acc.name,
              email: acc.email,
              role: 'Verified Owner',
              avatar: acc.avatar,
              id: 'usr_' + acc.email.replace(/[^a-zA-Z0-9]/g, '_'),
            };
            setCurrentUser(userObj);
            setShowAuthModal(false);
            openWizard();
          }}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setShowAuthModal(false);
          }}
        />

        {/* Footer */}
        <Footer
          navigateToCategory={navigateToCategory}
          filterByLocation={filterByLocation}
        />

      </div>
    </div>
  );
}
