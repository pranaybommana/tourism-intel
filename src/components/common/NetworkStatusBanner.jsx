import React from 'react';
import { useAppState } from '../../hooks/useAppState';
import { useSync } from '../../context/SyncContext';
import { WifiOff, Zap, ShieldAlert, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { APP_STATES } from '../../constants/appStates';

export function NetworkStatusBanner() {
  const { appState, meta } = useAppState();
  const { syncStatus, isSyncing, pendingCount, triggerSync, retryFailed } = useSync();

  // If online and synced, don't show the banner
  if (appState === APP_STATES.ONLINE && syncStatus !== 'FAILED' && pendingCount === 0) {
    return null;
  }

  const icons = {
    [APP_STATES.OFFLINE_SAFETY]: ShieldAlert,
    [APP_STATES.LOW_CONNECTIVITY]: WifiOff,
    [APP_STATES.LOW_BATTERY]: Zap,
  };

  const IconComponent = icons[appState] || (syncStatus === 'FAILED' ? AlertCircle : ShieldAlert);

  return (
    <div className="sticky top-0 z-50 px-4 py-2 bg-gradient-to-r from-ocean-950/95 via-slate-900/95 to-ocean-950/95 border-b border-cyan-500/30 backdrop-blur-md text-xs flex items-center justify-between shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto w-full gap-3">
        <div className="flex items-center gap-2.5">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${meta.badgeClass}`}>
            <IconComponent className="w-3.5 h-3.5" />
            <span className="font-semibold">{meta.label}</span>
          </span>
          <span className="text-slate-300 hidden md:inline text-[11px]">{meta.description}</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
              {pendingCount} offline action(s) queued
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {syncStatus === 'FAILED' ? (
            <button
              type="button"
              onClick={retryFailed}
              className="px-2.5 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry Sync</span>
            </button>
          ) : appState === APP_STATES.ONLINE && pendingCount > 0 ? (
            <button
              type="button"
              onClick={triggerSync}
              disabled={isSyncing}
              className="px-2.5 py-1 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default NetworkStatusBanner;
