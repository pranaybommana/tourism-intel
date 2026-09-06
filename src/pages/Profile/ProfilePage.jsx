import React, { useMemo } from 'react';
import {
  User,
  ShieldCheck,
  Bookmark,
  MapPin,
  Compass,
  Trash2,
  Navigation,
  Eye,
  CheckCircle2,
  Database,
  WifiOff,
  ChevronRight,
  Settings,
  Heart,
} from 'lucide-react';

import { useDestinations } from '../../context/DestinationContext';
import PlaceCard from '../../components/place/PlaceCard';
import PlaceDetailsModal from '../../components/place/PlaceDetailsModal';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import EmptyState from '../../components/ui/EmptyState';

export function ProfilePage() {
  const { savedPlaceIds, places } = useDestinations();

  const savedPlaces = useMemo(() => {
    return places.filter((place) => savedPlaceIds.includes(place.id));
  }, [places, savedPlaceIds]);

  return (
    <main className="min-h-screen w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-8">

        {/* =========================================================
            PAGE HEADER
        ========================================================= */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
                <Compass className="w-3.5 h-3.5" />
                Traveler Center
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Your Travel Profile
            </h1>

            <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl">
              Manage your saved destinations, offline guides, safety tools,
              and travel preferences from one place.
            </p>
          </div>

          <GlassButton
            variant="secondary"
            className="w-fit"
          >
            <Settings className="w-4 h-4" />
            Settings
          </GlassButton>
        </header>

        {/* =========================================================
            PROFILE HERO
        ========================================================= */}
        <GlassCard
          glow
          className="relative overflow-hidden p-6 sm:p-8 border-cyan-500/20"
        >
          {/* Background decoration */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 left-1/3 w-72 h-72 rounded-full bg-sky-500/5 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row lg:items-center gap-7">

            {/* Avatar */}
            <div className="relative shrink-0 mx-auto lg:mx-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[2rem] bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-700 flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.18)]">
                <User className="w-12 h-12 sm:w-14 sm:h-14 text-slate-950 stroke-[2.2]" />
              </div>

              <div className="absolute -right-2 -bottom-2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-slate-950 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Profile information */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Verified Traveler
                </h2>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Safety Active
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-400">
                Your personalized travel dashboard and offline destination
                collection.
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs text-slate-500">
                <span>
                  Traveler ID:{' '}
                  <strong className="text-slate-300">
                    IND-TI-8842
                  </strong>
                </span>

                <span className="hidden sm:block text-slate-700">•</span>

                <span className="inline-flex items-center gap-1.5 text-emerald-400">
                  <Database className="w-3.5 h-3.5" />
                  Local storage ready
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* =========================================================
            QUICK STATS
        ========================================================= */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

          <StatCard
            icon={Bookmark}
            label="Saved Places"
            value={savedPlaces.length}
            suffix="places"
            iconClass="text-cyan-400"
            bgClass="bg-cyan-500/10"
          />

          <StatCard
            icon={WifiOff}
            label="Offline Ready"
            value={savedPlaces.length}
            suffix="cached"
            iconClass="text-violet-400"
            bgClass="bg-violet-500/10"
          />

          <StatCard
            icon={MapPin}
            label="Destinations"
            value={places.length}
            suffix="available"
            iconClass="text-sky-400"
            bgClass="bg-sky-500/10"
          />

          <StatCard
            icon={ShieldCheck}
            label="Safety"
            value="ACTIVE"
            suffix=""
            iconClass="text-emerald-400"
            bgClass="bg-emerald-500/10"
          />

        </section>

        {/* =========================================================
            MAIN CONTENT GRID
        ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

          {/* =======================================================
              SAVED PLACES
          ======================================================= */}
          <section className="min-w-0">

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-xl font-bold text-white">
                    Saved Places
                  </h2>

                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
                    {savedPlaces.length}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Your favorite destinations available for offline access.
                </p>
              </div>

              {savedPlaces.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = '/explore';
                  }}
                  className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Explore more
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {savedPlaces.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {savedPlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                  />
                ))}
              </div>
            ) : (
              <GlassCard className="p-8 sm:p-12">
                <EmptyState
                  icon={Bookmark}
                  title="Your collection is empty"
                  description="Save destinations while exploring and they'll appear here for quick access, even when your connection is limited."
                  actionLabel="Explore Destinations"
                  onAction={() => {
                    window.location.href = '/explore';
                  }}
                />
              </GlassCard>
            )}
          </section>

          {/* =======================================================
              SIDEBAR
          ======================================================= */}
          <aside className="space-y-4">

            {/* Offline status */}
            <GlassCard className="p-5 border-emerald-500/20">
              <div className="flex items-start gap-4">

                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Database className="w-5 h-5 text-emerald-400" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">
                      Offline Storage
                    </h3>

                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  </div>

                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Your saved destinations are stored locally and can be
                    accessed without an internet connection.
                  </p>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-slate-500">
                        Cached places
                      </span>

                      <span className="text-emerald-400 font-medium">
                        {savedPlaces.length}
                      </span>
                    </div>

                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            Math.max(savedPlaces.length * 10, 8),
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Safety card */}
            <GlassCard className="p-5 border-red-500/20">
              <div className="flex items-start gap-4">

                <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-red-400" />
                </div>

                <div>
                  <h3 className="font-semibold text-white">
                    Emergency Safety
                  </h3>

                  <p className="text-xs text-slate-400 mt-1">
                    Emergency services are available at any time.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <EmergencyContact
                  label="National Emergency"
                  number="112"
                />

                <EmergencyContact
                  label="Tourist Helpline"
                  number="1363"
                />
              </div>

              <button
                type="button"
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/15 transition-colors text-sm font-medium"
              >
                <Navigation className="w-4 h-4" />
                Safety Center
              </button>
            </GlassCard>

            {/* Quick actions */}
            <GlassCard className="p-5">
              <h3 className="font-semibold text-white mb-3">
                Quick Actions
              </h3>

              <div className="space-y-1">

                <QuickAction
                  icon={Compass}
                  label="Explore destinations"
                  onClick={() => {
                    window.location.href = '/explore';
                  }}
                />

                <QuickAction
                  icon={MapPin}
                  label="View nearby places"
                />

                <QuickAction
                  icon={Heart}
                  label="Travel preferences"
                />

              </div>
            </GlassCard>

          </aside>
        </div>

        {/* =========================================================
            PRIVACY / LOCAL DATA
        ========================================================= */}
        <GlassCard className="p-5 sm:p-6 border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">

            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-slate-300" />
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">
                Your travel data stays on your device
              </h3>

              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Saved places and offline preferences are stored locally using
                browser storage. No account synchronization is required.
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Local & secure
            </span>

          </div>
        </GlassCard>

      </div>

      {/* Details Modal */}
      <PlaceDetailsModal />
    </main>
  );
}

/* =============================================================
   STAT CARD
============================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  iconClass,
  bgClass,
}) {
  return (
    <GlassCard className="p-4 sm:p-5">
      <div className="flex items-center gap-3">

        <div
          className={`w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-5 h-5 ${iconClass}`} />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">
            {label}
          </p>

          <div className="flex items-baseline gap-1.5 mt-0.5">
            <strong className="text-lg sm:text-xl text-white">
              {value}
            </strong>

            {suffix && (
              <span className="text-[11px] text-slate-500">
                {suffix}
              </span>
            )}
          </div>
        </div>

      </div>
    </GlassCard>
  );
}

/* =============================================================
   EMERGENCY CONTACT
============================================================= */

function EmergencyContact({ label, number }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
      <span className="text-xs text-slate-400">
        {label}
      </span>

      <strong className="text-sm text-white">
        {number}
      </strong>
    </div>
  );
}

/* =============================================================
   QUICK ACTION
============================================================= */

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-800/60 transition-colors group"
    >
      <Icon className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />

      <span className="flex-1 text-sm text-slate-300 group-hover:text-white transition-colors">
        {label}
      </span>

      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
    </button>
  );
}

export default ProfilePage;