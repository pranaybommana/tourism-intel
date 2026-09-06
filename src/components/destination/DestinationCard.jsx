import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Compass,
  ArrowRight,
  ShieldCheck,
  Shield,
  Sun,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { useDestinations } from '../../context/DestinationContext';

export function DestinationCard({ destination, onSelect, isSelected = false }) {
  const { selectedDestinationId, setSelectedDestinationId, places } = useDestinations();

  if (!destination) return null;

  const active = isSelected || selectedDestinationId === destination.id;

  // Dynamic calculation of tourist places for this destination
  const destinationPlaces = places ? places.filter((p) => p.destinationId === destination.id) : [];
  const placeCount =
    destinationPlaces.length > 0
      ? destinationPlaces.length
      : destination.touristPlaceCount || destination.placeCount || 0;

  // Standardized Demo Safety Score mapping
  const getDemoSafety = (dest) => {
    if (dest.safetyScore) {
      return {
        score: dest.safetyScore,
        level: dest.safetyLevel || 'SAFE',
        label: dest.safetyLevel === 'SAFE' ? 'GOOD' : dest.safetyLevel || 'GOOD',
        badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/60',
      };
    }
    const lvl = String(dest.safetyLevel || 'SAFE').toUpperCase();
    switch (lvl) {
      case 'SAFE':
        return {
          score: 94,
          level: 'SAFE',
          label: 'GOOD',
          badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/70',
        };
      case 'MODERATE':
        return {
          score: 82,
          level: 'MODERATE',
          label: 'MODERATE',
          badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-950/70',
        };
      case 'CAUTION':
        return {
          score: 65,
          level: 'CAUTION',
          label: 'CAUTION',
          badgeColor: 'text-orange-400 border-orange-500/30 bg-orange-950/70',
        };
      case 'RESTRICTED':
        return {
          score: 42,
          level: 'RESTRICTED',
          label: 'ADVISORY',
          badgeColor: 'text-rose-400 border-rose-500/30 bg-rose-950/70',
        };
      default:
        return {
          score: 91,
          level: 'SAFE',
          label: 'GOOD',
          badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/70',
        };
    }
  };

  const safety = getDemoSafety(destination);
  const bestSeasonText = destination.bestSeason || 'Seasonal info unavailable';

  const handleClick = (e) => {
    if (e) e.stopPropagation();
    if (onSelect) {
      onSelect(destination);
    } else {
      const willBeActive = selectedDestinationId !== destination.id;
      setSelectedDestinationId(willBeActive ? destination.id : null);
      if (willBeActive) {
        setTimeout(() => {
          const el = document.getElementById('destination-overview');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Explore ${destination.name}, ${destination.state} (${destination.region})`}
      aria-pressed={active}
      className={`group cursor-pointer rounded-3xl transition-all duration-300 transform select-none outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
        active
          ? 'scale-[1.02] shadow-cyan-glow-lg ring-2 ring-cyan-400 border-cyan-400'
          : 'hover:-translate-y-1.5 hover:shadow-cyan-glow'
      }`}
    >
      <GlassCard
        className={`overflow-hidden flex flex-col h-full rounded-3xl border transition-all duration-300 ${
          active
            ? 'bg-slate-900/95 border-cyan-400/90 shadow-cyan-glow'
            : 'bg-slate-900/75 border-cyan-500/20 group-hover:border-cyan-400/50'
        }`}
      >
        {/* Destination Image Area */}
        <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950 rounded-t-3xl">
          <img
            src={destination.image}
            alt={destination.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={(e) => {
              // Graceful fallback for broken image links
              e.target.src =
                'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=800&q=80';
            }}
          />

          {/* Oceanic Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-ocean-950 via-ocean-950/35 to-transparent pointer-events-none" />

          {/* Top Badges: Safety & Active State */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
            {/* Compact Safety Pill */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border backdrop-blur-md text-[11px] font-semibold tracking-wide ${safety.badgeColor}`}
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>
                Safety <strong className="font-extrabold text-white ml-0.5">{safety.score}</strong>{' '}
                <span className="text-[10px] opacity-80 uppercase">({safety.label})</span>
              </span>
            </div>

            {/* Active Selection Indicator */}
            {active && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-400 text-ocean-950 text-[10px] font-extrabold shadow-cyan-glow tracking-wider">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                SELECTED
              </span>
            )}
          </div>

          {/* Bottom Image Overlay Pill: Places Count */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs pointer-events-none">
            <span className="inline-flex items-center gap-1 font-semibold bg-ocean-950/85 px-2.5 py-1 rounded-xl border border-cyan-500/30 text-cyan-200 backdrop-blur-md shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              {placeCount} Places
            </span>

            <span className="text-[11px] font-medium text-slate-300 bg-ocean-950/85 px-2.5 py-1 rounded-xl border border-slate-700/80 backdrop-blur-md">
              {destination.type || 'Tourist Hub'}
            </span>
          </div>
        </div>

        {/* Card Content & Intelligence */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            {/* Header: Destination Name + Region/State */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3
                  className={`text-lg sm:text-xl font-black tracking-tight transition-colors ${
                    active ? 'text-cyan-300' : 'text-white group-hover:text-cyan-300'
                  }`}
                >
                  {destination.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400/90 mt-0.5">
                  <span className="text-slate-300">{destination.state}</span>
                  <span className="text-cyan-600">•</span>
                  <span className="text-cyan-400">{destination.region}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mt-2.5">
              {destination.description}
            </p>
          </div>

          {/* Intelligence Highlights Grid */}
          <div className="pt-3 border-t border-slate-800/80 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Demo Safety Box */}
              <div className="p-2 rounded-xl bg-ocean-950/60 border border-slate-800 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  Demo Safety
                </span>
                <span className="text-xs font-bold text-white mt-0.5">
                  {safety.score} <span className="text-[10px] font-medium text-cyan-300">({safety.label})</span>
                </span>
              </div>

              {/* Best Season Box */}
              <div className="p-2 rounded-xl bg-ocean-950/60 border border-slate-800 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-cyan-400" />
                  Best Season
                </span>
                <span className="text-xs font-bold text-slate-200 truncate mt-0.5" title={bestSeasonText}>
                  {bestSeasonText}
                </span>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClick}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 border select-none ${
                  active
                    ? 'bg-gradient-to-r from-cyan-400 to-sky-400 text-ocean-950 border-cyan-300 shadow-cyan-glow font-extrabold'
                    : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-white border-cyan-500/30 hover:border-cyan-400/60'
                }`}
              >
                <span>{active ? 'SELECTED' : 'EXPLORE'}</span>
                <ArrowRight
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    active ? 'translate-x-0' : 'group-hover:translate-x-1'
                  }`}
                />
              </button>

              <Link
                to={`/destination/${destination.id}`}
                onClick={(e) => e.stopPropagation()}
                className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-900/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-400 flex items-center gap-1 transition-all"
                title={`Open full page for ${destination.name}`}
                aria-label={`Open full page for ${destination.name}`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Page</span>
              </Link>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

export default DestinationCard;