import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, ScanLine, Navigation, Info, Sparkles, CheckCircle2 } from "lucide-react";
import SectionHeader from "../../components/ui/SectionHeader";
import GlassCard from "../../components/ui/GlassCard";
import GlassButton from "../../components/ui/GlassButton";
import StatusBadge from "../../components/ui/StatusBadge";
import { recognizeLandmark, getLandmarkCategories } from "../../services/ai/landmarkService";

export function LandmarkPage() {
  const navigate = useNavigate();
  const CATEGORIES = getLandmarkCategories();
  const [category, setCategory] = useState("ALL");
  const [nameHint, setNameHint] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanPhase, setScanPhase] = useState(0);
  const [result, setResult] = useState(null);

  const SCAN_PHASES = [
    "Initializing AI Vision Simulation...",
    "Analysing landmark patterns...",
    "Cross-referencing local dataset...",
    "Generating confidence score...",
  ];

  const handleScan = async () => {
    setScanning(true);
    setResult(null);
    setScanPhase(0);

    for (let i = 0; i < SCAN_PHASES.length; i++) {
      setScanPhase(i);
      await new Promise((r) => setTimeout(r, 320));
    }

    const res = await recognizeLandmark({ category, nameHint });
    setResult(res);
    setScanning(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <SectionHeader
        title="Landmark Recognition AI"
        subtitle="Simulate AI landmark identification using the local tourist places dataset"
        badge="Vision Simulation"
      />

      <GlassCard className="p-5 border-cyan-500/30 space-y-4">
        <div className="flex items-center gap-1.5 text-xs text-cyan-300 bg-cyan-950/30 border border-cyan-500/30 px-3 py-2 rounded-xl">
          <Info className="w-3.5 h-3.5 shrink-0" />
          Demo AI Estimate — no real camera or computer vision API required
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">Category Filter</label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all ${
                  category === cat
                    ? "bg-cyan-500/25 text-cyan-200 border-cyan-400 shadow-cyan-glow"
                    : "bg-slate-900/50 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">Landmark Name Hint (optional)</label>
          <input
            type="text"
            value={nameHint}
            onChange={(e) => setNameHint(e.target.value)}
            placeholder="e.g. Charminar, Taj, Ghat..."
            className="w-full px-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <GlassButton
          variant="primary"
          size="md"
          icon={scanning ? ScanLine : Camera}
          onClick={handleScan}
          disabled={scanning}
          className="w-full justify-center"
        >
          {scanning ? SCAN_PHASES[scanPhase] : "Identify Landmark"}
        </GlassButton>
      </GlassCard>

      {result && result.success && (
        <GlassCard glow className="p-5 border-cyan-500/40 space-y-4 shadow-cyan-glow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-bold text-cyan-300">AI Estimate — Identified Landmark</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-extrabold text-emerald-400">{result.confidence}%</span>
              <span className="text-[10px] text-slate-500 block">Confidence</span>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-slate-900 border border-slate-800">
              <img src={result.place.image} alt={result.place.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-extrabold text-white mb-0.5">{result.place.name}</h3>
              <p className="text-xs text-slate-400">{result.destination?.name}, {result.place.state}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <StatusBadge status={result.safetyLevel} size="sm" />
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold border border-cyan-400/30">{result.category}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px]">Est. Distance</span>
              <strong className="text-cyan-300">{result.estimatedDistanceKm} km</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px]">Crowd</span>
              <strong className="text-sky-300">{result.crowdLevel}</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px]">Safety</span>
              <strong className="text-emerald-300">{result.safetyLevel}</strong>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{result.place.description?.slice(0, 160)}...</p>

          <div className="flex gap-2 pt-1 border-t border-slate-800">
            <GlassButton
              variant="primary"
              size="md"
              icon={Navigation}
              onClick={() => navigate("/navigate", { state: { targetPlace: result.place } })}
            >
              Navigate Safely
            </GlassButton>
            <GlassButton
              variant="outline"
              size="md"
              onClick={() => navigate("/explore")}
            >
              Learn More
            </GlassButton>
          </div>

          <span className="text-[10px] text-slate-600">{result.sourceLabel}</span>
        </GlassCard>
      )}

      {result && !result.success && (
        <GlassCard className="p-5 border-slate-700/50 text-center text-sm text-slate-400">
          {result.message || "No landmark identified. Try adjusting the category or name hint."}
        </GlassCard>
      )}
    </div>
  );
}

export default LandmarkPage;
