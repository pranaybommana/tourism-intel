import React, { useState, useMemo } from 'react';
import { MapPin, Globe2, Sparkles, Filter } from 'lucide-react';
import { STATES_AND_UTS, REGIONS } from '../../data/states';
import { useDestinations } from '../../context/DestinationContext';

export function StateSelector() {
  const {
    selectedStateId,
    setSelectedStateId,
    selectedRegion,
    setSelectedRegion,
    setSelectedDestinationId,
  } = useDestinations();
  const activeTab = selectedRegion || 'ALL';

  const regionTabs = [
    { key: 'ALL', label: 'All India' },
    { key: REGIONS.SOUTH, label: 'South India' },
    { key: REGIONS.NORTH, label: 'North India' },
    { key: REGIONS.WEST, label: 'West India' },
    { key: REGIONS.EAST, label: 'East India' },
    { key: REGIONS.CENTRAL, label: 'Central India' },
    { key: REGIONS.NORTHEAST, label: 'North-East' },
    { key: REGIONS.UT, label: 'Union Territories' },
  ];

  const filteredStates = useMemo(() => {
    if (activeTab === 'ALL') return STATES_AND_UTS;
    return STATES_AND_UTS.filter((s) => s.region === activeTab);
  }, [activeTab]);

  const handleStateClick = (stateId) => {
    if (selectedStateId === stateId) {
      setSelectedStateId('ALL');
    } else {
      setSelectedStateId(stateId);
      setSelectedDestinationId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Region Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Select State or Union Territory ({STATES_AND_UTS.length})
          </h3>
        </div>

        {/* Region tabs scrollable */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {regionTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setSelectedRegion(tab.key);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 select-none border ${
                activeTab === tab.key
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-cyan-glow scale-105'
                  : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:border-cyan-500/30 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* State Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2 max-h-52 overflow-y-auto pr-1 p-1">
        <button
          type="button"
          onClick={() => setSelectedStateId('ALL')}
          className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all duration-200 border flex items-center justify-between select-none ${
            selectedStateId === 'ALL'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-cyan-glow ring-1 ring-cyan-400 scale-[1.02]'
              : 'bg-slate-900/50 text-slate-300 border-slate-800 hover:border-cyan-500/40 hover:text-white'
          }`}
        >
          <span>All States & UTs</span>
          <Globe2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        </button>

        {filteredStates.map((state) => {
          const isSelected = selectedStateId === state.id;
          return (
            <button
              key={state.id}
              type="button"
              onClick={() => handleStateClick(state.id)}
              className={`p-2.5 rounded-xl text-xs font-medium text-left transition-all duration-200 border flex flex-col justify-between select-none ${
                isSelected
                  ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400 shadow-cyan-glow ring-1 ring-cyan-400 scale-[1.03] font-bold'
                  : 'bg-slate-900/50 text-slate-300 border-slate-800/80 hover:border-cyan-500/40 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="truncate">{state.name}</span>
                <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0">
                  {state.code}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 truncate">{state.capital}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default StateSelector;