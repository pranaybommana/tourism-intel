import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Users,
  Shield,
  MapPin,
  Bookmark,
  Navigation,
  Eye,
  CheckCircle2,
  Sparkles,
  Sun,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';
import StatusBadge from '../ui/StatusBadge';
import { formatCrowdLevel } from '../../utils/safetyUtils';
import { useDestinations } from '../../context/DestinationContext';

export function PlaceCard({ place, isSelected = false, isSmartPick = false, onSelect }) {
  const navigate = useNavigate();
  const {
    openPlaceDetails,
    isSaved,
    toggleSavePlace,
    selectedPlaceId,
    setSelectedPlaceId,
  } = useDestinations();

  if (!place) return null;

  const saved = isSaved(place.id);
  const active = isSelected || selectedPlaceId === place.id;
  const crowd = formatCrowdLevel(place.crowdLevel);

  const handleNavigate = (e) => {
    e.stopPropagation();
    setSelectedPlaceId(place.id);
    navigate('/navigate', { state: { targetPlace: place } });
  };

  const handleSaveToggle = (e) => {
    e.stopPropagation();
    toggleSavePlace(place);
  };

  const handleOpenDetails = (e) => {
    if (e) e.stopPropagation();
    setSelectedPlaceId(place.id);
    if (onSelect) onSelect(place);
    openPlaceDetails(place);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpenDetails(e);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpenDetails}
      onKeyDown={handleKeyDown}
      aria-label={`View details for ${place.name}, ${place.destination}`}
      aria-pressed={active}
      className={`group cursor-pointer rounded-3xl transition-all duration-300 transform select-none outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
        active
          ? 'ring-2 ring-cyan-400 shadow-cyan-glow-lg border-cyan-400 scale-[1.01]'
          : 'hover:-translate-y-1 hover:shadow-cyan-glow'
      }`}
    >
      <GlassCard
        className={`overflow-hidden flex flex-col md:flex-row gap-5 p-4 sm:p-5 rounded-3xl border transition-all duration-300 ${
          active
            ? 'bg-slate-900/95 border-cyan-400/80 shadow-cyan-glow'
            : 'bg-slate-900/75 border-cyan-500/20 group-hover:border-cyan-400/50'
        }`}
      >
        {/* Place Hero Image */}
        <div className="relative w-full md:w-64 h-48 md:h-auto rounded-2xl overflow-hidden shrink-0 bg-slate-950">
          <img
            src={place.image}
            alt={place.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=800&q=80';
            }}
          />

          {/* Oceanic Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-ocean-950 via-ocean-950/30 to-transparent pointer-events-none" />

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
            <div className="flex items-center gap-1.5">
              <StatusBadge status={place.safetyLevel} size="sm" />
              {isSmartPick && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-400 text-ocean-950 text-[10px] font-extrabold shadow-cyan-glow tracking-wider">
                  <Sparkles className="w-3 h-3 fill-current" />
                  SMART PICK
                </span>
              )}
            </div>

            {saved && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/90 text-ocean-950 text-[10px] font-bold shadow-md">
                <Bookmark className="w-3 h-3 fill-current" />
                SAVED
              </span>
            )}
          </div>

          {/* Bottom Overlay Category Badge */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-ocean-950/85 text-cyan-300 border border-cyan-500/30 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider shadow-sm">
              {place.category}
            </span>

            <span className="text-[10px] font-medium text-slate-300 bg-ocean-950/85 px-2 py-0.5 rounded-lg border border-slate-700 backdrop-blur-md">
              {place.destination}
            </span>
          </div>
        </div>

        {/* Place Details & Intelligence */}
        <div className="flex-1 flex flex-col justify-between space-y-3">
          <div>
            {/* Header: Name, Location, Duration & Crowd */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1.5">
              <div>
                <h3
                  className={`text-lg sm:text-xl font-black tracking-tight transition-colors ${
                    active ? 'text-cyan-300' : 'text-white group-hover:text-cyan-300'
                  }`}
                >
                  {place.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{place.destination}, {place.state}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1 text-xs text-slate-300 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{place.duration}</span>
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900/60 ${crowd.class}`}
                >
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span>{crowd.label}</span>
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mt-2">
              {place.description}
            </p>

            {/* Intelligence Grid: Highlights & Safe Zones Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
              <div className="bg-ocean-950/60 rounded-xl p-2.5 border border-slate-800/80">
                <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block mb-1 flex items-center gap-1">
                  <Compass className="w-3 h-3 text-cyan-400" />
                  Key Highlights
                </span>
                <ul className="space-y-0.5 text-slate-300 text-[11px]">
                  {place.thingsToSee?.slice(0, 2).map((item, idx) => (
                    <li key={idx} className="truncate flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                      <span className="truncate">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-ocean-950/60 rounded-xl p-2.5 border border-slate-800/80">
                <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Nearby Safe Zone
                </span>
                <div className="text-slate-300 text-[11px] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span className="truncate">
                    {place.nearbySafeZones?.[0] || 'Local Tourist Assistance Available'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400 text-[11px] flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              Best Time: <strong className="text-slate-200 ml-0.5">{place.bestTime}</strong>
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <GlassButton
                variant={saved ? 'secondary' : 'outline'}
                size="sm"
                onClick={handleSaveToggle}
                icon={Bookmark}
                className={saved ? 'border-cyan-400 text-cyan-300 shadow-cyan-glow font-bold' : ''}
              >
                {saved ? '✓ Saved' : 'Save Offline'}
              </GlassButton>

              <GlassButton
                variant="secondary"
                size="sm"
                onClick={handleOpenDetails}
                icon={Eye}
              >
                View Details
              </GlassButton>

              <GlassButton
                variant="primary"
                size="sm"
                onClick={handleNavigate}
                icon={Navigation}
              >
                Navigate Safely
              </GlassButton>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

export default PlaceCard;