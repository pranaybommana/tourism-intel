import React, { useState } from 'react';
import { useSync } from '../../context/SyncContext';
import { RefreshCw, CheckCircle2, CloudOff, AlertCircle, Layers } from 'lucide-react';
import SyncQueueModal from './SyncQueueModal';

export function SyncStatusIndicator() {
  const { syncStatus, isSyncing, pendingCount, triggerSync } = useSync();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusConfig = () => {
    if (isSyncing || syncStatus === 'SYNCING') {
      return {
        label: 'Syncing',
        icon: RefreshCw,
        iconClass: 'animate-spin text-cyan-400',
        badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-cyan-glow',
        tooltip: 'Synchronizing offline records with central intelligence backend...',
      };
    }

    if (syncStatus === 'OFFLINE') {
      return {
        label: pendingCount > 0 ? `${pendingCount} Queued` : 'Offline',
        icon: CloudOff,
        iconClass: 'text-amber-400',
        badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        tooltip: 'Running offline. Local changes safely queued in IndexedDB.',
      };
    }

    if (syncStatus === 'FAILED') {
      return {
        label: 'Sync Failed',
        icon: AlertCircle,
        iconClass: 'text-rose-400',
        badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30 animate-pulse',
        tooltip: 'Synchronization error occurred. Click to review and retry.',
      };
    }

    // Default: Synced
    return {
      label: 'Synced',
      icon: CheckCircle2,
      iconClass: 'text-emerald-400',
      badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      tooltip: 'All local changes and intelligence data fully synchronized.',
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          title={config.tooltip}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all duration-200 hover:scale-105 ${config.badgeClass}`}
        >
          <Icon className={`w-3.5 h-3.5 ${config.iconClass}`} />
          <span className="hidden sm:inline">{config.label}</span>
          {pendingCount > 0 && syncStatus !== 'OFFLINE' && (
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-400 text-ocean-950 font-bold text-[10px]">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      <SyncQueueModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

export default SyncStatusIndicator;
