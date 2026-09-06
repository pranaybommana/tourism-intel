import React from 'react';
import { useAppState } from '../../hooks/useAppState';
import { APP_STATES, APP_STATE_META } from '../../constants/appStates';
import { Shield, Wifi, BatteryWarning, AlertTriangle } from 'lucide-react';

export function AppStateIndicator() {
  const { appState, setAppStateOverride, clearStateOverride, meta } = useAppState();

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md text-xs shadow-inner">
      <div className="flex items-center gap-1 px-2 py-0.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">{meta.label}</span>
      </div>

      <div className="hidden sm:flex items-center gap-1 border-l border-slate-700/60 pl-1.5 pr-0.5">
        <button
          title="Simulate Online Mode"
          onClick={() => clearStateOverride()}
          className={`p-1 rounded-lg transition-all ${
            appState === APP_STATES.ONLINE
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-bold'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Wifi className="w-3.5 h-3.5" />
        </button>

        <button
          title="Simulate Low Connectivity Mode"
          onClick={() => setAppStateOverride(APP_STATES.LOW_CONNECTIVITY)}
          className={`p-1 rounded-lg transition-all ${
            appState === APP_STATES.LOW_CONNECTIVITY
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-bold'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
        </button>

        <button
          title="Simulate Offline Safety Mode"
          onClick={() => setAppStateOverride(APP_STATES.OFFLINE_SAFETY)}
          className={`p-1 rounded-lg transition-all ${
            appState === APP_STATES.OFFLINE_SAFETY
              ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/60 shadow-cyan-glow font-bold'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
        </button>

        <button
          title="Simulate Low Battery Mode"
          onClick={() => setAppStateOverride(APP_STATES.LOW_BATTERY)}
          className={`p-1 rounded-lg transition-all ${
            appState === APP_STATES.LOW_BATTERY
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm font-bold'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
          }`}
        >
          <BatteryWarning className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default AppStateIndicator;