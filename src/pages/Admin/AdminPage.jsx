import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Database,
  Server,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  MapPin,
  User,
  SlidersHorizontal,
  ChevronRight,
  Layers,
  ArrowUpDown,
  X,
  Send,
} from 'lucide-react';
import { api } from '../../services/api';
import { useSync } from '../../context/SyncContext';
import { useAppState } from '../../hooks/useAppState';
import { indexedDBService } from '../../services/indexedDBService';
import SectionHeader from '../../components/ui/SectionHeader';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import StatusBadge from '../../components/ui/StatusBadge';

// Helper for human-friendly severity badges
const SEVERITY_CONFIG = {
  LOW: { label: 'Low', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  MEDIUM: { label: 'Medium', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  HIGH: { label: 'High', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  CRITICAL: { label: 'Critical', badge: 'bg-rose-500/25 text-rose-300 border-rose-500/50 animate-pulse' },
};

// Helper for status workflow
const STATUS_CONFIG = {
  PENDING: { label: 'Pending', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  REVIEWING: { label: 'Reviewing', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  IN_PROGRESS: { label: 'In Progress', badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  VERIFIED: { label: 'Verified', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  RESOLVED: { label: 'Resolved', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
  DISMISSED: { label: 'Dismissed', badge: 'bg-slate-800 text-slate-400 border-slate-700' },
};

export function AdminPage() {
  const { syncStatus, isSyncing, triggerSync } = useSync();
  const { appState, meta } = useAppState();

  // Metrics state
  const [metrics, setMetrics] = useState({
    totalIncidents: 0,
    pendingIncidents: 0,
    reviewingIncidents: 0,
    resolvedIncidents: 0,
    activeIncidents: 0,
    criticalAlerts: 0,
    destinationsCount: 0,
    servicesCount: 0,
  });

  // Incident list state
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackNotice, setFeedbackNotice] = useState(null);

  // Filters and Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Active detail modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load metrics & reports from backend API
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [metricsData, reportsData] = await Promise.all([
        api.getSafetyMetrics(),
        api.getReports({
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          severity: severityFilter !== 'ALL' ? severityFilter : undefined,
          reportType: typeFilter !== 'ALL' ? typeFilter : undefined,
          search: searchQuery.trim() || undefined,
        }),
      ]);

      if (metricsData) setMetrics(metricsData);
      if (Array.isArray(reportsData)) setReports(reportsData);
    } catch (err) {
      console.warn('[AdminDashboard] Load error:', err);
      setError('Unable to reach telemetry backend. Serving locally stored cached intelligence.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, severityFilter, typeFilter, searchQuery]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle status pipeline update
  const handleStatusChange = async (reportId, newStatus) => {
    setIsUpdating(true);
    try {
      const res = await api.updateReport(reportId, { status: newStatus });
      if (res) {
        setFeedbackNotice(`Incident #${reportId} status shifted to ${newStatus}`);
        setTimeout(() => setFeedbackNotice(null), 3000);

        // Update local report state immediately
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
        );
        if (selectedReport && selectedReport.id === reportId) {
          setSelectedReport((prev) => ({ ...prev, status: newStatus }));
        }
        api.getSafetyMetrics().then((m) => m && setMetrics(m));
      }
    } catch (err) {
      setError('Failed to update status on server.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle severity adjustment
  const handleSeverityChange = async (reportId, newSeverity) => {
    setIsUpdating(true);
    try {
      const res = await api.updateReport(reportId, { severity: newSeverity });
      if (res) {
        setFeedbackNotice(`Incident #${reportId} priority updated to ${newSeverity}`);
        setTimeout(() => setFeedbackNotice(null), 3000);

        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, severity: newSeverity } : r))
        );
        if (selectedReport && selectedReport.id === reportId) {
          setSelectedReport((prev) => ({ ...prev, severity: newSeverity }));
        }
      }
    } catch (err) {
      setError('Failed to update severity on server.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle report deletion
  const handleDeleteReport = async (reportId) => {
    if (!window.confirm(`Are you sure you want to dismiss and delete incident #${reportId}?`)) return;
    try {
      await api.deleteReport(reportId);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport(null);
      }
      setFeedbackNotice(`Incident #${reportId} removed.`);
      setTimeout(() => setFeedbackNotice(null), 3000);
      api.getSafetyMetrics().then((m) => m && setMetrics(m));
    } catch (err) {
      setError('Failed to delete report.');
    }
  };

  // Filtered reports in-memory if search is active
  const displayedReports = useMemo(() => {
    return reports.filter((r) => {
      const matchSearch =
        !searchQuery.trim() ||
        (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.placeId && r.placeId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.destinationId && r.destinationId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.reportedBy && r.reportedBy.toLowerCase().includes(searchQuery.toLowerCase())) ||
        String(r.id).includes(searchQuery.trim());

      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchSeverity = severityFilter === 'ALL' || r.severity === severityFilter;
      const matchType = typeFilter === 'ALL' || r.reportType === typeFilter;

      return matchSearch && matchStatus && matchSeverity && matchType;
    });
  }, [reports, searchQuery, statusFilter, severityFilter, typeFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <SectionHeader
        title="Tourism Intelligence & Safety Operations Center"
        subtitle="Live incident triage, real-time safe corridor monitoring, emergency telemetry, and verified services oversight"
        action={
          <div className="flex items-center gap-2">
            <GlassButton
              size="sm"
              variant="outline"
              onClick={loadDashboardData}
              icon={RefreshCw}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh Telemetry'}
            </GlassButton>
            <GlassButton
              size="sm"
              variant="primary"
              onClick={() => {
                triggerSync();
                loadDashboardData();
              }}
              icon={Layers}
              disabled={isSyncing}
            >
              {isSyncing ? 'Syncing...' : 'Force Sync All'}
            </GlassButton>
          </div>
        }
      />

      {/* Security Scope & Demo Role Notice */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 text-slate-300 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong className="text-white font-bold">Admin Triage Scope:</strong> Active in demo mode with full Flask REST backend & SQLite database persistence.
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-extrabold uppercase tracking-wider">
          Verified Operations Console
        </span>
      </div>

      {/* Feedback Toast */}
      {feedbackNotice && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <GlassButton size="xs" variant="secondary" onClick={loadDashboardData} icon={RefreshCw}>
            Retry
          </GlassButton>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <GlassCard subtle className="p-4 border-cyan-500/20">
          <span className="text-[11px] text-slate-400 block mb-1">Total Incidents</span>
          <strong className="text-xl sm:text-2xl font-black text-white">{metrics.totalIncidents}</strong>
          <span className="text-[10px] text-slate-500 block mt-1">All logged reports</span>
        </GlassCard>

        <GlassCard subtle className="p-4 border-amber-500/30">
          <span className="text-[11px] text-amber-300 block mb-1">Pending Triage</span>
          <strong className="text-xl sm:text-2xl font-black text-amber-400">{metrics.pendingIncidents}</strong>
          <span className="text-[10px] text-amber-500/80 block mt-1">Requires review</span>
        </GlassCard>

        <GlassCard subtle className="p-4 border-sky-500/30">
          <span className="text-[11px] text-sky-300 block mb-1">In Progress</span>
          <strong className="text-xl sm:text-2xl font-black text-sky-400">{metrics.reviewingIncidents}</strong>
          <span className="text-[10px] text-sky-500/80 block mt-1">Under investigation</span>
        </GlassCard>

        <GlassCard subtle className="p-4 border-emerald-500/30">
          <span className="text-[11px] text-emerald-300 block mb-1">Resolved</span>
          <strong className="text-xl sm:text-2xl font-black text-emerald-400">{metrics.resolvedIncidents}</strong>
          <span className="text-[10px] text-emerald-500/80 block mt-1">Successfully closed</span>
        </GlassCard>

        <GlassCard subtle className="p-4 border-rose-500/30">
          <span className="text-[11px] text-rose-300 block mb-1">Critical Alerts</span>
          <strong className="text-xl sm:text-2xl font-black text-rose-400">{metrics.criticalAlerts}</strong>
          <span className="text-[10px] text-rose-500/80 block mt-1">High priority</span>
        </GlassCard>

        <GlassCard subtle className="p-4 border-cyan-500/20">
          <span className="text-[11px] text-cyan-300 block mb-1">Monitored Zones</span>
          <strong className="text-xl sm:text-2xl font-black text-cyan-400">{metrics.destinationsCount}</strong>
          <span className="text-[10px] text-cyan-500/80 block mt-1">Destinations active</span>
        </GlassCard>
      </div>

      {/* Incident Triage Operations Panel */}
      <GlassCard className="p-5 sm:p-6 border-cyan-500/20 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              Incident & Hazard Triage Table
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {displayedReports.length} records
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Filter, inspect, change status, and dispatch response protocols for tourist reports
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search description, location, ID..."
              className="w-full rounded-xl bg-slate-900/80 border border-slate-700 pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Status Filter */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Status Workflow</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl bg-slate-900/90 border border-slate-700 px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-400 text-xs cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Triage</option>
              <option value="REVIEWING">Reviewing</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="DISMISSED">Dismissed</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Severity / Priority</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full rounded-xl bg-slate-900/90 border border-slate-700 px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-400 text-xs cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Hazard Category</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-xl bg-slate-900/90 border border-slate-700 px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-400 text-xs cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="safety_alert">Safety Alert</option>
              <option value="crowd_surge">Overcrowding</option>
              <option value="infrastructure_issue">Road / Infrastructure</option>
              <option value="medical_aid">Medical / SOS</option>
            </select>
          </div>
        </div>

        {/* Incidents Table for Desktop / Tablet */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 text-xs space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400 mx-auto" />
              <p>Fetching incident triage records from backend...</p>
            </div>
          ) : displayedReports.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs space-y-2">
              <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="font-bold text-slate-300">No matching incident reports found</p>
              <p className="text-slate-500 max-w-sm mx-auto">
                {searchQuery || statusFilter !== 'ALL' || severityFilter !== 'ALL' || typeFilter !== 'ALL'
                  ? 'Try clearing active search terms or category filters.'
                  : 'All monitored corridors are safe. No pending alerts.'}
              </p>
              {(searchQuery || statusFilter !== 'ALL' || severityFilter !== 'ALL' || typeFilter !== 'ALL') && (
                <div className="pt-2">
                  <GlassButton
                    size="xs"
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('ALL');
                      setSeverityFilter('ALL');
                      setTypeFilter('ALL');
                    }}
                  >
                    Reset All Filters
                  </GlassButton>
                </div>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">ID</th>
                  <th className="py-3 px-4 font-semibold">Category & Description</th>
                  <th className="py-3 px-4 font-semibold">Location</th>
                  <th className="py-3 px-4 font-semibold">Severity</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Reported</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {displayedReports.map((report) => {
                  const severityConf = SEVERITY_CONFIG[report.severity] || SEVERITY_CONFIG.LOW;
                  const statusConf = STATUS_CONFIG[report.status] || STATUS_CONFIG.PENDING;

                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedReport(report)}
                    >
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono text-cyan-300 font-bold">
                        #{report.id}
                      </td>

                      {/* Description & Type */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                        <div className="font-semibold text-white truncate group-hover:text-cyan-200 transition-colors">
                          {report.description}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="capitalize">{report.reportType.replace('_', ' ')}</span>
                          <span>•</span>
                          <span className="truncate">{report.reportedBy || 'Anonymous'}</span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="flex items-center gap-1 font-medium text-slate-200">
                          <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="capitalize">{report.placeId || report.destinationId || 'Monitored Corridor'}</span>
                        </span>
                      </td>

                      {/* Severity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${severityConf.badge}`}>
                          {severityConf.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusConf.badge}`}>
                          {statusConf.label}
                        </span>
                      </td>

                      {/* Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="Inspect Details"
                            onClick={() => setSelectedReport(report)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Resolve Button */}
                          {report.status !== 'RESOLVED' ? (
                            <button
                              type="button"
                              title="Mark as Resolved"
                              onClick={() => handleStatusChange(report.id, 'RESOLVED')}
                              className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              title="Reopen Incident"
                              onClick={() => handleStatusChange(report.id, 'IN_PROGRESS')}
                              className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 transition-colors"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            title="Delete Record"
                            onClick={() => handleDeleteReport(report.id)}
                            className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </GlassCard>

      {/* Incident Details Inspection Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/95 via-ocean-950/95 to-slate-950/95 p-6 shadow-2xl overflow-hidden space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  Incident Triage Dossier #{selectedReport.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Core Details */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] font-semibold mb-1">Description</span>
                <p className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 leading-relaxed">
                  {selectedReport.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Location / Entity</span>
                  <strong className="text-white capitalize">{selectedReport.placeId || selectedReport.destinationId || 'Corridor'}</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Reporter</span>
                  <strong className="text-white">{selectedReport.reportedBy || 'Anonymous Traveler'}</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Logged At</span>
                  <strong className="text-white font-mono text-[11px]">
                    {selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleString() : 'N/A'}
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Client Action ID</span>
                  <strong className="text-slate-300 font-mono text-[10px] truncate block">
                    {selectedReport.clientActionId || 'Direct submission'}
                  </strong>
                </div>
              </div>

              {/* Status Pipeline Selection */}
              <div>
                <span className="text-slate-300 font-bold block mb-1.5">Update Status Pipeline</span>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {['PENDING', 'REVIEWING', 'IN_PROGRESS', 'VERIFIED', 'RESOLVED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange(selectedReport.id, st)}
                      className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all ${
                        selectedReport.status === st
                          ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-cyan-glow'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity Selection */}
              <div>
                <span className="text-slate-300 font-bold block mb-1.5">Adjust Severity Level</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleSeverityChange(selectedReport.id, sev)}
                      className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all ${
                        selectedReport.severity === sev
                          ? 'bg-slate-800 border-slate-600 text-white ring-1 ring-cyan-400'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
              <GlassButton
                size="xs"
                variant="outline"
                onClick={() => handleDeleteReport(selectedReport.id)}
                icon={Trash2}
              >
                Delete Incident
              </GlassButton>

              <GlassButton
                size="xs"
                variant="primary"
                onClick={() => setSelectedReport(null)}
              >
                Close Dossier
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
