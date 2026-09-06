import React from 'react';
import { useSync } from '../../context/SyncContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  X,
  Layers,
  Database,
  CloudOff,
  Radio,
} from 'lucide-react';
import GlassButton from '../ui/GlassButton';

export function SyncQueueModal({ isOpen, onClose }) {
  const {
    syncStatus,
    isSyncing,
    lastSyncTime,
    lastError,
    queueItems,
    pendingCount,
    triggerSync,
    retryFailed,
    purgeSynced,
    clearQueue,
  } = useSync();
  const { isOnline } = useOnlineStatus();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/95 via-ocean-950/95 to-slate-950/95 p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Offline Intelligence & Sync Queue
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    isSyncing
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                      : !isOnline
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : syncStatus === 'FAILED'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {isSyncing ? 'Syncing...' : !isOnline ? 'Offline Storage' : syncStatus}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                IndexedDB persistent queue • Automatic Reconnection Dispatcher
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sync Summary Status Bar */}
        <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 mb-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Network State</span>
            <span className={`font-bold ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isOnline ? '● Online Connected' : '○ Offline Mode'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Pending Sync Items</span>
            <span className="font-bold text-cyan-300">{pendingCount} action(s)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Last Synced</span>
            <span className="font-bold text-slate-300 font-mono text-[11px]">
              {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : 'Never'}
            </span>
          </div>
        </div>

        {/* Error notice if present */}
        {lastError && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{lastError}</span>
            </div>
            <GlassButton size="xs" variant="secondary" onClick={retryFailed} icon={RefreshCw}>
              Retry
            </GlassButton>
          </div>
        )}

        {/* Queue Items List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[160px]">
          {queueItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-10 text-center text-slate-400">
              <Database className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-300">Sync Queue is Empty</p>
              <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
                Any actions taken while offline (e.g. incident reports, SOS logs) will appear here and sync automatically upon reconnection.
              </p>
            </div>
          ) : (
            queueItems.map((item) => (
              <div
                key={item.clientActionId}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        item.status === 'SYNCED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : item.status === 'SYNCING'
                          ? 'bg-cyan-500/20 text-cyan-300 animate-pulse'
                          : item.status === 'FAILED'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {item.status}
                    </span>
                    <strong className="text-white font-medium">{item.description || item.type}</strong>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="font-mono text-slate-500">ID: {item.clientActionId.slice(0, 16)}...</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </span>
                    {item.retryCount > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-amber-400">Retries: {item.retryCount}</span>
                      </>
                    )}
                  </div>

                  {item.lastError && (
                    <p className="text-[11px] text-rose-400 mt-1">{item.lastError}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {item.status === 'SYNCED' ? (
                    <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      Synced
                    </span>
                  ) : item.status === 'SYNCING' ? (
                    <span className="flex items-center gap-1 text-cyan-400 text-xs font-semibold">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Syncing
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                      <Clock className="w-4 h-4" />
                      Queued
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800 pt-4 mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <GlassButton
              size="xs"
              variant="outline"
              onClick={purgeSynced}
              icon={CheckCircle2}
              disabled={!queueItems.some((i) => i.status === 'SYNCED')}
            >
              Clear Synced
            </GlassButton>
            <GlassButton
              size="xs"
              variant="outline"
              onClick={clearQueue}
              icon={Trash2}
              disabled={queueItems.length === 0}
            >
              Clear All
            </GlassButton>
          </div>

          <div className="flex items-center gap-2">
            <GlassButton
              size="sm"
              variant="primary"
              onClick={triggerSync}
              icon={RefreshCw}
              disabled={isSyncing || !isOnline}
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </GlassButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SyncQueueModal;
