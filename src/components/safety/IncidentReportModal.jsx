import React, { useState } from 'react';
import { useSync } from '../../context/SyncContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import {
  ShieldAlert,
  AlertTriangle,
  Send,
  X,
  MapPin,
  CheckCircle2,
  CloudOff,
  Radio,
} from 'lucide-react';
import GlassButton from '../ui/GlassButton';

export function IncidentReportModal({ isOpen, onClose, defaultPlace = null, userCoordinates = null }) {
  const { queueAction } = useSync();
  const { isOnline } = useOnlineStatus();

  const [reportType, setReportType] = useState('safety_alert');
  const [severity, setSeverity] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [reportedBy, setReportedBy] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        placeId: defaultPlace?.id || null,
        destinationId: defaultPlace?.destinationId || null,
        reportType,
        severity,
        description: description.trim(),
        reportedBy: reportedBy.trim() || 'Anonymous Traveler',
        latitude: userCoordinates?.lat || defaultPlace?.coordinates?.lat || null,
        longitude: userCoordinates?.lng || defaultPlace?.coordinates?.lng || null,
      };

      await queueAction({
        type: 'SAFETY_REPORT',
        endpoint: '/api/safety/report',
        method: 'POST',
        payload,
        description: `Safety Alert: ${description.slice(0, 32)}...`,
      });

      setSuccessNotice(
        isOnline
          ? 'Report dispatched and synchronized with tourism intelligence network.'
          : 'Report saved offline in IndexedDB. Will auto-sync when network reconnects.'
      );

      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessNotice(null);
        setDescription('');
        onClose();
      }, 2200);
    } catch (err) {
      console.error('[IncidentReport] Submission error:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/95 via-ocean-950/95 to-slate-950/95 p-6 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Report Safety Hazard / Incident
              {!isOnline && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <CloudOff className="w-2.5 h-2.5" /> Offline Mode
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Community alerts help keep fellow tourists and safe corridors secure.
            </p>
          </div>
        </div>

        {successNotice ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">Report Logged Successfully</h3>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">{successNotice}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Report Type */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Hazard / Incident Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'safety_alert', label: 'Safety Alert' },
                  { id: 'crowd_surge', label: 'Overcrowding' },
                  { id: 'infrastructure_issue', label: 'Road / Path' },
                  { id: 'medical_aid', label: 'Medical / SOS' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setReportType(type.id)}
                    className={`py-2 px-2.5 rounded-xl font-medium border text-center transition-all ${
                      reportType === type.id
                        ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300 shadow-cyan-glow font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Severity Level</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'LOW', label: 'Low', color: 'text-emerald-400' },
                  { id: 'MEDIUM', label: 'Medium', color: 'text-amber-400' },
                  { id: 'HIGH', label: 'High', color: 'text-orange-400' },
                  { id: 'CRITICAL', label: 'Critical', color: 'text-rose-400' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSeverity(s.id)}
                    className={`py-1.5 px-2 rounded-xl font-medium border text-center transition-all ${
                      severity === s.id
                        ? 'bg-slate-800 border-slate-600 text-white font-bold ring-1 ring-cyan-400'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className={s.color}>●</span> {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Description & Observations</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you observed (e.g., blocked path, aggressive harassment, extreme overcrowding, medical requirement)..."
                className="w-full rounded-2xl bg-slate-900/80 border border-slate-700/80 p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* Reporter Name (Optional) */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Your Name / Contact (Optional)</label>
              <input
                type="text"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                placeholder="Anonymous Traveler"
                className="w-full rounded-xl bg-slate-900/80 border border-slate-700/80 p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs"
              />
            </div>

            {/* GPS Telemetry Note */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                {defaultPlace ? defaultPlace.name : 'Current GPS Telemetry'}
              </span>
              <span className="font-mono text-slate-300 font-semibold">
                {userCoordinates?.lat ? `${userCoordinates.lat.toFixed(4)}, ${userCoordinates.lng.toFixed(4)}` : 'Auto-tagged'}
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <GlassButton
                type="submit"
                variant="primary"
                className="w-full justify-center"
                disabled={isSubmitting || !description.trim()}
                icon={Send}
              >
                {isSubmitting
                  ? 'Queueing & Submitting...'
                  : isOnline
                  ? 'Submit Incident Report'
                  : 'Save Offline & Sync on Reconnect'}
              </GlassButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default IncidentReportModal;
