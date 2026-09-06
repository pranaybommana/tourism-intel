import React from 'react';
import { Compass, Shield, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-cyan-500/20 bg-ocean-950/60 backdrop-blur-md py-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-white tracking-wider">TOURISM INTEL</span>
          <span className="text-slate-600">|</span>
          <span>"Lost Less. Travel Safer. Explore Smarter."</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>National Emergency: 112 • Tourist: 1363</span>
          </div>
          <p className="text-slate-500 text-[11px]">
            © {new Date().getFullYear()} Tourism Intel Architecture Foundation
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
