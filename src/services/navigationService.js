/**
 * Navigation & Geospatial Service for Tourism Intel
 */
export const navigationService = {
  /**
   * Calculate Great-circle distance between two coordinates in kilometers using Haversine formula
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  },

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  },

  /**
   * Format distance into human-readable string (meters or km)
   */
  formatDistance(distanceKm) {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m`;
    }
    return `${distanceKm.toFixed(1)} km`;
  },

  /**
   * Estimate walking or driving ETA
   */
  estimateETA(distanceKm, mode = 'walking') {
    const speedKmh = mode === 'walking' ? 4.5 : mode === 'driving' ? 30 : 15;
    const hours = distanceKm / speedKmh;
    const minutes = Math.round(hours * 60);

    if (minutes < 60) {
      return `${Math.max(1, minutes)} mins`;
    }
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h} hr ${m} min`;
  },

  /**
   * Get device current position with fallback
   */
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  },

  /**
   * Calculate shortest perpendicular distance in meters from a point (P) to a line segment (A -> B)
   * Uses flat-earth equirectangular approximation (sub-millimeter precision over navigational distances)
   */
  distanceToSegmentMeters(point, segStart, segEnd) {
    const lat1 = segStart.lat;
    const lon1 = segStart.lng;
    const lat2 = segEnd.lat;
    const lon2 = segEnd.lng;
    const pLat = point.lat;
    const pLon = point.lng;

    const midLat = (lat1 + lat2) / 2;
    const cosMidLat = Math.cos(this.deg2rad(midLat));

    // Convert degrees difference to meters
    const mPerDegLat = 111139;
    const mPerDegLon = 111139 * cosMidLat;

    const dx = (lon2 - lon1) * mPerDegLon;
    const dy = (lat2 - lat1) * mPerDegLat;

    const px = (pLon - lon1) * mPerDegLon;
    const py = (pLat - lat1) * mPerDegLat;

    const segLenSq = dx * dx + dy * dy;

    if (segLenSq === 0) {
      // Degenerate segment: start and end are identical
      return Math.sqrt(px * px + py * py);
    }

    // Projection scalar t clamped to [0, 1]
    const t = Math.max(0, Math.min(1, (px * dx + py * dy) / segLenSq));

    const projX = t * dx;
    const projY = t * dy;

    const distX = px - projX;
    const distY = py - projY;

    return Math.sqrt(distX * distX + distY * distY);
  },

  /**
   * Calculate minimum distance in meters from a point to an active polyline route path
   * Compares against the entire route path polyline, NOT just the destination!
   */
  calculateDistanceToRoute(point, routePoints) {
    if (!point || !routePoints || routePoints.length === 0) {
      return 0;
    }

    if (routePoints.length === 1) {
      return this.calculateDistance(point.lat, point.lng, routePoints[0].lat, routePoints[0].lng) * 1000;
    }

    let minDistanceMeters = Infinity;

    for (let i = 0; i < routePoints.length - 1; i++) {
      const segStart = routePoints[i];
      const segEnd = routePoints[i + 1];
      const dist = this.distanceToSegmentMeters(point, segStart, segEnd);
      if (dist < minDistanceMeters) {
        minDistanceMeters = dist;
      }
    }

    return Math.round(minDistanceMeters);
  },

  /**
   * Evaluates whether user coordinates violate the 180-meter route deviation safety boundary
   */
  evaluateRouteDeviation(point, routePoints, thresholdMeters = 180) {
    if (!point || !routePoints || routePoints.length === 0) {
      return { isDeviated: false, deviationDistance: 0 };
    }

    const distanceMeters = this.calculateDistanceToRoute(point, routePoints);
    return {
      isDeviated: distanceMeters > thresholdMeters,
      deviationDistance: distanceMeters,
    };
  },

  /**
   * Find nearest places to given user coordinates
   */
  findNearestPlaces(userCoords, places, limit = 5) {
    if (!userCoords || !places || places.length === 0) return [];

    return places
      .map((place) => {
        const distance = this.calculateDistance(
          userCoords.lat,
          userCoords.lng,
          place.coordinates.lat,
          place.coordinates.lng
        );
        return {
          ...place,
          distanceKm: distance,
          distanceFormatted: this.formatDistance(distance),
          walkingETA: this.estimateETA(distance, 'walking'),
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);
  },
};

export default navigationService;

