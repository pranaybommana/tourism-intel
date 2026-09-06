import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  Compass,
  Shield,
  ShieldCheck,
  Users,
  Clock,
  MapPin,
  CheckCircle2,
  Bookmark,
  Navigation,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Lightbulb,
  Sun,
  Leaf,
  SlidersHorizontal,
  Flame,
  ArrowRight,
  Eye,
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';
import StatusBadge from '../ui/StatusBadge';
import { useDestinations } from '../../context/DestinationContext';
import { getRecommendations } from '../../services/ai/recommendationService';
import { formatCrowdLevel } from '../../utils/safetyUtils';

const INTEREST_OPTIONS = [
  { id: 'ALL', label: 'All Interests', icon: Compass },
  { id: 'Heritage', label: 'Heritage', icon: LandmarkIcon },
  { id: 'Nature', label: 'Nature', icon: Leaf },
  { id: 'Beaches', label: 'Beach', icon: Sun },
  { id: 'Spiritual', label: 'Spiritual', icon: Sparkles },
  { id: 'Food & Culture', label: 'Food & Culture', icon: Flame },
  { id: 'Adventure', label: 'Adventure', icon: Compass },
  { id: 'Relaxed', label: 'Relaxed', icon: Sun },
  { id: 'Family Friendly', label: 'Family Friendly', icon: Users },
];

function LandmarkIcon(props) {
  return <Compass {...props} />;
}

const SMART_QUESTIONS = [
  { label: 'Find a less crowded place', pref: 'ALL', crowd: 'low', safety: 'standard' },
  { label: 'Best heritage experience', pref: 'Heritage', crowd: 'balanced', safety: 'standard' },
  { label: 'Good for a short visit', pref: 'ALL', crowd: 'balanced', safety: 'standard', shortVisit: true },
  { label: 'Nature & scenic spots', pref: 'Nature', crowd: 'balanced', safety: 'standard' },
  { label: 'Safety-first option', pref: 'ALL', crowd: 'balanced', safety: 'high' },
];

