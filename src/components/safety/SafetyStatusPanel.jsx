import React from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Wifi,
  WifiOff,
  BatteryCharging,
  BatteryWarning,
  Navigation,
  Database,
  Radio,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { useAppState } from '../../hooks/useAppState';
import { APP_STATES, APP_STATE_META } from '../../constants/appStates';

export function SafetyStatusPanel({ className, compact = false }) {
  const { appState, meta, isOnline, connectionDetails, batteryState } = useAppState();

  const modeIcons = {
    [APP_STATES.ONLINE]: ShieldCheck,
    [APP_STATES.LOW_CONNECTIVITY]: WifiOff,
    [APP_STATES.OFFLINE_SAFETY]: ShieldAlert,
    [APP_STATES.LOW_BATTERY]: BatteryWarning,
  };

  const ModeIcon = modeIcons[appState] || ShieldCheck;

  // Battery percentage display (default to 18% if simulating low battery)
  const displayBattery = appState === APP_STATES.LOW_BATTERY
    ? '18% (Power Saver)'
    : `${Math.round((batteryState.level || 1.0) * 100)}%`;

  return (
    <GlassCard glow={appState !== APP_STATES.ONLINE} className={`p-4 sm:p-5 border-cyan-500/30 space-y-4 ${className}`}>
      {/* Mode Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${meta.badgeClass}`}>
            <ModeIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
              Safe Travel Mode Telemetry
            </span>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white">{meta.label}</h3>
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold border uppercase ${meta.badgeClass}`}>
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Live Hardware Indicators */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>GPS: <strong className="text-emerald-400">High Precision</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
            {appState === APP_STATES.LOW_BATTERY ? (
              <BatteryWarning className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <BatteryCharging className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>Battery: <strong className={appState === APP_STATES.LOW_BATTERY ? 'text-rose-400' : 'text-white'}>{displayBattery}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cache: <strong className="text-emerald-400">IndexedDB Ready</strong></span>
          </div>
        </div>
      </div>

      {/* Mode Specific Description */}
      <p className="text-xs text-slate-300 leading-relaxed">
        {meta.description}
      </p>

      {/* Feature Availability Matrix */}
      <div>
        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block mb-2">
          Safety Feature Availability Matrix ({meta.label})
        </span>

        {appState === APP_STATES.ONLINE && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">GPS Safe Corridor</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Live</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Live Crowd Telemetry</span>
              <span className="text-cyan-300 font-medium text-[10px]">Demo Intel ✓</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Transport Schedules</span>
              <span className="text-cyan-300 font-medium text-[10px]">Prototype ✓</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Price Intelligence</span>
              <span className="text-cyan-300 font-medium text-[10px]">Prototype ✓</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Community Reports</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Active</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">AI Safety Advisor</span>
              <span className="text-cyan-300 font-medium text-[10px]">Rule AI ✓</span>
            </div>
          </div>
        )}

        {appState === APP_STATES.LOW_CONNECTIVITY && (
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span><strong>Low Connectivity:</strong> Essential safety functions remain active. Heavy media deferred.</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">GPS Navigation</span>
                <span className="text-emerald-400 font-bold">Active ✓</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Saved Routes</span>
                <span className="text-emerald-400 font-bold">Active ✓</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Emergency Hotlines</span>
                <span className="text-emerald-400 font-bold">112 / 1363 ✓</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Live Crowd Sync</span>
                <span className="text-amber-400 font-medium text-[10px]">Delayed ✕</span>
              </div>
            </div>
          </div>
        )}

        {appState === APP_STATES.OFFLINE_SAFETY && (
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-200 flex items-center gap-2 shadow-cyan-glow">
              <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
              <span><strong>Offline Safety Mode Active:</strong> Zero network connection. Using verified offline cache.</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Offline Map</span>
                <span className="text-cyan-300 font-semibold text-[10px]">Saved Offline ✓</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">GPS Waypoints</span>
                <span className="text-emerald-400 font-bold">Active ✓</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Saved Route</span>
                <span className="text-cyan-300 font-semibold text-[10px]">Available Offline ✓</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Emergency Hotlines</span>
                <span className="text-emerald-400 font-bold">112 / 1363 ✓</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Live Crowd Sync</span>
                <span className="text-rose-400 font-bold text-[10px]">Offline ✕</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Live Transport</span>
                <span className="text-rose-400 font-bold text-[10px]">Offline ✕</span>
              </div>
            </div>
          </div>
        )}

        {appState === APP_STATES.LOW_BATTERY && (
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-200 flex items-center gap-2">
              <BatteryWarning className="w-4 h-4 text-rose-400 shrink-0" />
              <span><strong>Low Battery Safety Mode ({displayBattery}):</strong> Non-essential animations paused to conserve charge.</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Navigation</span>
                <span className="text-emerald-400 font-bold">Preserved ✓</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Emergency 112</span>
                <span className="text-emerald-400 font-bold">Preserved ✓</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">GPS Polling</span>
                <span className="text-cyan-300 font-semibold text-[10px]">Optimized ✓</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">UI Animations</span>
                <span className="text-rose-400 font-medium text-[10px]">Restricted ✕</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

export default SafetyStatusPanel;