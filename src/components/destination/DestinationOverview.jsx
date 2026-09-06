import React, { useState, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Compass,
  ShieldCheck,
  Shield,
  Navigation,
  Sparkles,
  X,
  ArrowRight,
  ArrowLeft,
  Users,
  Clock,
  CheckCircle2,
  Filter,
  PhoneCall,
  Activity,
  Globe,
  Sun,
  Search,
  ArrowUpDown,
  Zap,
  Bookmark,
  Eye,
  ExternalLink,
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';
import PlaceCard from '../place/PlaceCard';
import { useDestinations } from '../../context/DestinationContext';

export function DestinationOverview({ destination: propDestination, onClose }) {
  const navigate = useNavigate();
  const placesSectionRef = useRef(null);

  const {
    selectedDestination: contextDestination,
    setSelectedDestinationId,
    places,
    selectedPlaceId,
    setSelectedPlaceId,
    openPlaceDetails,
    isSaved,
    toggleSavePlace,
  } = useDestinations();

  const destination = propDestination || contextDestination;
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchPlaceQuery, setSearchPlaceQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended' | 'safety' | 'crowd' | 'duration' | 'name'

  if (!destination) return null;

  // Filter all places belonging to this destination
  const allDestinationPlaces = useMemo(() => {
    if (!places) return [];
    return places.filter((p) => p.destinationId === destination.id);
  }, [places, destination.id]);

  // Extract available categories dynamically from existing place dataset
  const availableCategories = useMemo(() => {
    const categoriesSet = new Set();
    allDestinationPlaces.forEach((p) => {
      if (p.category) categoriesSet.add(p.category);
    });
    return Array.from(categoriesSet);
  }, [allDestinationPlaces]);

  // Deterministic Smart Pick computation (Demo Intelligence)
  const smartPickPlace = useMemo(() => {
    if (allDestinationPlaces.length === 0) return null;
    // Prefer Safe + Moderate/Low crowd or first landmark
    const safeCandidate = allDestinationPlaces.find(
      (p) =>
        p.safetyLevel === 'SAFE' &&
        (String(p.crowdLevel).toLowerCase() === 'low' ||
          String(p.crowdLevel).toLowerCase() === 'moderate' ||
          String(p.crowdLevel).toLowerCase() === 'medium')
    );
    return safeCandidate || allDestinationPlaces[0];
  }, [allDestinationPlaces]);

  // Filtered and sorted places based on category, local search, and sort order
  const filteredAndSortedPlaces = useMemo(() => {
    let result = allDestinationPlaces;

    // 1. Category Filter
    if (activeCategory !== 'ALL') {
      result = result.filter(
        (p) => p.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // 2. Search Query Filter within destination
    const query = searchPlaceQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          (Array.isArray(p.thingsToSee) &&
            p.thingsToSee.some((item) => item.toLowerCase().includes(query)))
      );
    }

    // 3. Sorting logic
    const sorted = [...result];
    if (sortBy === 'safety') {
      const safetyRank = { SAFE: 4, MODERATE: 3, CAUTION: 2, RESTRICTED: 1 };
      sorted.sort(
        (a, b) =>
          (safetyRank[b.safetyLevel?.toUpperCase()] || 0) -
          (safetyRank[a.safetyLevel?.toUpperCase()] || 0)
      );
    } else if (sortBy === 'crowd') {
      const crowdRank = { low: 1, moderate: 2, medium: 2, high: 3, 'very high': 4 };
      sorted.sort(
        (a, b) =>
          (crowdRank[String(a.crowdLevel).toLowerCase()] || 2) -
          (crowdRank[String(b.crowdLevel).toLowerCase()] || 2)
      );
    } else if (sortBy === 'duration') {
      sorted.sort((a, b) => (a.duration || '').localeCompare(b.duration || ''));
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    return sorted;
  }, [allDestinationPlaces, activeCategory, searchPlaceQuery, sortBy]);

  // Demo Safety Score mapping
  const getDemoSafety = (dest) => {
    if (dest.safetyScore) {
      return {
        score: dest.safetyScore,
        level: dest.safetyLevel || 'SAFE',
        label: dest.safetyLevel === 'SAFE' ? 'GOOD' : dest.safetyLevel || 'GOOD',
      };
    }
    const lvl = String(dest.safetyLevel || 'SAFE').toUpperCase();
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
  };

  const safety = getDemoSafety(destination);
  const bestSeasonText = destination.bestSeason || 'Seasonal info unavailable';

  // Aggregate nearby attractions and safe zones from destination's places
  const aggregatedSafeZones = useMemo(() => {
    const zones = new Set();
    allDestinationPlaces.forEach((p) => {
      if (Array.isArray(p.nearbySafeZones)) {
        p.nearbySafeZones.forEach((z) => zones.add(z));
      }
    });
    return Array.from(zones).slice(0, 6);
  }, [allDestinationPlaces]);

  const aggregatedAttractions = useMemo(() => {
    const attractions = new Set();
    allDestinationPlaces.forEach((p) => {
      if (Array.isArray(p.nearbyAttractions)) {
        p.nearbyAttractions.forEach((a) => attractions.add(a));
      }
    });
    return Array.from(attractions).slice(0, 8);
  }, [allDestinationPlaces]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setSelectedDestinationId(null);
    }
  };

  const scrollToPlaces = () => {
    if (placesSectionRef.current) {
      placesSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-8 pt-2 animate-in fade-in slide-in-from-top-4 duration-300">
      {/* 1. HERO SECTION */}
      <div className="relative rounded-3xl overflow-hidden border border-cyan-500/40 shadow-cyan-glow bg-ocean-950">
        {/* Background Hero Image */}
        <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-slate-950">
          <img
            src={destination.image}
            alt={destination.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=800&q=80';
            }}
          />
          {/* Oceanic Deep Dark Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-ocean-950 via-ocean-950/70 to-ocean-950/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-ocean-950/90 via-ocean-950/40 to-transparent" />

          {/* Top Bar: Back button and Region Badge */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-ocean-950/80 hover:bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-semibold text-slate-300 hover:text-white backdrop-blur-md transition-all shadow-lg select-none"
              aria-label="Back to Pan-India Destinations"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>Back to Destinations</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-400/40 backdrop-blur-md">
                <Globe className="w-3.5 h-3.5" />
                {destination.region}
              </span>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-xl bg-ocean-950/80 hover:bg-slate-900 border border-slate-700 text-slate-400 hover:text-white backdrop-blur-md transition-colors"
                aria-label="Close overview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hero Content Overlay */}
          <div className="absolute bottom-6 left-6 right-6 z-10 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-400/40 backdrop-blur-md">
                {destination.type || 'Verified Destination'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 text-slate-300 text-xs font-medium border border-slate-700 backdrop-blur-md">
                {destination.state} • {destination.region}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {destination.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 mt-2 max-w-3xl leading-relaxed drop-shadow-md">
              {destination.description}
            </p>

            {/* Hero Metric Pills */}
            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-medium">
              <div className="inline-flex items-center gap-1.5 bg-ocean-950/85 px-3 py-1.5 rounded-xl border border-emerald-500/40 text-emerald-300 backdrop-blur-md shadow-sm">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>
                  Demo Safety: <strong>{safety.score}</strong> ({safety.label})
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 bg-ocean-950/85 px-3 py-1.5 rounded-xl border border-cyan-500/40 text-cyan-200 backdrop-blur-md shadow-sm">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Best Season: <strong>{bestSeasonText}</strong></span>
              </div>

              <div className="inline-flex items-center gap-1.5 bg-ocean-950/85 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-200 backdrop-blur-md shadow-sm">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span><strong>{allDestinationPlaces.length}</strong> Must-Visit Places</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <GlassButton
                variant="primary"
                size="md"
                onClick={scrollToPlaces}
                icon={Compass}
              >
                Explore Places ({allDestinationPlaces.length})
              </GlassButton>

              <Link to={`/navigate?city=${destination.id}`}>
                <GlassButton variant="secondary" size="md" icon={Navigation}>
                  Navigate Destination
                </GlassButton>
              </Link>

              <Link to={`/destination/${destination.id}`}>
                <GlassButton variant="outline" size="md" icon={ExternalLink}>
                  Full City Page
                </GlassButton>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DESTINATION INTELLIGENCE COMMAND CENTER */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
          <Sparkles className="w-4 h-4" />
          <span>Destination Intelligence & Telemetry</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Demo Safety Score */}
          <GlassCard className="p-4 flex items-start gap-3 border-cyan-500/30">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Demo Safety Score
              </span>
              <strong className="text-base font-extrabold text-white block mt-0.5">
                {safety.score} / 100
              </strong>
              <span className="text-[10px] text-emerald-300 font-medium">
                {safety.label} Safety Zone
              </span>
            </div>
          </GlassCard>

          {/* Demo Crowd Level */}
          <GlassCard className="p-4 flex items-start gap-3 border-cyan-500/30">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Demo Crowd Index
              </span>
              <strong className="text-base font-extrabold text-white block mt-0.5">
                Moderate Density
              </strong>
              <span className="text-[10px] text-sky-300 font-medium">
                Peak hours 4 PM – 8 PM
              </span>
            </div>
          </GlassCard>

          {/* Recommended Stay */}
          <GlassCard className="p-4 flex items-start gap-3 border-cyan-500/30">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Recommended Duration
              </span>
              <strong className="text-base font-extrabold text-white block mt-0.5">
                2 – 3 Days
              </strong>
              <span className="text-[10px] text-cyan-300 font-medium">
                Optimal exploration
              </span>
            </div>
          </GlassCard>

          {/* Tourist Readiness */}
          <GlassCard className="p-4 flex items-start gap-3 border-cyan-500/30">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Tourist Readiness
              </span>
              <strong className="text-base font-extrabold text-white block mt-0.5">
                Tier 1 Verified
              </strong>
              <span className="text-[10px] text-amber-300 font-medium">
                Corridor Protected
              </span>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 3. AI-STYLE RECOMMENDATION STRIP (SMART PICK — DEMO INTELLIGENCE) */}
      {smartPickPlace && (
        <section className="space-y-3">
          <div className="p-5 rounded-3xl bg-gradient-to-r from-ocean-950 via-slate-900/90 to-ocean-950 border border-cyan-400/40 shadow-cyan-glow relative overflow-hidden">
            {/* Background Glow Accent */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400 text-ocean-950 text-xs font-black tracking-wider shadow-cyan-glow">
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    SMART PICK — DEMO INTELLIGENCE
                  </span>
                  <span className="text-xs text-cyan-300 font-semibold hidden sm:inline">
                    Curated Recommendation
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {smartPickPlace.name}
                </h3>

                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  "Based on your destination, this is the highest safety-rated landmark with balanced crowd density and rich visitor telemetry."
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300">
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-700">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    Category: <strong className="text-white ml-1">{smartPickPlace.category}</strong>
                  </span>
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-700">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Duration: <strong className="text-white ml-1">{smartPickPlace.duration}</strong>
                  </span>
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Safety: <strong className="text-white ml-1">{smartPickPlace.safetyLevel}</strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                <GlassButton
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedPlaceId(smartPickPlace.id);
                    navigate('/navigate', { state: { targetPlace: smartPickPlace } });
                  }}
                  icon={Navigation}
                  className="w-full"
                >
                  Navigate Smart Pick
                </GlassButton>

                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedPlaceId(smartPickPlace.id);
                    openPlaceDetails(smartPickPlace);
                  }}
                  icon={Eye}
                  className="w-full"
                >
                  View Details
                </GlassButton>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. MUST-VISIT PLACES SECTION ("What should I visit here?") */}
      <section ref={placesSectionRef} id="destination-places" className="space-y-5 pt-2">
        {/* Section Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Smart Discovery & Tourism Intelligence</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            What should I visit here?
          </h2>

          <p className="text-xs sm:text-sm text-slate-300">
            Discover the places worth adding to your journey in {destination.name}.
          </p>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input inside Destination */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchPlaceQuery}
                onChange={(e) => setSearchPlaceQuery(e.target.value)}
                placeholder={`Search places in ${destination.name}...`}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-ocean-950/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
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
                className="bg-ocean-950/90 text-xs text-cyan-300 font-medium rounded-xl border border-slate-700 px-2.5 py-2 focus:outline-none focus:border-cyan-400 select-none cursor-pointer"
              >
                <option value="recommended">Recommended (Smart Pick)</option>
                <option value="safety">Highest Safety Rating</option>
                <option value="crowd">Lowest Crowd Density</option>
                <option value="duration">Shortest Duration</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <button
              type="button"
              onClick={() => setActiveCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border whitespace-nowrap select-none ${
                activeCategory === 'ALL'
                  ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400 shadow-cyan-glow font-bold scale-105'
                  : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:border-cyan-500/40 hover:text-white'
              }`}
            >
              All Categories ({allDestinationPlaces.length})
            </button>
            {availableCategories.map((cat) => {
              const count = allDestinationPlaces.filter((p) => p.category === cat).length;
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border whitespace-nowrap select-none ${
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
        </div>

        {/* Place Cards List */}
        {filteredAndSortedPlaces.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredAndSortedPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                isSelected={selectedPlaceId === place.id}
                isSmartPick={smartPickPlace?.id === place.id}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400">
            <Compass className="w-8 h-8 text-cyan-400/50 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">No tourist places found matching your filter</h4>
            <p className="text-xs mt-1">Try clearing your search or switching to 'All Categories'.</p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('ALL');
                setSearchPlaceQuery('');
              }}
              className="mt-3 text-xs font-semibold text-cyan-300 hover:underline"
            >
              Reset Filters & Search
            </button>
          </div>
        )}
      </section>

      {/* 5. SAFETY AROUND THIS DESTINATION & NEARBY SAFE ZONES */}
      {aggregatedSafeZones.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Shield className="w-4 h-4" />
            <span>Safety Around {destination.name} & Emergency Support</span>
          </div>

          <GlassCard className="p-5 border-emerald-500/30 bg-emerald-950/10">
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              Verified emergency response stations, tourist police assistance booths, and medical centers protecting the {destination.name} tourist circuit:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {aggregatedSafeZones.map((zone, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/70 border border-emerald-500/20 text-xs text-slate-200"
                >
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">{zone}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-4 text-xs text-emerald-300 font-medium">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pan-India Emergency Helpline: <strong>112</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tourist Assistance Helpline: <strong>1363</strong></span>
              </div>
            </div>
          </GlassCard>
        </section>
      )}

      {/* 6. NEARBY ATTRACTIONS */}
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
    </div>
  );
}

export default DestinationOverview;