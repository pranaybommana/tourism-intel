import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Shield,
  Navigation,
  Bot,
  ArrowRight,
  MapPin,
  Sparkles,
  Search,
  CheckCircle2,
  Landmark,
  Palmtree,
  Mountain,
  TreePine,
  Flame,
  UtensilsCrossed,
  Activity,
  Globe,
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import SectionHeader from '../../components/ui/SectionHeader';
import SearchBar from '../../components/ui/SearchBar';
import CategoryChip from '../../components/ui/CategoryChip';
import DynamicGreeting from '../../components/common/DynamicGreeting';
import StateSelector from '../../components/destination/StateSelector';
import DestinationCard from '../../components/destination/DestinationCard';
import DestinationOverview from '../../components/destination/DestinationOverview';
import PlaceCard from '../../components/place/PlaceCard';
import PlaceDetailsModal from '../../components/place/PlaceDetailsModal';
import AIAssistantTeaser from '../../components/ai/AIAssistantTeaser';
import AITravelIntelligence from '../../components/ai/AITravelIntelligence';
import EmptyState from '../../components/ui/EmptyState';
import { useDestinations } from '../../context/DestinationContext';

const CATEGORIES = [
  { id: 'ALL', label: 'All Categories', icon: Globe },
  { id: 'Heritage', label: 'Heritage & Forts', icon: Landmark },
  { id: 'Beaches', label: 'Beaches & Coastal', icon: Palmtree },
  { id: 'Hill Stations', label: 'Hill Stations', icon: Mountain },
  { id: 'Nature', label: 'Nature & Lakes', icon: TreePine },
  { id: 'Spiritual', label: 'Spiritual & Ghats', icon: Flame },
  { id: 'Food & Culture', label: 'Food & Culture', icon: UtensilsCrossed },
  { id: 'Adventure', label: 'Adventure & Rafting', icon: Activity },
];

