import React from 'react';
import { Compass, Filter, MapPin, Globe } from 'lucide-react';
import { useDestinations } from '../../context/DestinationContext';
import DestinationCard from '../../components/destination/DestinationCard';
import DestinationOverview from '../../components/destination/DestinationOverview';
import DestinationFilterBar from '../../components/destination/DestinationFilterBar';
import StateSelector from '../../components/destination/StateSelector';
import PlaceDetailsModal from '../../components/place/PlaceDetailsModal';
import AITravelIntelligence from '../../components/ai/AITravelIntelligence';
import SectionHeader from '../../components/ui/SectionHeader';
import EmptyState from '../../components/ui/EmptyState';

export function ExplorePage() {
  const {
    filteredDestinations,
    selectedDestinationId,
    setSelectedDestinationId,
    selectedDestination,
    clearFilters,
  } = useDestinations();

  return (
    <div className="space-y-8">
      {/* Header */}
      <SectionHeader
        title="Pan-India Destination Discovery"
        subtitle="Explore verified Indian tourist destinations with real-time safety, crowd telemetry, and curated landmarks"
      />

      {/* AI Travel Intelligence */}
      <AITravelIntelligence />

      {/* Smart Search & Filter Command Center */}
      <div className="p-5 rounded-3xl bg-slate-900/60 border border-cyan-500/30 backdrop-blur-xl shadow-cyan-glow">
        <DestinationFilterBar />
      </div>

      {/* State & UT Visual Selector */}
      <div className="p-4 rounded-3xl bg-slate-900/40 border border-cyan-500/20 backdrop-blur-md">
        <StateSelector />
      </div>

      {/* Selected Destination Overview if active */}
      {selectedDestination && <DestinationOverview />}

      {/* Destination Grid */}
      <div className="space-y-4">
        {filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredDestinations.map((dest) => (
              <DestinationCard
                key={dest.id}
                destination={dest}
                isSelected={selectedDestinationId === dest.id}
                onSelect={(d) => {
                  setSelectedDestinationId(selectedDestinationId === d.id ? null : d.id);
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No destinations found"
            description="Try changing your filters or search."
            actionLabel="Clear Filters"
            onAction={clearFilters}
          />
        )}
      </div>

      {/* Universal Details Modal */}
      <PlaceDetailsModal />
    </div>
  );
}

export default ExplorePage;