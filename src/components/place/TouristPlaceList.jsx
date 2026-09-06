import React from 'react';
import PlaceCard from './PlaceCard';
import EmptyState from '../ui/EmptyState';

export function TouristPlaceList({ places = [], selectedPlaceId, onSelectPlace, className = '' }) {
  if (!places || places.length === 0) {
    return (
      <EmptyState
        title="No Tourist Places Available"
        description="Tourist place telemetry for this location is being populated in prototype datasets."
      />
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-4 ${className}`}>
      {places.map((place) => (
        <PlaceCard
          key={place.id}
          place={place}
          isSelected={selectedPlaceId === place.id}
        />
      ))}
    </div>
  );
}

export default TouristPlaceList;
