import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  X,
  MapPin,
  Compass,
  Building2,
  Filter,
  RotateCcw,
  Landmark,
  Palmtree,
  Mountain,
  TreePine,
  Flame,
  UtensilsCrossed,
  Activity,
  Globe2,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useDestinations } from '../../context/DestinationContext';
import { REGIONS } from '../../data/states';
import GlassCard from '../ui/GlassCard';

const CATEGORIES = [
  { id: 'ALL', label: 'All Categories', icon: Globe2 },
  { id: 'Heritage', label: 'Heritage & Forts', icon: Landmark },
  { id: 'Beaches', label: 'Beaches & Coastal', icon: Palmtree },
  { id: 'Hill Stations', label: 'Hill Stations', icon: Mountain },
  { id: 'Nature', label: 'Nature & Lakes', icon: TreePine },
  { id: 'Spiritual', label: 'Spiritual & Ghats', icon: Flame },
  { id: 'Food & Culture', label: 'Food & Culture', icon: UtensilsCrossed },
  { id: 'Adventure', label: 'Adventure & Rafting', icon: Activity },
];

const REGION_TABS = [
  { key: 'ALL', label: 'All India' },
  { key: REGIONS.SOUTH, label: 'South India' },
  { key: REGIONS.NORTH, label: 'North India' },
  { key: REGIONS.WEST, label: 'West India' },
  { key: REGIONS.EAST, label: 'East India' },
  { key: REGIONS.CENTRAL, label: 'Central India' },
  { key: REGIONS.NORTHEAST, label: 'North-East' },
  { key: REGIONS.UT, label: 'Union Territories' },
];

