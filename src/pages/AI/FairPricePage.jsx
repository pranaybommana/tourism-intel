import React, { useState } from "react";
import { DollarSign, AlertTriangle, CheckCircle2, ShieldAlert, Info } from "lucide-react";
import SectionHeader from "../../components/ui/SectionHeader";
import GlassCard from "../../components/ui/GlassCard";
import GlassButton from "../../components/ui/GlassButton";
import { evaluateFairPrice, getTransportTypes } from "../../services/ai/fairPriceService";

const RISK_CONFIG = {
  FAIR:     { color: "text-emerald-400", bg: "bg-emerald-950/30 border-emerald-500/40", icon: CheckCircle2, label: "Fair Price" },
  MODERATE: { color: "text-amber-400",   bg: "bg-amber-950/30 border-amber-500/40",    icon: AlertTriangle, label: "Slightly High" },
  HIGH:     { color: "text-rose-400",    bg: "bg-rose-950/30 border-rose-500/40",      icon: ShieldAlert,   label: "High Risk" },
  CRITICAL: { color: "text-rose-300",    bg: "bg-rose-950/50 border-rose-400/60",      icon: ShieldAlert,   label: "Critical Overcharge" },
};

export function FairPricePage() {
  const TRANSPORT_TYPES = getTransportTypes();
  const [form, setForm] = useState({
    transportType: "auto",
    distanceKm: "",
    quotedPrice: "",
    isTouristArea: true,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!form.distanceKm || !form.quotedPrice) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const res = evaluateFairPrice({
      transportType: form.transportType,
      distanceKm: parseFloat(form.distanceKm),
      quotedPrice: parseFloat(form.quotedPrice),
      isTouristArea: form.isTouristArea,
    });
    setResult(res);
    setLoading(false);
  };

  const risk = result ? RISK_CONFIG[result.riskLevel] || RISK_CONFIG.MODERATE : null;
  const RiskIcon = risk?.icon;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <SectionHeader
        title="FairPrice AI — Transport Price Check"
        subtitle="Demo intelligence to detect unfair tourist fares for autos, cabs, and buses"
        badge="Prototype Intelligence"
      />

      <GlassCard className="p-5 border-cyan-500/30 space-y-4">
        <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/30 border border-amber-500/30 px-3 py-2 rounded-xl">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Demo estimate only — not real-time commercial pricing data</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Transport Type</label>
            <select
              value={form.transportType}
              onChange={(e) => setForm((f) => ({ ...f, transportType: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
            >
              {TRANSPORT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Distance (km)</label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={form.distanceKm}
              onChange={(e) => setForm((f) => ({ ...f, distanceKm: e.target.value }))}
              placeholder="e.g. 5"
              className="w-full px-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Quoted Price (₹)</label>
            <input
              type="number"
              min="0"
              step="10"
              value={form.quotedPrice}
              onChange={(e) => setForm((f) => ({ ...f, quotedPrice: e.target.value }))}
              placeholder="e.g. 800"
              className="w-full px-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer select-none pb-2.5">
              <input
                type="checkbox"
                checked={form.isTouristArea}
                onChange={(e) => setForm((f) => ({ ...f, isTouristArea: e.target.checked }))}
                className="w-4 h-4 accent-cyan-500"
              />
              <span className="text-xs text-slate-300">Tourist Area (adds ~30% premium)</span>
            </label>
          </div>
        </div>

        <GlassButton
          variant="primary"
          size="md"
          icon={DollarSign}
          onClick={handleCheck}
          disabled={!form.distanceKm || !form.quotedPrice || loading}
          className="w-full justify-center"
        >
          {loading ? "Calculating..." : "Check Fair Price"}
        </GlassButton>
      </GlassCard>

      {result && risk && (
        <GlassCard glow className={`p-5 border space-y-4 ${risk.bg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${risk.bg}`}>
                <RiskIcon className={`w-5 h-5 ${risk.color}`} />
              </div>
              <div>
                <span className={`text-lg font-extrabold ${risk.color}`}>{result.riskLevel}</span>
                <span className="text-[11px] text-slate-400 block">{risk.label}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-white">₹{result.quotedPrice}</span>
              <span className="text-[10px] text-slate-400 block">Quoted</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Expected Range</span>
              <strong className="text-emerald-300 text-sm">₹{result.expectedMin}–₹{result.expectedMax}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Potential Overcharge</span>
              <strong className={`text-sm ${result.overchargeAmount > 0 ? "text-rose-300" : "text-emerald-300"}`}>
                {result.overchargeAmount > 0 ? `₹${result.overchargeAmount} (+${result.overchargePercent}%)` : "None"}
              </strong>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-200 leading-relaxed">
            {result.recommendation}
          </div>

          <span className="text-[10px] text-slate-600 block">{result.sourceLabel}</span>
        </GlassCard>
      )}
    </div>
  );
}

export default FairPricePage;