export function HomePage() {
  const {
    destinations,
    places,
    filteredDestinations,
    filteredPlaces,
    searchResults,
    selectedStateId,
    setSelectedStateId,
    selectedRegion,
    setSelectedRegion,
    selectedDestinationId,
    setSelectedDestinationId,
    selectedDestination,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    clearFilters,
    hasActiveFilters,
    openPlaceDetails,
  } = useDestinations();

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="space-y-10">
      {/* Dynamic Time Greeting */}
      <DynamicGreeting />

      {/* Hero Section */}
      <section className="relative rounded-3xl p-6 sm:p-10 overflow-hidden border border-cyan-500/30 glass-panel-glow text-center sm:text-left">
        <div className="max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-semibold mb-3 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI-Powered Smart Tourism Discovery Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Where do you want to explore?
          </h1>

          <p className="mt-2 text-sm sm:text-base text-cyan-200/90 font-medium">
            "Explore smarter. Travel safer. Discover more."
          </p>

          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Discover verified tourist destinations across India with real-time crowd telemetry, safe navigation corridors, offline emergency shelters, and zero-cost audio intelligence.
          </p>

          {/* Search Bar with live autocomplete */}
          <div className="mt-6 max-w-2xl relative">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder="🔍 Search city, state or place..."
              className="shadow-cyan-glow"
            />

            {/* Live Search Instant Dropdown Results */}
            {isSearching && (
              <div className="absolute top-full left-0 right-0 mt-2 p-3 rounded-2xl bg-ocean-950/95 border border-cyan-400/60 shadow-2xl backdrop-blur-2xl z-30 max-h-96 overflow-y-auto space-y-3">
                {/* 1. Matched States */}
                {searchResults.states.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-1.5">
                      States & Union Territories ({searchResults.states.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {searchResults.states.map((st) => (
                        <div
                          key={st.id}
                          onClick={() => {
                            setSelectedStateId(st.id);
                            if (st.region) setSelectedRegion(st.region);
                            setSearchQuery('');
                          }}
                          className="p-2 rounded-xl bg-slate-900/80 hover:bg-cyan-500/20 border border-slate-800 hover:border-cyan-400 flex items-center justify-between cursor-pointer transition-all select-none"
                        >
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                              {st.code}
                            </span>
                            <span className="text-xs font-bold text-white">{st.name}</span>
                            <span className="text-[10px] text-slate-400">({st.type})</span>
                          </div>
                          <span className="text-[10px] text-cyan-300 font-semibold">Filter &rarr;</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Matched Destinations */}
                {searchResults.destinations.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block mb-1.5">
                      Matched Destinations ({searchResults.destinations.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {searchResults.destinations.map((d) => (
                        <div
                          key={d.id}
                          onClick={() => {
                            setSelectedDestinationId(d.id);
                            if (d.stateId) setSelectedStateId(d.stateId);
                            setSearchQuery('');
                            setTimeout(() => {
                              const el = document.getElementById('destination-overview');
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 120);
                          }}
                          className="p-2 rounded-xl bg-slate-900/80 hover:bg-cyan-500/20 border border-slate-800 hover:border-cyan-400 flex items-center justify-between cursor-pointer transition-all select-none"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                            <div>
                              <strong className="text-xs font-bold text-white block">{d.name}</strong>
                              <span className="text-[10px] text-slate-400">City • {d.state}</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-cyan-300 font-semibold">View Overview &rarr;</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Matched Places */}
                {searchResults.places.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider block mb-1.5">
                      Matched Tourist Places ({searchResults.places.length})
                    </span>
                    <div className="space-y-1.5">
                      {searchResults.places.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            openPlaceDetails(p);
                            setSearchQuery('');
                          }}
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

                {searchResults.states.length === 0 &&
                  searchResults.destinations.length === 0 &&
                  searchResults.places.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">
                      No exact matches found for "{searchQuery}". Try searching for Hyderabad, Agra, Goa, or Varanasi.
                    </p>
                  )}
              </div>
            )}
          </div>

          {/* Quick Category Filter Chips */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 max-w-full">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border select-none whitespace-nowrap ${
                    isSelected
                      ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400 shadow-cyan-glow scale-105 ring-1 ring-cyan-400 font-bold'
                      : 'bg-slate-900/60 text-slate-300 border-slate-700/60 hover:border-cyan-500/40 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ambient Glow Graphic */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* AI Travel Intelligence */}
      <section>
        <AITravelIntelligence />
      </section>

      {/* State & Union Territory Interactive Selector */}
      <section className="p-5 rounded-3xl bg-slate-900/40 border border-cyan-500/20 backdrop-blur-md">
        <StateSelector />
      </section>

      {/* Selected Destination Overview (if destination active) */}
      {selectedDestination && (
        <section id="destination-overview">
          <DestinationOverview />
        </section>
      )}

      {/* Pan-India Destinations Grid */}
      <section className="space-y-4">
        <SectionHeader
          title={`Pan-India Destinations (${filteredDestinations.length})`}
          subtitle="Explore representative destinations with verified safety ratings and tourist attractions"
          action={
            hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-bold text-cyan-300 hover:text-white hover:underline flex items-center gap-1"
              >
                Clear Filters &times;
              </button>
            ) : null
          }
        />

        {filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredDestinations.map((dest) => (
              <DestinationCard
                key={dest.id}
                destination={dest}
                isSelected={selectedDestinationId === dest.id}
                onSelect={(d) => {
                  setSelectedDestinationId(selectedDestinationId === d.id ? null : d.id);
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No destinations found"
            description="Try changing your filters or search."
            actionLabel="Clear Filters"
            onAction={clearFilters}
          />
        )}
      </section>

      {/* AI Assistant Teaser */}
      <AIAssistantTeaser />

      {/* Universal Details Modal */}
      <PlaceDetailsModal />
    </div>
  );
}
export default HomePage;