export function DestinationFilterBar({ showHeading = false, className = '' }) {
  const {
    availableStates,
    availableDestinations,
    filteredDestinations,
    filteredPlaces,
    searchResults,
    selectedRegion,
    setSelectedRegion,
    selectedStateId,
    setSelectedStateId,
    selectedDestinationId,
    setSelectedDestinationId,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    clearFilters,
    hasActiveFilters,
    openPlaceDetails,
  } = useDestinations();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasSearchQuery = searchQuery.trim().length > 0;

  const handleStateChange = (e) => {
    const val = e.target.value;
    setSelectedStateId(val);
    setSelectedDestinationId(null);
  };

  const handleDestinationChange = (e) => {
    const val = e.target.value;
    setSelectedDestinationId(val === 'ALL' ? null : val);
  };

  const handleSelectStateResult = (state) => {
    setSelectedStateId(state.id);
    setSelectedRegion(state.region || 'ALL');
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const handleSelectDestinationResult = (dest) => {
    setSelectedDestinationId(dest.id);
    if (dest.stateId) setSelectedStateId(dest.stateId);
    if (dest.region) setSelectedRegion(dest.region);
    setSearchQuery('');
    setIsDropdownOpen(false);
    setTimeout(() => {
      const el = document.getElementById('destination-overview');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  const handleSelectPlaceResult = (place) => {
    openPlaceDetails(place);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Optional Title Section */}
      {showHeading && (
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-semibold mb-2 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pan-India Smart Tourism Discovery Engine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Where do you want to explore?
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">
            Explore verified destinations across India with real-time crowd telemetry, safe corridors, and multi-criteria filters.
          </p>
        </div>
      )}

      {/* Main Search Bar with Instant Multi-Category Dropdown */}
      <div ref={searchContainerRef} className="relative w-full">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5 text-cyan-400" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="🔍 Search city, state or place..."
            className="w-full pl-12 pr-12 py-3.5 bg-slate-900/80 border border-cyan-500/30 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 rounded-2xl text-sm sm:text-base text-white placeholder-slate-400 backdrop-blur-xl outline-none transition-all shadow-cyan-glow"
          />

          {hasSearchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setIsDropdownOpen(false);
              }}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-cyan-300 transition-colors"
              title="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Live Multi-Category Autocomplete Dropdown */}
        {isDropdownOpen && hasSearchQuery && (
          <div className="absolute top-full left-0 right-0 mt-2 p-3.5 rounded-2xl bg-ocean-950/95 border border-cyan-400/60 shadow-2xl backdrop-blur-2xl z-50 max-h-96 overflow-y-auto space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* 1. Matched States */}
            {searchResults.states.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Building2 className="w-3 h-3" />
                  States & Union Territories ({searchResults.states.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {searchResults.states.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => handleSelectStateResult(st)}
                      className="p-2 rounded-xl bg-slate-900/80 hover:bg-cyan-500/20 border border-slate-800 hover:border-cyan-400 flex items-center justify-between cursor-pointer transition-all select-none"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                          {st.code}
                        </span>
                        <span className="text-xs font-bold text-white">{st.name}</span>
                        <span className="text-[10px] text-slate-400">({st.type})</span>
                      </div>
                      <span className="text-[10px] text-cyan-300 font-semibold">Filter State &rarr;</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Matched Destinations / Cities */}
            {searchResults.destinations.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1.5 mb-1.5">
                  <MapPin className="w-3 h-3" />
                  Destinations & Cities ({searchResults.destinations.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {searchResults.destinations.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => handleSelectDestinationResult(d)}
                      className="p-2 rounded-xl bg-slate-900/80 hover:bg-cyan-500/20 border border-slate-800 hover:border-cyan-400 flex items-center justify-between cursor-pointer transition-all select-none"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        <div>
                          <strong className="text-xs font-bold text-white block">{d.name}</strong>
                          <span className="text-[10px] text-slate-400">City • {d.state} ({d.region})</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-cyan-300 font-semibold">View City &rarr;</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Matched Tourist Places */}
            {searchResults.places.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Compass className="w-3 h-3" />
                  Tourist Places ({searchResults.places.length})
                </span>
                <div className="space-y-1.5">
                  {searchResults.places.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPlaceResult(p)}
                      className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-cyan-500/20 border border-slate-800 hover:border-cyan-400 flex items-center justify-between cursor-pointer transition-all select-none"
                    >
                      <div className="flex items-center gap-2.5">
                        <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div>
                          <strong className="text-xs text-white block">{p.name}</strong>
                          <span className="text-[10px] text-slate-400">
                            Tourist Place • {p.destination}, {p.state} • <span className="text-cyan-300">{p.category}</span>
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-cyan-300 font-semibold">Open Details &rarr;</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No matches */}
            {searchResults.states.length === 0 &&
              searchResults.destinations.length === 0 &&
              searchResults.places.length === 0 && (
                <div className="p-4 text-center">
                  <p className="text-xs text-slate-400">
                    No destinations or places matched <strong className="text-white">"{searchQuery}"</strong>.
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Try searching for "Hyderabad", "Telangana", "Charminar", "Agra", or "Goa".
                  </p>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Region Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
        {REGION_TABS.map((tab) => {
          const isActive = selectedRegion === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setSelectedRegion(tab.key);
                setSelectedStateId('ALL');
                setSelectedDestinationId(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 select-none border flex items-center gap-1.5 ${
                isActive
                  ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400 shadow-cyan-glow scale-105 ring-1 ring-cyan-400 font-bold'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:border-cyan-500/40 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Secondary Filter Controls: State Dropdown, Destination Dropdown, Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* State / UT Filter */}
        <div className="relative">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
            State / Union Territory
          </label>
          <div className="relative">
            <select
              value={selectedStateId}
              onChange={handleStateChange}
              className={`w-full appearance-none pl-3.5 pr-8 py-2 rounded-xl text-xs font-medium bg-slate-900/80 border transition-all outline-none cursor-pointer ${
                selectedStateId !== 'ALL'
                  ? 'border-cyan-400 text-cyan-200 shadow-cyan-glow bg-cyan-950/40 ring-1 ring-cyan-400'
                  : 'border-slate-800 text-slate-300 hover:border-cyan-500/40'
              }`}
            >
              <option value="ALL" className="bg-slate-900 text-white">
                All States & UTs ({availableStates.length})
              </option>
              {availableStates.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Destination / City Filter */}
        <div className="relative">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
            City / Destination
          </label>
          <div className="relative">
            <select
              value={selectedDestinationId || 'ALL'}
              onChange={handleDestinationChange}
              className={`w-full appearance-none pl-3.5 pr-8 py-2 rounded-xl text-xs font-medium bg-slate-900/80 border transition-all outline-none cursor-pointer ${
                selectedDestinationId
                  ? 'border-cyan-400 text-cyan-200 shadow-cyan-glow bg-cyan-950/40 ring-1 ring-cyan-400'
                  : 'border-slate-800 text-slate-300 hover:border-cyan-500/40'
              }`}
            >
              <option value="ALL" className="bg-slate-900 text-white">
                All Destinations ({availableDestinations.length})
              </option>
              {availableDestinations.map((d) => (
                <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                  {d.name} ({d.state})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Active Filter Summary and Clear Controls */}
        <div className="sm:col-span-2 flex items-end justify-between gap-3 pt-1">
          <div className="text-xs">
            <span className="text-slate-400">Showing </span>
            <strong className="text-cyan-300 font-bold">
              {filteredDestinations.length} destination{filteredDestinations.length === 1 ? '' : 's'}
            </strong>
            <span className="text-slate-400"> ({filteredPlaces.length} places available)</span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 hover:text-white border border-cyan-400/50 hover:border-cyan-400 shadow-cyan-glow text-xs font-bold transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border select-none whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400 shadow-cyan-glow scale-105 ring-1 ring-cyan-400 font-bold'
                  : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-cyan-500/40 hover:text-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DestinationFilterBar;
