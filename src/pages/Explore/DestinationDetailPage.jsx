import React, { useState, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Compass,
  Shield,
  ShieldCheck,
  Navigation,
  Sparkles,
  Users,
  Clock,
  PhoneCall,
  Search,
  ArrowUpDown,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';
import { useDestinations } from '../../context/DestinationContext';
import PlaceCard from '../../components/place/PlaceCard';
import PlaceDetailsModal from '../../components/place/PlaceDetailsModal';
import StatusBadge from '../../components/ui/StatusBadge';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import EmptyState from '../../components/ui/EmptyState';

export function DestinationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const placesSectionRef = useRef(null);
  const { destinations, places, isSaved, toggleSavePlace } = useDestinations();

  const destination = useMemo(() => {
    return destinations.find((d) => d.id === id);
  }, [destinations, id]);

  const allDestinationPlaces = useMemo(() => {
    if (!places) return [];
    return places.filter((p) => p.destinationId === id);
  }, [places, id]);

  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchPlaceQuery, setSearchPlaceQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');

  // Available categories for this destination
  const availableCategories = useMemo(() => {
    const set = new Set();
    allDestinationPlaces.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [allDestinationPlaces]);

  // Demo Safety Score computation
  const safety = useMemo(() => {
    if (!destination) return { score: 91, level: 'SAFE', label: 'GOOD' };
    if (destination.safetyScore) {
      return {
        score: destination.safetyScore,
        level: destination.safetyLevel || 'SAFE',
        label: destination.safetyLevel === 'SAFE' ? 'GOOD' : destination.safetyLevel,
      };
    }
    const lvl = String(destination.safetyLevel || 'SAFE').toUpperCase();
    switch (lvl) {
      case 'SAFE':
        return { score: 94, level: 'SAFE', label: 'GOOD' };
      case 'MODERATE':
        return { score: 82, level: 'MODERATE', label: 'MODERATE' };
      case 'CAUTION':
        return { score: 65, level: 'CAUTION', label: 'CAUTION' };
      case 'RESTRICTED':
        return { score: 42, level: 'RESTRICTED', label: 'ADVISORY' };
      default:
        return { score: 91, level: 'SAFE', label: 'GOOD' };
    }
  }, [destination]);

  // Aggregated Safe Zones
  const aggregatedSafeZones = useMemo(() => {
    const set = new Set();
    allDestinationPlaces.forEach((p) => {
      if (Array.isArray(p.nearbySafeZones)) {
        p.nearbySafeZones.forEach((z) => set.add(z));
      }
    });
    return Array.from(set).slice(0, 6);
  }, [allDestinationPlaces]);

  // Aggregated Attractions
  const aggregatedAttractions = useMemo(() => {
    const set = new Set();
    allDestinationPlaces.forEach((p) => {
      if (Array.isArray(p.nearbyAttractions)) {
        p.nearbyAttractions.forEach((a) => set.add(a));
      }
    });
    return Array.from(set).slice(0, 8);
  }, [allDestinationPlaces]);

  // Filtered and sorted places within destination
  const filteredAndSortedPlaces = useMemo(() => {
    let result = allDestinationPlaces;

    if (activeCategory !== 'ALL') {
      result = result.filter(
        (p) => p.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    const query = searchPlaceQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    const sorted = [...result];
    if (sortBy === 'safety') {
      const rank = { SAFE: 4, MODERATE: 3, CAUTION: 2, RESTRICTED: 1 };
      sorted.sort(
        (a, b) => (rank[b.safetyLevel?.toUpperCase()] || 0) - (rank[a.safetyLevel?.toUpperCase()] || 0)
      );
    } else if (sortBy === 'crowd') {
      const crowdRank = { low: 1, moderate: 2, medium: 2, high: 3, 'very high': 4 };
      sorted.sort(
        (a, b) =>
          (crowdRank[String(a.crowdLevel).toLowerCase()] || 2) -
          (crowdRank[String(b.crowdLevel).toLowerCase()] || 2)
      );
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    return sorted;
  }, [allDestinationPlaces, activeCategory, searchPlaceQuery, sortBy]);

  const scrollToPlaces = () => {
    placesSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!destination) {
    return (
      <EmptyState
        title="Destination Not Found"
        description="The requested city or destination is not available in the current dataset."
        actionLabel="Back to Explore"
        onAction={() => navigate('/explore')}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Back Button and Navigation Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link to="/explore">
          <GlassButton variant="ghost" size="sm" icon={ArrowLeft}>
            Back to Explore
          </GlassButton>
        </Link>
        <span className="text-xs text-slate-400 font-medium">
          {destination.region} &bull; {destination.state} &bull; <strong className="text-cyan-300">{destination.name}</strong>
        </span>
      </div>

      {/* 1. Destination Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel-glow border border-cyan-500/30">
        <div className="h-72 sm:h-96 w-full relative">
          <img
            src={destination.image}
            alt={destination.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ocean-950 via-ocean-950/65 to-transparent" />
        </div>

        <div className="p-6 sm:p-10 -mt-36 sm:-mt-32 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={destination.safetyLevel} size="md" />
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30 backdrop-blur-md">
                {destination.region}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-900/80 text-slate-300 text-xs font-medium border border-slate-700 backdrop-blur-md">
                {destination.type || 'Tourist Hub'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {destination.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {destination.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5 bg-ocean-950/80 px-3 py-1.5 rounded-xl border border-slate-700 backdrop-blur-md">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                State: <strong className="text-white ml-0.5">{destination.state}</strong>
              </span>
              <span className="flex items-center gap-1.5 bg-ocean-950/80 px-3 py-1.5 rounded-xl border border-slate-700 backdrop-blur-md">
                <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                Best Season: <strong className="text-white ml-0.5">{destination.bestSeason || 'October to March'}</strong>
              </span>
              {destination.coordinates && (
                <span className="flex items-center gap-1.5 bg-ocean-950/80 px-3 py-1.5 rounded-xl border border-slate-700 backdrop-blur-md">
                  <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
                  GPS: <span className="text-cyan-300 font-mono text-[11px]">{destination.coordinates.lat.toFixed(3)}° N, {destination.coordinates.lng.toFixed(3)}° E</span>
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <GlassButton variant="primary" size="md" onClick={scrollToPlaces} icon={Compass}>
              Explore Places ({allDestinationPlaces.length})
            </GlassButton>
            <Link to={`/navigate?city=${destination.id}`}>
              <GlassButton variant="secondary" size="md" icon={Navigation}>
                Navigate City
              </GlassButton>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Destination Intelligence & Telemetry Cards */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
          <Sparkles className="w-4 h-4" />
          <span>Destination Intelligence & Telemetry</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="p-4 flex items-start gap-3 border-cyan-500/30">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Safety Rating
              </span>
              <strong className="text-lg font-black text-white block mt-0.5">
                {safety.score} / 100
              </strong>
              <span className="text-[11px] text-emerald-300 font-medium">
                {safety.label} Safety Corridor
              </span>
            </div>
          </GlassCard>

          <GlassCard className="p-4 flex items-start gap-3 border-cyan-500/30">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Crowd Density
              </span>
              <strong className="text-lg font-black text-white block mt-0.5">
                Moderate Flow
              </strong>
              <span className="text-[11px] text-sky-300 font-medium">
                Peak: 4 PM – 8 PM
              </span>
            </div>
          </GlassCard>

          <GlassCard className="p-4 flex items-start gap-3 border-cyan-500/30">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Ideal Stay
              </span>
              <strong className="text-lg font-black text-white block mt-0.5">
                2 – 3 Days
              </strong>
              <span className="text-[11px] text-cyan-300 font-medium">
                Recommended circuit
              </span>
            </div>
          </GlassCard>

          <GlassCard className="p-4 flex items-start gap-3 border-cyan-500/30">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Attractions Listed
              </span>
              <strong className="text-lg font-black text-white block mt-0.5">
                {allDestinationPlaces.length} Verified
              </strong>
              <span className="text-[11px] text-amber-300 font-medium">
                Corridor monitored
              </span>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 3. Safe Zones & Emergency Support */}
      {aggregatedSafeZones.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Shield className="w-4 h-4" />
            <span>Verified Safe Zones & Emergency Stations</span>
          </div>

          <GlassCard className="p-5 border-emerald-500/30 bg-emerald-950/10 space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Active tourist police assistance kiosks, verified emergency stations, and hospital zones across the {destination.name} circuit:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {aggregatedSafeZones.map((zone, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-emerald-500/20 text-xs text-slate-200"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-medium truncate">{zone}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-4 text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pan-India Emergency: <strong>112</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>India Tourist Helpline: <strong>1363</strong></span>
              </div>
            </div>
          </GlassCard>
        </section>
      )}

      {/* 4. Must-Visit Places Section */}
      <section ref={placesSectionRef} className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              Tourist Places in {destination.name} ({filteredAndSortedPlaces.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any place to view detailed timing, crowd telemetry, audio guides, and safe corridors.
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchPlaceQuery}
                onChange={(e) => setSearchPlaceQuery(e.target.value)}
                placeholder={`Search places in ${destination.name}...`}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-ocean-950/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
              {searchPlaceQuery && (
                <button
                  type="button"
                  onClick={() => setSearchPlaceQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Sort Control */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-ocean-950/90 text-xs text-cyan-300 font-medium rounded-xl border border-slate-700 px-2.5 py-2 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="recommended">Recommended</option>
                <option value="safety">Highest Safety</option>
                <option value="crowd">Lowest Crowd</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Category Filter Chips */}
          {availableCategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              <button
                type="button"
                onClick={() => setActiveCategory('ALL')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border whitespace-nowrap select-none ${
                  activeCategory === 'ALL'
                    ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400 shadow-cyan-glow font-bold scale-105'
                    : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:border-cyan-500/40 hover:text-white'
                }`}
              >
                All ({allDestinationPlaces.length})
              </button>
              {availableCategories.map((cat) => {
                const count = allDestinationPlaces.filter((p) => p.category === cat).length;
                const isSelected = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border whitespace-nowrap select-none ${
                      isSelected
                        ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400 shadow-cyan-glow font-bold scale-105'
                        : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:border-cyan-500/40 hover:text-white'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Places List */}
        {filteredAndSortedPlaces.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredAndSortedPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No matching places found"
            description="Try changing your search keywords or resetting the category filter."
            actionLabel="Reset Filters"
            onAction={() => {
              setActiveCategory('ALL');
              setSearchPlaceQuery('');
            }}
          />
        )}
      </section>

      {/* 5. Nearby Circuit Attractions */}
      {aggregatedAttractions.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Nearby Attractions in {destination.name} Circuit</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {aggregatedAttractions.map((attraction, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5"
              >
                <MapPin className="w-3 h-3 text-cyan-400" />
                {attraction}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Universal Modal */}
      <PlaceDetailsModal />
    </div>
  );
}

export default DestinationDetailPage;