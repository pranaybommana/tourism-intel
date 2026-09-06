import React, { useState } from "react";
import {
  Trash2, ScanLine, AlertTriangle, CheckCircle2,
  ShieldAlert, Send, Info, Sparkles,
} from "lucide-react";
import SectionHeader from "../../components/ui/SectionHeader";
import GlassCard from "../../components/ui/GlassCard";
import GlassButton from "../../components/ui/GlassButton";
import { detectWaste, WASTE_TYPES } from "../../services/ai/wasteDetectionService";
import { storageService } from "../../services/storageService";

const SEV_CONFIG = {
  LOW:      { color: "text-emerald-400", bg: "bg-emerald-950/30 border-emerald-500/40" },
  MEDIUM:   { color: "text-amber-400",   bg: "bg-amber-950/30 border-amber-500/40" },
  HIGH:     { color: "text-rose-400",    bg: "bg-rose-950/30 border-rose-500/40" },
  CRITICAL: { color: "text-rose-300",    bg: "bg-rose-950/50 border-rose-400/60" },
};

export function WasteDetectionPage() {
  const [selectedWasteId, setSelectedWasteId] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [location, setLocation] = useState("");

  const handleScan = async () => {
    setScanning(true);
    setResult(null);
    setSubmitted(false);

    const res = await detectWaste(selectedWasteId);
    setResult(res);
    setScanning(false);
  };

  const handleSubmitReport = () => {
    if (!result?.detected) return;
    const report = {
      ...result.reportPayload,
      location: location || "Tourist Area (unspecified)",
      submittedAt: new Date().toISOString(),
      id: `WR-${Date.now()}`,
    };
    const reports = storageService.get("waste_reports", []);
    storageService.set("waste_reports", [...reports, report]);
    setSubmitted(true);
  };

  const sevCfg = result?.detected ? SEV_CONFIG[result.severity] || SEV_CONFIG.MEDIUM : null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <SectionHeader
        title="Waste Detection AI"
        subtitle="AI-simulated waste classification for tourist area reporting — demo prototype"
        badge="Vision Simulation"
      />

      <GlassCard className="p-5 border-cyan-500/30 space-y-4">
        <div className="flex items-center gap-1.5 text-xs text-cyan-300 bg-cyan-950/30 border border-cyan-500/30 px-3 py-2 rounded-xl">
          <Info className="w-3.5 h-3.5 shrink-0" />
          Demo AI Simulation — select a waste type to simulate detection. No real camera required.
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">Select Waste Category to Simulate</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedWasteId(null)}
              className={`p-2.5 rounded-xl text-left text-[11px] font-semibold border transition-all ${
                selectedWasteId === null
                  ? "bg-cyan-500/20 text-cyan-200 border-cyan-400"
                  : "bg-slate-900/50 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              🎲 Random Detection
            </button>
            {WASTE_TYPES.map((w) => (
              <button
                key={w.id}
                onClick={() => setSelectedWasteId(w.id)}
                className={`p-2.5 rounded-xl text-left text-[11px] font-semibold border transition-all ${
                  selectedWasteId === w.id
                    ? "bg-cyan-500/20 text-cyan-200 border-cyan-400"
                    : "bg-slate-900/50 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                {w.emoji} {w.label}
              </button>
            ))}
          </div>
        </div>

        <GlassButton
          variant="primary"
          size="md"
          icon={scanning ? ScanLine : Trash2}
          onClick={handleScan}
          disabled={scanning}
          className="w-full justify-center"
        >
          {scanning ? "AI Scanning..." : "Run Waste Detection"}
        </GlassButton>
      </GlassCard>

      {result?.detected && sevCfg && (
        <GlassCard glow className={`p-5 border space-y-4 ${sevCfg.bg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-bold text-white">Waste Detected</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-extrabold text-emerald-400">{result.confidence}%</span>
              <span className="text-[10px] text-slate-500 block">Confidence</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl">{result.wasteType.emoji}</span>
            <div>
              <h3 className="text-base font-bold text-white">{result.wasteType.label}</h3>
              <span className={`text-xs font-bold ${sevCfg.color}`}>Severity: {result.severity}</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{result.description}</p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Report Category</span>
              <strong className="text-white">{result.reportCategory}</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Urgency</span>
              <strong className={sevCfg.color}>{result.urgency}</strong>
            </div>
          </div>

          {/* Submit Report Flow */}
          {!submitted ? (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-300">Submit to Waste Report System</span>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location description (e.g. near Charminar gate, Hyderabad)"
                className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              />
              <GlassButton
                variant="primary"
                size="md"
                icon={Send}
                onClick={handleSubmitReport}
                className="w-full justify-center"
              >
                Submit Waste Report
              </GlassButton>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Report submitted & saved to local storage (IndexedDB simulation)
            </div>
          )}

          <span className="text-[10px] text-slate-600">{result.sourceLabel}</span>
        </GlassCard>
      )}
    </div>
  );
}

export default WasteDetectionPage;
