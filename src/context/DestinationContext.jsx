import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { DESTINATIONS } from '../data/destinations';
import { TOURIST_PLACES } from '../data/touristPlaces';
import { STATES } from '../data/states';
import { storageService } from '../services/storageService';
import { indexedDBService } from '../services/indexedDBService';
import { api } from '../services/api';

const DestinationContext = createContext(null);

export function DestinationProvider({ children }) {
  const [destinations] = useState(DESTINATIONS);
  const [places] = useState(TOURIST_PLACES);
  const [states] = useState(STATES);

  // Active filters and selections
  const [selectedStateId, setSelectedStateId] = useState('ALL');
  const [selectedDestinationId, setSelectedDestinationId] = useState(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Modal Place
  const [detailModalPlace, setDetailModalPlace] = useState(null);

  // Saved Offline Places
  const [savedPlaceIds, setSavedPlaceIds] = useState(() => {
    return storageService.get('saved_place_ids', []);
  });

  // Load saved places on mount
  useEffect(() => {
    const cachedIds = storageService.get('saved_place_ids', []);
    if (cachedIds && Array.isArray(cachedIds)) {
      setSavedPlaceIds(cachedIds);
    }
  }, []);

  // Save place toggle handler with IndexedDB and backend API sync
  const toggleSavePlace = useCallback(async (place) => {
    if (!place || !place.id) return;
    const placeId = place.id;

    setSavedPlaceIds((prev) => {
      let nextIds;
      if (prev.includes(placeId)) {
        nextIds = prev.filter((id) => id !== placeId);
        // Remove from IndexedDB & backend
        indexedDBService.delete('savedPlaces', placeId).catch(() => {});
        api.removeSavedPlace(placeId).catch(() => {});
      } else {
        nextIds = [...prev, placeId];
        // Put in IndexedDB & backend
        indexedDBService.put('savedPlaces', { ...place, savedAt: new Date().toISOString() }).catch(() => {});
        api.savePlace(placeId, 'local_user', place).catch(() => {});
      }
      storageService.set('saved_place_ids', nextIds);
      return nextIds;
    });
  }, []);

  const isSaved = useCallback((placeId) => {
    return savedPlaceIds.includes(placeId);
  }, [savedPlaceIds]);

  const openPlaceDetails = useCallback((place) => {
    setSelectedPlaceId(place?.id || null);
    setDetailModalPlace(place);
  }, []);

  const closePlaceDetails = useCallback(() => {
    setDetailModalPlace(null);
  }, []);

  // Clear all active filters and search
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedRegion('ALL');
    setSelectedStateId('ALL');
    setSelectedDestinationId(null);
    setSelectedCategory('ALL');
    setSelectedPlaceId(null);
  }, []);

  // Active filter status check
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim().length > 0 ||
      selectedRegion !== 'ALL' ||
      selectedStateId !== 'ALL' ||
      selectedDestinationId !== null ||
      selectedCategory !== 'ALL'
    );
  }, [searchQuery, selectedRegion, selectedStateId, selectedDestinationId, selectedCategory]);

  // Derived active objects
  const selectedState = useMemo(() => {
    if (selectedStateId === 'ALL') return null;
    return states.find((s) => s.id === selectedStateId) || null;
  }, [states, selectedStateId]);

  const selectedDestination = useMemo(() => {
    if (!selectedDestinationId) return null;
    return destinations.find((d) => d.id === selectedDestinationId) || null;
  }, [destinations, selectedDestinationId]);

  const selectedPlace = useMemo(() => {
    if (!selectedPlaceId) return null;
    return places.find((p) => p.id === selectedPlaceId) || null;
  }, [places, selectedPlaceId]);

  // Available states for active region
  const availableStates = useMemo(() => {
    if (selectedRegion === 'ALL') return states;
    return states.filter((s) => s.region === selectedRegion);
  }, [states, selectedRegion]);

  // Available destinations for active region and state
  const availableDestinations = useMemo(() => {
    return destinations.filter((d) => {
      const matchRegion = selectedRegion === 'ALL' || d.region === selectedRegion;
      const matchState = selectedStateId === 'ALL' || d.stateId === selectedStateId;
      return matchRegion && matchState;
    });
  }, [destinations, selectedRegion, selectedStateId]);

  // Helper for flexible search matching (handles partials, case, and spacing differences)
  const isSearchMatch = useCallback((target, query, compactQuery) => {
    if (!target || !query) return false;
    const str = String(target).toLowerCase();
    // 1. Direct substring match
    if (str.includes(query)) return true;
    // 2. Compact match (ignoring spaces, hyphens, and punctuation)
    if (compactQuery && compactQuery.length >= 2) {
      const compactStr = str.replace(/[\s\-_,.]/g, '');
      if (compactStr.includes(compactQuery) || compactQuery.includes(compactStr)) return true;
    }
    return false;
  }, []);

  // Live Smart Search categorization (States, Destinations, Tourist Places)
  const searchResults = useMemo(() => {
    const rawQuery = searchQuery.trim();
    if (!rawQuery) return { states: [], destinations: [], places: [] };

    const query = rawQuery.toLowerCase().replace(/\s+/g, ' ');
    const compactQ = rawQuery.toLowerCase().replace(/[\s\-_,.]/g, '');

    const matchedStates = states.filter(
      (s) =>
        isSearchMatch(s.name, query, compactQ) ||
        isSearchMatch(s.capital, query, compactQ) ||
        s.code.toLowerCase() === query ||
        s.code.toLowerCase() === compactQ
    );

    const matchedDestinations = destinations.filter(
      (d) =>
        isSearchMatch(d.name, query, compactQ) ||
        isSearchMatch(d.state, query, compactQ) ||
        isSearchMatch(d.region, query, compactQ) ||
        isSearchMatch(d.description, query, compactQ) ||
        (Array.isArray(d.categories) &&
          d.categories.some((c) => isSearchMatch(c, query, compactQ)))
    );

    const matchedPlaces = places.filter(
      (p) =>
        isSearchMatch(p.name, query, compactQ) ||
        isSearchMatch(p.destination, query, compactQ) ||
        isSearchMatch(p.state, query, compactQ) ||
        isSearchMatch(p.category, query, compactQ) ||
        isSearchMatch(p.description, query, compactQ)
    );

    return {
      states: matchedStates,
      destinations: matchedDestinations,
      places: matchedPlaces,
    };
  }, [searchQuery, states, destinations, places, isSearchMatch]);

  // Combined Multi-Filter Engine
  const filteredDestinations = useMemo(() => {
    const rawQuery = searchQuery.trim();
    const query = rawQuery.toLowerCase().replace(/\s+/g, ' ');
    const compactQ = rawQuery.toLowerCase().replace(/[\s\-_,.]/g, '');

    return destinations.filter((dest) => {
      // 1. Search Query Filter (Checks City Name, State, Region, Description, Categories, and Child Places)
      let matchSearch = true;
      if (query) {
        const directMatch =
          isSearchMatch(dest.name, query, compactQ) ||
          isSearchMatch(dest.state, query, compactQ) ||
          isSearchMatch(dest.region, query, compactQ) ||
          isSearchMatch(dest.description, query, compactQ) ||
          (Array.isArray(dest.categories) &&
            dest.categories.some((c) => isSearchMatch(c, query, compactQ)));

        const childPlaceMatch = places.some(
          (p) =>
            p.destinationId === dest.id &&
            (isSearchMatch(p.name, query, compactQ) ||
              isSearchMatch(p.category, query, compactQ) ||
              isSearchMatch(p.description, query, compactQ))
        );

        matchSearch = directMatch || childPlaceMatch;
      }

      // 2. Region Filter
      const matchRegion = selectedRegion === 'ALL' || dest.region === selectedRegion;

      // 3. State Filter
      const matchState =
        selectedStateId === 'ALL' ||
        dest.stateId === selectedStateId ||
        dest.state.toLowerCase() === selectedStateId.toLowerCase();

      // 4. Direct Destination Filter
      const matchDestination =
        !selectedDestinationId || dest.id === selectedDestinationId;

      // 5. Category Filter
      let matchCategory = true;
      if (selectedCategory !== 'ALL') {
        const destHasCategory =
          Array.isArray(dest.categories) &&
          dest.categories.some(
            (c) => c.toLowerCase() === selectedCategory.toLowerCase()
          );

        const childHasCategory = places.some(
          (p) =>
            p.destinationId === dest.id &&
            p.category.toLowerCase() === selectedCategory.toLowerCase()
        );

        matchCategory = destHasCategory || childHasCategory;
      }

      return matchSearch && matchRegion && matchState && matchDestination && matchCategory;
    });
  }, [
    destinations,
    places,
    searchQuery,
    selectedRegion,
    selectedStateId,
    selectedDestinationId,
    selectedCategory,
    isSearchMatch,
  ]);

  // Filtered Places based on current destination or active filters
  const filteredPlaces = useMemo(() => {
    let pool = places;
    if (selectedDestinationId) {
      pool = pool.filter((p) => p.destinationId === selectedDestinationId);
    } else {
      const allowedDestIds = new Set(filteredDestinations.map((d) => d.id));
      pool = pool.filter((p) => allowedDestIds.has(p.destinationId));
    }

    if (selectedCategory !== 'ALL') {
      pool = pool.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    const rawQuery = searchQuery.trim();
    if (rawQuery) {
      const query = rawQuery.toLowerCase().replace(/\s+/g, ' ');
      const compactQ = rawQuery.toLowerCase().replace(/[\s\-_,.]/g, '');

      pool = pool.filter(
        (p) =>
          isSearchMatch(p.name, query, compactQ) ||
          isSearchMatch(p.destination, query, compactQ) ||
          isSearchMatch(p.state, query, compactQ) ||
          isSearchMatch(p.category, query, compactQ) ||
          isSearchMatch(p.description, query, compactQ)
      );
    }

    return pool;
  }, [places, selectedDestinationId, filteredDestinations, selectedCategory, searchQuery, isSearchMatch]);

  const value = {
    destinations,
    places,
    states,
    availableStates,
    availableDestinations,
    filteredDestinations,
    filteredPlaces,
    searchResults,
    selectedStateId,
    setSelectedStateId,
    selectedState,
    selectedDestinationId,
    setSelectedDestinationId,
    selectedDestination,
    selectedPlaceId,
    setSelectedPlaceId,
    selectedPlace,
    selectedCategory,
    setSelectedCategory,
    selectedRegion,
    setSelectedRegion,
    searchQuery,
    setSearchQuery,
    clearFilters,
    hasActiveFilters,
    detailModalPlace,
    openPlaceDetails,
    closePlaceDetails,
    savedPlaceIds,
    toggleSavePlace,
    isSaved,
  };

  return (
    <DestinationContext.Provider value={value}>
      {children}
    </DestinationContext.Provider>
  );
}

export function useDestinations() {
  const context = useContext(DestinationContext);
  if (!context) {
    throw new Error('useDestinations must be used within a DestinationProvider');
  }
  return context;
}

export default DestinationContext;