import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Navigation, Bot, Shield, User, Menu, X, ShieldAlert, AlertTriangle } from 'lucide-react';
import AppStateIndicator from '../common/AppStateIndicator';
import SyncStatusIndicator from '../common/SyncStatusIndicator';
import IncidentReportModal from '../safety/IncidentReportModal';

export function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/', icon: Compass },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Navigate', path: '/navigate', icon: Navigation },
    { name: 'AI Assistant', path: '/assistant', icon: Bot },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Admin', path: '/admin', icon: Shield },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-ocean-950/80 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center shadow-cyan-glow group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-ocean-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-base sm:text-lg cyan-gradient-text block leading-tight">
                TOURISM INTEL
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider uppercase font-medium hidden sm:block">
                Lost Less • Travel Safer
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 shadow-cyan-glow'
                      : 'text-slate-300 hover:text-cyan-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Sync Status, Report Button & App State Indicator */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsIncidentModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all"
              title="Report safety hazard or incident (works online & offline)"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Report Hazard</span>
            </button>

            <SyncStatusIndicator />
            <AppStateIndicator />

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white lg:hidden border border-slate-700 bg-slate-900/60"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-4 pt-2 pb-4 border-t border-cyan-500/20 bg-ocean-950/95 backdrop-blur-2xl space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsIncidentModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600/30 text-rose-200 border border-rose-500/40 text-xs font-bold"
              >
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Report Safety Hazard (Online & Offline)</span>
              </button>
            </div>
          </div>
        )}
      </header>

      <IncidentReportModal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
      />
    </>
  );
}

export default Navbar;
