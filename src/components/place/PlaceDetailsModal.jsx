import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Clock,
  Users,
  Shield,
  ShieldCheck,
  MapPin,
  Compass,
  Bookmark,
  Navigation,
  Volume2,
  VolumeX,
  Pause,
  Play,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  PhoneCall,
  Sun,
  Globe,
  HelpCircle,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import GlassButton from '../ui/GlassButton';
import GlassCard from '../ui/GlassCard';
import StatusBadge from '../ui/StatusBadge';
import { formatCrowdLevel } from '../../utils/safetyUtils';
import { useDestinations } from '../../context/DestinationContext';

export function PlaceDetailsModal() {
  const navigate = useNavigate();
  const {
    detailModalPlace,
    closePlaceDetails,
    openPlaceDetails,
    isSaved,
    toggleSavePlace,
    places,
    setSelectedPlaceId,
  } = useDestinations();

  // Audio Guide State using Web Speech API
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPausedAudio, setIsPausedAudio] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const place = detailModalPlace;

  // Cleanup speech synthesis on close, place change, or unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [place]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        closePlaceDetails();
      }
    };
    if (place) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [place, closePlaceDetails]);

  if (!place) return null;

  const saved = isSaved(place.id);
  const crowd = formatCrowdLevel(place.crowdLevel);

  // Dynamic Rule-Based Travel Assistant Tip
  const assistantTip = useMemo(() => {
    const crowdLower = String(place.crowdLevel || '').toLowerCase();
    const safetyUpper = String(place.safetyLevel || 'SAFE').toUpperCase();

    let crowdAdvice = 'Consider visiting during the recommended time for a more comfortable experience.';
    if (crowdLower === 'low') {
      crowdAdvice = 'Current demo telemetry suggests lower crowd density. This is an ideal window for relaxed sightseeing, walking tours, and photography.';
    } else if (crowdLower === 'high' || crowdLower === 'very high') {
      crowdAdvice = 'High visitor volume detected in demo telemetry. Plan an early morning visit or explore nearby corridor attractions to avoid peak entry queues.';
    } else {
      crowdAdvice = `Moderate visitor flow expected. Arriving around ${place.bestTime || 'recommended hours'} ensures smooth entry and comfortable navigation.`;
    }

    let safetyAdvice = 'Standard verified tourism zone with active police and emergency response.';
    if (safetyUpper === 'SAFE') {
      safetyAdvice = 'High safety index. Verified tourist police presence and continuous illuminated corridor coverage.';
    } else if (safetyUpper === 'MODERATE') {
      safetyAdvice = 'Moderate safety index. Stay mindful of personal belongings in dense bazaars and remain on designated tour corridors after dark.';
    }

    return {
      crowdAdvice,
      safetyAdvice,
    };
  }, [place]);

  // Find clickable nearby place objects from dataset if available
  const nearbyAttractionObjects = useMemo(() => {
    if (!Array.isArray(place.nearbyAttractions) || !places) return [];
    return place.nearbyAttractions.map((name) => {
      const match = places.find(
        (p) =>
          p.name.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(p.name.toLowerCase())
      );
      return {
        name,
        matchedPlace: match || null,
      };
    });
  }, [place.nearbyAttractions, places]);

  // Web Speech API Voice Guide
  const handleAudioGuide = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-speech audio guide is not supported in this browser.');
      return;
    }

    if (isPlayingAudio) {
      if (isPausedAudio) {
        window.speechSynthesis.resume();
        setIsPausedAudio(false);
      } else {
        window.speechSynthesis.pause();
        setIsPausedAudio(true);
      }
      return;
    }

    window.speechSynthesis.cancel();

    const highlightsText = Array.isArray(place.thingsToSee) && place.thingsToSee.length > 0
      ? `Notable highlights to see include: ${place.thingsToSee.join(', ')}.`
      : '';
    const activitiesText = Array.isArray(place.thingsToDo) && place.thingsToDo.length > 0
      ? `Recommended things to do include: ${place.thingsToDo.join(', ')}.`
      : '';
    const safeZonesText = Array.isArray(place.nearbySafeZones) && place.nearbySafeZones.length > 0
      ? `Nearby verified safe stations include: ${place.nearbySafeZones.join(', ')}.`
      : '';

    const narrationText = `Welcome to ${place.name}, located in ${place.destination}, ${place.state}. ${place.description} The best time to explore this attraction is ${place.bestTime}, with a recommended visit duration of ${place.duration}. Currently, demo crowd telemetry indicates ${crowd.label}, and the verified safety index is ${place.safetyLevel}. ${highlightsText} ${activitiesText} ${safeZonesText} Have a safe and memorable visit.`;

    const utterance = new SpeechSynthesisUtterance(narrationText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
    setIsPausedAudio(false);
  };

  const handleStopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    }
  };

  const handleSaveToggle = () => {
    toggleSavePlace(place);
    const newStatus = !saved;
    setToastMessage(newStatus ? '✓ Saved to Offline Storage' : 'Removed from Offline Storage');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleNavigateSafely = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    closePlaceDetails();
    navigate('/navigate', { state: { targetPlace: place } });
  };

  const handleSwitchPlace = (target) => {
    if (!target) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    }
    setSelectedPlaceId(target.id);
    openPlaceDetails(target);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-ocean-950/85 backdrop-blur-2xl animate-in fade-in duration-200">
      {/* Modal Card Container */}
      <div className="relative w-full max-w-4xl rounded-3xl border border-cyan-500/40 glass-panel-glow shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col bg-ocean-950">
        {/* 1. HERO SECTION */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden shrink-0 bg-slate-950">
          <img
            src={place.image}
            alt={place.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=800&q=80';
            }}
          />

          {/* Oceanic Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-ocean-950 via-ocean-950/50 to-ocean-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-ocean-950/80 via-transparent to-ocean-950/30" />

          {/* Close Button */}
          <button
            type="button"
            onClick={() => {
              handleStopAudio();
              closePlaceDetails();
            }}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-ocean-950/85 hover:bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition-all shadow-xl backdrop-blur-md z-20 select-none"
            aria-label="Close place details modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
            <StatusBadge status={place.safetyLevel} size="md" />
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 backdrop-blur-md uppercase tracking-wider">
              {place.category}
            </span>
            {saved && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-400 text-ocean-950 border border-cyan-300 shadow-cyan-glow flex items-center gap-1">
                <Bookmark className="w-3 h-3 fill-current" />
                SAVED OFFLINE
              </span>
            )}
          </div>

          {/* Title & Location on Hero */}
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              {place.destination} • {place.state} {place.region ? `• ${place.region}` : ''}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight mt-0.5">
              {place.name}
            </h1>

            {/* Quick Hero Metrics Bar */}
            <div className="flex flex-wrap items-center gap-2.5 mt-2.5 text-xs text-slate-300 font-medium">
              <span className="inline-flex items-center gap-1 bg-ocean-950/85 px-2.5 py-1 rounded-xl border border-slate-700 backdrop-blur-md">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Best Time: <strong className="text-white ml-1">{place.bestTime}</strong>
              </span>

              <span className="inline-flex items-center gap-1 bg-ocean-950/85 px-2.5 py-1 rounded-xl border border-slate-700 backdrop-blur-md">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Duration: <strong className="text-white ml-1">{place.duration}</strong>
              </span>

              <span className={`inline-flex items-center gap-1 bg-ocean-950/85 px-2.5 py-1 rounded-xl border border-slate-700 backdrop-blur-md ${crowd.class}`}>
                <Users className="w-3.5 h-3.5" />
                Crowd: <strong className="ml-1">{crowd.label}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 2. QUICK ACTION BAR */}
        <div className="p-3 sm:p-4 bg-slate-900/90 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-2.5 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <GlassButton
              variant="primary"
              size="md"
              onClick={handleNavigateSafely}
              icon={Navigation}
              className="shadow-cyan-glow font-bold"
            >
              Navigate Safely
            </GlassButton>

            <GlassButton
              variant={saved ? 'secondary' : 'outline'}
              size="md"
              onClick={handleSaveToggle}
              icon={Bookmark}
              className={saved ? 'border-cyan-400 text-cyan-300 shadow-cyan-glow font-bold' : ''}
            >
              {saved ? '✓ Saved Offline' : 'Save Offline'}
            </GlassButton>
          </div>

          <div className="flex items-center gap-2">
            <GlassButton
              variant={isPlayingAudio ? 'secondary' : 'outline'}
              size="md"
              onClick={handleAudioGuide}
              icon={isPlayingAudio ? (isPausedAudio ? Play : Pause) : Volume2}
              className={isPlayingAudio ? 'border-cyan-400 text-cyan-300 shadow-cyan-glow' : ''}
            >
              {isPlayingAudio ? (isPausedAudio ? 'Resume Audio' : 'Pause Audio') : 'Audio Guide'}
            </GlassButton>

            {isPlayingAudio && (
              <GlassButton variant="ghost" size="md" onClick={handleStopAudio} icon={VolumeX}>
                Stop
              </GlassButton>
            )}
          </div>
        </div>

        {/* 3. SCROLLABLE CONTENT BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* Smart Visit Plan & Travel Intelligence Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Smart Visit Plan Panel */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-cyan-400 uppercase font-black tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Smart Visit Plan — Demo Intelligence
                </span>
                <span className="text-[10px] text-slate-400">Prototype Telemetry</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-ocean-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Optimal Window</span>
                  <span className="font-bold text-white block mt-0.5">{place.bestTime}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-ocean-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Stay Duration</span>
                  <span className="font-bold text-white block mt-0.5">{place.duration}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-ocean-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Crowd Telemetry</span>
                  <span className={`font-bold block mt-0.5 ${crowd.class}`}>{crowd.label}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-ocean-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Safety Index</span>
                  <span className="font-bold text-emerald-300 block mt-0.5">{place.safetyLevel}</span>
                </div>
              </div>
            </div>

            {/* Travel Intelligence Assistant Tip */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/30 via-slate-900/60 to-ocean-950/50 border border-cyan-400/30 flex flex-col justify-between space-y-2.5">
              <div>
                <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-extrabold uppercase tracking-wider mb-1">
                  <Lightbulb className="w-4 h-4 text-cyan-400" />
                  <span>Travel Intelligence — Assistant Tip</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  "{assistantTip.crowdAdvice}"
                </p>
              </div>

              <div className="pt-2 border-t border-cyan-500/20 text-[11px] text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{assistantTip.safetyAdvice}</span>
              </div>
            </div>
          </div>

          {/* Place Description ("About This Place") */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-1.5">
            <h3 className="text-xs uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              About {place.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {place.description}
            </p>
          </div>

          {/* Things to See & Things to Do */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Things to See */}
            {Array.isArray(place.thingsToSee) && place.thingsToSee.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  What to See ({place.thingsToSee.length} Highlights)
                </h4>
                <div className="space-y-2">
                  {place.thingsToSee.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-ocean-950/70 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-200"
                    >
                      <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1 shrink-0" />
                      <span className="leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Things to Do */}
            {Array.isArray(place.thingsToDo) && place.thingsToDo.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  What to Do & Experiences
                </h4>
                <div className="space-y-2">
                  {place.thingsToDo.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-ocean-950/70 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-200"
                    >
                      <span className="w-2 h-2 rounded-full bg-sky-400 mt-1 shrink-0" />
                      <span className="leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Safety Awareness & Nearby Safe Zones */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
            <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              Safety Awareness & Verified Safe Zones
            </h4>

            {Array.isArray(place.nearbySafeZones) && place.nearbySafeZones.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
                {place.nearbySafeZones.map((zone, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/70 border border-emerald-500/20"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">{zone}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-4 text-xs text-emerald-300 font-medium">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pan-India Emergency Helpline: <strong>112</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tourist Police Helpline: <strong>1363</strong></span>
              </div>
            </div>
          </div>

          {/* Clickable Nearby Attractions */}
          {nearbyAttractionObjects.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Nearby Attractions in {place.destination} Circuit
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {nearbyAttractionObjects.map((attraction, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (attraction.matchedPlace) {
                        handleSwitchPlace(attraction.matchedPlace);
                      }
                    }}
                    className={`p-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-2 border select-none ${
                      attraction.matchedPlace
                        ? 'bg-slate-900/80 hover:bg-cyan-500/20 border-slate-800 hover:border-cyan-400 cursor-pointer text-white'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 cursor-default'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="text-xs font-semibold truncate">{attraction.name}</span>
                    </div>
                    {attraction.matchedPlace && (
                      <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4. FOOTER ACTIONS */}
        <div className="p-4 border-t border-cyan-500/20 bg-ocean-950/95 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 backdrop-blur-md">
          <div className="text-xs text-slate-400">
            {toastMessage ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {toastMessage}
              </span>
            ) : (
              <span>
                GPS Coordinates: {place.coordinates?.lat?.toFixed(4)}, {place.coordinates?.lng?.toFixed(4)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <GlassButton
              variant="secondary"
              size="md"
              onClick={() => {
                handleStopAudio();
                closePlaceDetails();
              }}
            >
              Close
            </GlassButton>

            <GlassButton
              variant="primary"
              size="md"
              onClick={handleNavigateSafely}
              icon={Navigation}
              className="shadow-cyan-glow"
            >
              Navigate Safely
            </GlassButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaceDetailsModal;