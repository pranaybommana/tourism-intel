import React from 'react';
import { MapPin, Navigation, Shield, Compass } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

export function MapPlaceholder({
  center = { lat: 20.5937, lng: 78.9629 },
  places = [],
  className,
  height = 'h-96',
}) {
  return (
    <GlassCard className={`relative overflow-hidden flex flex-col items-center justify-center ${height} ${className}`}>
      {/* Visual map grid backdrop */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center p-6 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400 shadow-cyan-glow animate-pulse-slow">
          <Navigation className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Geospatial Telemetry & Map</h3>
        <p className="text-xs text-slate-400 mb-4">
          Google Maps powered navigation active with offline safety radius and safe zone checkpoints.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-cyan-500/20 text-cyan-300 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            Lat: {center.lat.toFixed(4)}, Lng: {center.lng.toFixed(4)}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-emerald-500/20 text-emerald-300 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            {places.length} Checkpoints Ready
          </span>
        </div>
      </div>
    </GlassCard>
  );
}

export default MapPlaceholder;
