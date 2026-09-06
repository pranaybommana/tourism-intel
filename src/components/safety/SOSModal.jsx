import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  X,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Copy,
  MapPin,
  Share2,
} from 'lucide-react';
import GlassButton from '../ui/GlassButton';

export function SOSModal({ isOpen, onClose, userCoordinates, targetPlace }) {
  const [countdown, setCountdown] = useState(3);
  const [isBroadcasted, setIsBroadcasted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let timer;
    if (isOpen && !isBroadcasted) {
      setCountdown(3);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTriggerBroadcast();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen]);

  const handleTriggerBroadcast = () => {
    setIsBroadcasted(true);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        'Emergency SOS broadcasted. Telemetry and coordinates shared with National Emergency 112 and local tourist police.'
      );
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasCoords = Boolean(userCoordinates?.lat && userCoordinates?.lng);
  const latStr = hasCoords ? userCoordinates.lat.toFixed(5) : 'Acquiring GPS...';
  const lngStr = hasCoords ? userCoordinates.lng.toFixed(5) : 'Acquiring GPS...';
  const distressMessage = hasCoords
    ? `EMERGENCY SOS: Tourist distress beacon triggered at Lat: ${latStr}, Lng: ${lngStr} near ${targetPlace?.name || 'Tourist Location'}. Please dispatch immediate police / medical assistance.`
    : `EMERGENCY SOS: Tourist distress beacon triggered near ${targetPlace?.name || 'Tourist Location'} (GPS pending). Please dispatch immediate police / medical assistance.`;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(distressMessage).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border-2 border-rose-500/80 bg-gradient-to-b from-rose-950/90 via-slate-900/95 to-ocean-950/95 p-6 sm:p-8 shadow-[0_0_50px_rgba(244,63,94,0.35)] overflow-hidden text-center">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* SOS Header Icon */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-500/20 border-2 border-rose-500/60 flex items-center justify-center text-rose-400 mb-4 shadow-[0_0_25px_rgba(244,63,94,0.5)] animate-pulse">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-rose-500/20 text-rose-300 border border-rose-500/40 inline-block mb-2">
          Hackathon Prototype Simulation
        </span>

        <h2 className="text-2xl font-black text-white tracking-tight mb-1">
          {isBroadcasted ? 'EMERGENCY SOS BROADCAST ACTIVE' : `AUTO-DISPATCH IN ${countdown} SECONDS`}
        </h2>

        <p className="text-xs text-slate-300 max-w-sm mx-auto mb-5">
          {isBroadcasted
            ? 'Distress packet and high-precision coordinates dispatched to local police & emergency services.'
            : 'Click Cancel to abort or Broadcast Now to send immediate distress packet.'}
        </p>

        {/* Telemetry Details */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-rose-500/30 text-left text-xs space-y-2 mb-6">
          <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-1.5">
            <span className="flex items-center gap-1.5 text-rose-300 font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              Live Distress GPS:
            </span>
            <span className="font-mono text-white font-bold">
              {hasCoords ? `${latStr}, ${lngStr}` : 'Acquiring GPS Signal...'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-1.5">
            <span>Nearest Police Outpost:</span>
            <strong className="text-emerald-400">{targetPlace?.nearbySafeZones?.[0] || 'Local Tourist Police (200m)'}</strong>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span>Protocol Status:</span>
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <Radio className="w-3 h-3 animate-ping" />
              Beacon Transmitting
            </span>
          </div>
        </div>

        {/* Emergency Helplines Direct Dial */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <a
            href="tel:112"
            className="p-3 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/50 text-white flex flex-col items-center justify-center transition-all"
          >
            <PhoneCall className="w-4 h-4 text-rose-400 mb-1" />
            <span className="text-[10px] text-slate-300 font-medium">Police / Med</span>
            <strong className="text-sm font-bold font-mono">112</strong>
          </a>

          <a
            href="tel:1363"
            className="p-3 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-white flex flex-col items-center justify-center transition-all"
          >
            <ShieldAlert className="w-4 h-4 text-cyan-400 mb-1" />
            <span className="text-[10px] text-slate-300 font-medium">Tourist Help</span>
            <strong className="text-sm font-bold font-mono">1363</strong>
          </a>

          <a
            href="tel:1091"
            className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-white flex flex-col items-center justify-center transition-all"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[10px] text-slate-300 font-medium">Women Safety</span>
            <strong className="text-sm font-bold font-mono">1091</strong>
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 justify-center">
          <button
            type="button"
            onClick={handleCopyMessage}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
            <span>{copied ? 'Distress Text Copied!' : 'Copy Distress SMS'}</span>
          </button>

          {!isBroadcasted ? (
            <button
              type="button"
              onClick={handleTriggerBroadcast}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/40 transition-all flex items-center justify-center gap-1.5"
            >
              <Radio className="w-4 h-4" />
              <span>Broadcast SOS Now</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-600 transition-colors"
            >
              Close Beacon Console
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SOSModal;