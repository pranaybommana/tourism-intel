import React from 'react';
import { Bot, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';

export function AIAssistantTeaser() {
  return (
    <GlassCard glow className="p-6 my-8 border-cyan-500/40 relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center text-ocean-950 shadow-cyan-glow shrink-0">
            <Bot className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white">Ask Tourism Intel AI</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Zero API Cost
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Get instant offline-ready safety intelligence, recommended itinerary pacing, nearby police desks, and verified emergency helplines.
            </p>
          </div>
        </div>

        <Link to="/assistant" className="shrink-0">
          <GlassButton variant="primary" icon={ArrowRight}>
            Launch Assistant
          </GlassButton>
        </Link>
      </div>
    </GlassCard>
  );
}

export default AIAssistantTeaser;
