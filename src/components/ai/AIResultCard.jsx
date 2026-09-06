import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Bot, Navigation, ExternalLink, CheckCircle2 } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import GlassButton from "../ui/GlassButton";
import StatusBadge from "../ui/StatusBadge";

/**
 * Reusable AI result card — displays any AI module result in consistent Oceanic Glass style.
 * Props:
 *   title        - AI result title
 *   confidence   - 0–1 float or 0–100 int
 *   text         - main response text (supports **bold** markdown-style)
 *   sourceLabel  - e.g. "Prototype Intelligence"
 *   children     - optional rich content below text
 *   actions      - Array<{ label, link?, navigatePlace?, href? }>
 *   compact      - smaller variant
 */
export function AIResultCard({ title, confidence, text, sourceLabel, children, actions = [], compact = false }) {
  const navigate = useNavigate();

  const confPct = confidence !== undefined
    ? (confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence))
    : null;

  const confColor = confPct >= 90 ? "text-emerald-400"
    : confPct >= 75 ? "text-cyan-400"
    : "text-amber-400";

  const handleAction = (action) => {
    if (action.href) {
      window.open(action.href, "_blank", "noopener");
    } else if (action.navigatePlace) {
      navigate("/navigate", { state: { targetPlace: action.navigatePlace } });
    } else if (action.link) {
      navigate(action.link);
    }
  };

  // Render **bold** markdown-style in text
  const renderText = (str) => {
    if (!str) return null;
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("_") && part.endsWith("_")) {
        return <em key={i} className="text-slate-400">{part.slice(1, -1)}</em>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <GlassCard glow className={`border-cyan-500/30 ${compact ? "p-3.5" : "p-5"} space-y-3`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center shrink-0 shadow-cyan-glow">
            <Bot className="w-4 h-4 text-ocean-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">{title || "TravelGuard AI"}</h4>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                AI Demo
              </span>
            </div>
            {sourceLabel && (
              <span className="text-[10px] text-slate-500">{sourceLabel}</span>
            )}
          </div>
        </div>

        {confPct !== null && (
          <div className="text-right shrink-0">
            <span className={`text-xs font-bold ${confColor}`}>{confPct}%</span>
            <span className="text-[10px] text-slate-500 block">Confidence</span>
          </div>
        )}
      </div>

      {/* Text Body */}
      {text && (
        <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
          {renderText(text)}
        </div>
      )}

      {/* Rich children */}
      {children}

      {/* Action Buttons */}
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800">
          {actions.map((action, idx) => (
            <GlassButton
              key={idx}
              variant={idx === 0 ? "primary" : "outline"}
              size="sm"
              icon={action.navigatePlace ? Navigation : ExternalLink}
              onClick={() => handleAction(action)}
            >
              {action.label}
            </GlassButton>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

export default AIResultCard;