export function AITravelIntelligence({ destinationId: propDestId, className = '' }) {
  const navigate = useNavigate();
  const {
    selectedDestinationId,
    destinations,
    places,
    openPlaceDetails,
    isSaved,
    toggleSavePlace,
  } = useDestinations();

  // Active Destination: prop > context > 'ALL'
  const activeDestId = propDestId !== undefined ? propDestId : selectedDestinationId;

  // Preferences State
  const [preference, setPreference] = useState('ALL');
  const [crowdPreference, setCrowdPreference] = useState('balanced'); // 'low' | 'balanced' | 'any'
  const [safetyPriority, setSafetyPriority] = useState('standard'); // 'standard' | 'high'
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Active destination object for title display
  const currentDestination = useMemo(() => {
    if (!activeDestId || activeDestId === 'ALL') return null;
    return destinations.find((d) => d.id === activeDestId) || null;
  }, [activeDestId, destinations]);

  // Compute recommendations using modular recommendation engine
  const recommendationResults = useMemo(() => {
    try {
      return getRecommendations({
        destinationId: activeDestId,
        places,
        preference,
        crowdPreference,
        safetyPriority,
        limit: 3,
      });
    } catch (err) {
      console.error('Error generating recommendations:', err);
      return { topPick: null, alternatives: [], lessCrowdedAlternative: null, saferAlternative: [] };
    }
  }, [activeDestId, places, preference, crowdPreference, safetyPriority]);

  const { topPick, alternatives, lessCrowdedAlternative, saferAlternative } = recommendationResults;

  const handleReset = () => {
    setPreference('ALL');
    setCrowdPreference('balanced');
    setSafetyPriority('standard');
    setActiveQuestion(null);
  };

  const handleQuestionClick = (q) => {
    setActiveQuestion(q.label);
    setPreference(q.pref);
    setCrowdPreference(q.crowd);
    setSafetyPriority(q.safety);
  };

  const handleSaveToggle = (place) => {
    if (!place) return;
    toggleSavePlace(place);
    const saved = isSaved(place.id);
    setToastMessage(saved ? 'Removed from Offline Storage' : '✓ Saved to Offline Storage');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleNavigateSafely = (place) => {
    if (!place) return;
    navigate('/navigate', { state: { targetPlace: place } });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. MAIN AI HEADER & BANNER */}
      <GlassCard glow className="p-6 border-cyan-500/40 relative overflow-hidden bg-ocean-950/90">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-cyan-500/20 pb-5 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center text-ocean-950 shadow-cyan-glow shrink-0">
              <Bot className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  AI TRAVEL INTELLIGENCE
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-2.5 h-2.5" />
                  DEMO AI INTELLIGENCE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Explore smarter. Travel safer. Discover more.
                {currentDestination && (
                  <span className="text-cyan-400 font-semibold ml-1.5">
                    • Tailored for {currentDestination.name}, {currentDestination.state}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all select-none"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Preferences
            </button>
          </div>
        </div>

        {/* 2. SMART EXPLORATION INQUIRY CHIPS */}
        <div className="pt-4 space-y-2 relative z-10">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Smart Exploration Inquiries:
          </span>
          <div className="flex flex-wrap gap-2">
            {SMART_QUESTIONS.map((q) => {
              const isSelected = activeQuestion === q.label;
              return (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => handleQuestionClick(q)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all select-none border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400 shadow-cyan-glow font-bold'
                      : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-cyan-500/40 hover:text-white'
                  }`}
                >
                  <Sparkles className={`w-3 h-3 ${isSelected ? 'text-cyan-300' : 'text-slate-500'}`} />
                  {q.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. USER PREFERENCE CONTROLS */}
        <div className="pt-5 grid grid-cols-1 md:grid-cols-12 gap-4 relative z-10">
          {/* Interest Preferences (Columns 1-7) */}
          <div className="md:col-span-7 space-y-2">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
              Travel Interest / Category:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {INTEREST_OPTIONS.map((item) => {
                const isSelected = preference === item.id;
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setPreference(item.id);
                      setActiveQuestion(null);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all select-none border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-cyan-500/30 text-white border-cyan-400 shadow-cyan-glow font-bold'
                        : 'bg-slate-900/50 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Crowd Preference (Columns 8-9) */}
          <div className="md:col-span-3 space-y-2">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
              Crowd Preference:
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              {[
                { id: 'low', label: 'Low' },
                { id: 'balanced', label: 'Balanced' },
                { id: 'any', label: 'Any' },
              ].map((opt) => {
                const isSelected = crowdPreference === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setCrowdPreference(opt.id);
                      setActiveQuestion(null);
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all select-none border ${
                      isSelected
                        ? 'bg-cyan-500/30 text-white border-cyan-400 shadow-cyan-glow'
                        : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Safety Priority (Columns 10-12) */}
          <div className="md:col-span-2 space-y-2">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
              Safety Priority:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-center">
              {[
                { id: 'standard', label: 'Standard' },
                { id: 'high', label: 'High' },
              ].map((opt) => {
                const isSelected = safetyPriority === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSafetyPriority(opt.id);
                      setActiveQuestion(null);
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all select-none border ${
                      isSelected
                        ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400 shadow-emerald-glow'
                        : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {safetyPriority === 'high' && (
          <div className="mt-3 text-[11px] text-emerald-400/90 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Safety-first ranking active (based on available demo safety telemetry).</span>
          </div>
        )}
      </GlassCard>

      {/* 4. TOP SMART PICK RECOMMENDATION */}
      {topPick ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <h3 className="text-base sm:text-lg font-black text-white tracking-wide uppercase">
                ✦ TOP SMART PICK
              </h3>
            </div>
            <span className="text-xs text-cyan-400 font-semibold">
              {topPick.recommendationScore}% Match Score
            </span>
          </div>

          {/* Main Top Pick Card */}
          <GlassCard glow className="p-5 sm:p-6 border-cyan-400/40 relative overflow-hidden bg-ocean-950">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Image with Badges */}
              <div className="lg:col-span-5 relative h-52 sm:h-64 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                <img
                  src={topPick.image}
                  alt={topPick.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ocean-950 via-transparent to-transparent" />

                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  <StatusBadge status={topPick.safetyLevel} size="sm" />
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 backdrop-blur-md">
                    {topPick.category}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                  <span className="bg-ocean-950/80 px-2.5 py-1 rounded-xl border border-slate-800 backdrop-blur-md flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {topPick.duration}
                  </span>
                  <span className="bg-ocean-950/80 px-2.5 py-1 rounded-xl border border-slate-800 backdrop-blur-md flex items-center gap-1 font-semibold">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    {topPick.bestTime}
                  </span>
                </div>
              </div>

              {/* Content & Intelligence Breakdown */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {topPick.destination} • {topPick.state}
                  </span>
                  <h4 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                    {topPick.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 mt-1.5 leading-relaxed">
                    {topPick.description}
                  </p>
                </div>

                {/* Why This Place? Reason Callout */}
                <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-400/30 space-y-1">
                  <span className="text-[11px] font-black uppercase text-cyan-300 tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                    Why this place?
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    "{topPick.recommendationReason}"
                  </p>
                </div>

                {/* Score Visualizers */}
                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Crowd Telemetry</span>
                    <span className={`font-bold block mt-0.5 ${formatCrowdLevel(topPick.crowdLevel).class}`}>
                      {formatCrowdLevel(topPick.crowdLevel).label}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Safety Index</span>
                    <span className="font-bold text-emerald-400 block mt-0.5">{topPick.safetyLevel}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Match Confidence</span>
                    <span className="font-bold text-cyan-400 block mt-0.5">{topPick.recommendationScore}%</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <GlassButton
                    variant="primary"
                    size="md"
                    onClick={() => handleNavigateSafely(topPick)}
                    icon={Navigation}
                    className="shadow-cyan-glow font-bold"
                  >
                    Navigate Safely
                  </GlassButton>

                  <GlassButton
                    variant="secondary"
                    size="md"
                    onClick={() => openPlaceDetails(topPick)}
                    icon={Eye}
                  >
                    View Details
                  </GlassButton>

                  <GlassButton
                    variant={isSaved(topPick.id) ? 'secondary' : 'outline'}
                    size="md"
                    onClick={() => handleSaveToggle(topPick)}
                    icon={Bookmark}
                    className={isSaved(topPick.id) ? 'border-cyan-400 text-cyan-300 font-bold' : ''}
                  >
                    {isSaved(topPick.id) ? '✓ Saved Offline' : 'Save Offline'}
                  </GlassButton>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* 5. LESS-CROWDED & SAFER ALTERNATIVE CALLOUTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessCrowdedAlternative && (
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/30 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                    🌱 Less-Crowded Alternative
                  </span>
                  <h5 className="text-sm font-bold text-white">{lessCrowdedAlternative.name}</h5>
                  <p className="text-[11px] text-slate-400">
                    Lower crowd volume ({lessCrowdedAlternative.crowdLevel}) for relaxed exploration.
                  </p>
                </div>
                <GlassButton
                  variant="outline"
                  size="sm"
                  onClick={() => openPlaceDetails(lessCrowdedAlternative)}
                  icon={ArrowRight}
                  className="shrink-0"
                >
                  Explore
                </GlassButton>
              </div>
            )}

            {saferAlternative && (
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/30 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    🛡 Safety-First Alternative
                  </span>
                  <h5 className="text-sm font-bold text-white">{saferAlternative.name}</h5>
                  <p className="text-[11px] text-slate-400">
                    Highest safety tier index ({saferAlternative.safetyLevel}) with emergency stations.
                  </p>
                </div>
                <GlassButton
                  variant="outline"
                  size="sm"
                  onClick={() => openPlaceDetails(saferAlternative)}
                  icon={ArrowRight}
                  className="shrink-0 text-emerald-300 border-emerald-500/40"
                >
                  View Place
                </GlassButton>
              </div>
            )}
          </div>

          {/* 6. ALTERNATIVES GRID */}
          {alternatives && alternatives.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-300 uppercase tracking-wider">
                  Alternative Recommendations in Circuit
                </h4>
                <span className="text-[11px] text-slate-400">{alternatives.length} matching places</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {alternatives.map((altPlace) => (
                  <div
                    key={altPlace.id}
                    className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={altPlace.image}
                        alt={altPlace.name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-950 border border-slate-800"
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-cyan-400 uppercase block truncate">
                          {altPlace.category}
                        </span>
                        <h5 className="text-xs font-bold text-white truncate">{altPlace.name}</h5>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                          <span className={formatCrowdLevel(altPlace.crowdLevel).class}>
                            {formatCrowdLevel(altPlace.crowdLevel).label}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-400">{altPlace.safetyLevel}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-cyan-400 font-semibold">
                        {altPlace.recommendationScore}% Match
                      </span>
                      <button
                        type="button"
                        onClick={() => openPlaceDetails(altPlace)}
                        className="text-xs font-bold text-slate-300 hover:text-cyan-300 flex items-center gap-1 transition-colors select-none"
                      >
                        Explore <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* NO RESULTS STATE */
        <GlassCard className="p-8 text-center space-y-4 border-slate-800">
          <Bot className="w-10 h-10 text-slate-500 mx-auto" />
          <div>
            <h4 className="text-base font-bold text-white">No strong match found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Try adjusting your travel interests or crowd preferences to find recommended attractions.
            </p>
          </div>
          <GlassButton variant="secondary" size="sm" onClick={handleReset} icon={RefreshCw}>
            Reset Preferences
          </GlassButton>
        </GlassCard>
      )}
    </div>
  );
}

export default AITravelIntelligence;
