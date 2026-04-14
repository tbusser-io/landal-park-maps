import { ref, type Ref } from 'vue';
import type { Park } from '../types/Park';
import { MarkerClusterer } from '@googlemaps/markerclusterer';

// Singleton state - shared across all useMap calls
const map = ref<google.maps.Map | null>(null);
const markers = ref<google.maps.Marker[]>([]);
const markerClusterer = ref<MarkerClusterer | null>(null);
let initCount = 0;

// Global marker tracking - track EVERY marker ever created
const allMarkersEverCreated: google.maps.Marker[] = [];
let markerIdCounter = 0;

export function useMap(mapElementRef: Ref<HTMLElement | null>) {
  // Initialize map (only creates one map instance)
  const initMap = () => {
    if (map.value) {
      return;
    }

    if (!mapElementRef.value || !window.google) {
      console.error('Map element or Google Maps not available');
      return;
    }

    map.value = new google.maps.Map(mapElementRef.value, {
      zoom: 5,
      center: { lat: 51.0, lng: 10.0 }, // Center of Europe
      mapTypeControl: false,
      fullscreenControl: true,
      streetViewControl: false,
      zoomControl: true,
    });
  };

  // Update markers based on filtered parks
  const updateMarkers = (
    parks: Park[],
    visitedParkIds: string[],
    onMarkerClick: (park: Park) => void
  ) => {
    if (!map.value) return;

    // Remove old clusterer completely
    if (markerClusterer.value) {
      markerClusterer.value.clearMarkers();
      markerClusterer.value = null;
    }

    // Clear current markers from the map
    markers.value.forEach((m) => {
      google.maps.event.clearInstanceListeners(m);
      m.setMap(null);
    });

    // Clear the arrays
    markers.value = [];
    allMarkersEverCreated.length = 0;

    // If no parks, just return after clearing
    if (parks.length === 0) {
      return;
    }

    // Create new markers for filtered parks only (without adding to map yet)
    const newMarkers: google.maps.Marker[] = [];
    parks.forEach((park) => {
      const isVisited = visitedParkIds.includes(park.id);
      const hasPromotion = park.promotion?.active || false;

      const marker = new google.maps.Marker({
        position: park.coordinates,
        icon: getMarkerIcon(isVisited, hasPromotion),
        title: park.name,
        // Don't set map here - let clusterer handle it
      });

      marker.addListener('click', () => onMarkerClick(park));

      newMarkers.push(marker);
    });

    // Update our tracking arrays
    markers.value = newMarkers;
    allMarkersEverCreated.push(...newMarkers);

    // Create new clusterer with all the new markers at once
    markerClusterer.value = new MarkerClusterer({
      map: map.value,
      markers: newMarkers,
    });

    // Fit bounds to show all markers
    fitBounds();
  };

  const fitBounds = () => {
    if (!map.value || markers.value.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    markers.value.forEach((marker) => {
      const pos = marker.getPosition();
      if (pos) bounds.extend(pos);
    });

    map.value.fitBounds(bounds);
  };

  const getMarkerIcon = (
    isVisited: boolean,
    hasPromotion: boolean
  ): google.maps.Icon => {
    const baseColor = isVisited ? '#10b981' : '#3b82f6'; // green : blue
    const size = hasPromotion ? 40 : 32;

    const badgeIcon = hasPromotion
      ? `<circle cx="30" cy="10" r="8" fill="#f59e0b" stroke="white" stroke-width="1"/>
       <text x="30" y="14" text-anchor="middle" font-size="10" fill="white" font-weight="bold">%</text>`
      : '';

    const svgIcon = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <path d="M${size / 2} 5 C${size * 0.3} 5 5 ${size * 0.3} 5 ${size / 2} C5 ${size * 0.7} ${size / 2} ${size - 2} ${size / 2} ${size - 2} S${size - 5} ${size * 0.7} ${size - 5} ${size / 2} C${size - 5} ${size * 0.3} ${size * 0.7} 5 ${size / 2} 5 Z"
              fill="${baseColor}" stroke="white" stroke-width="2"/>
        ${badgeIcon}
      </svg>
    `;

    return {
      url: `data:image/svg+xml,${encodeURIComponent(svgIcon)}`,
      scaledSize: new google.maps.Size(size, size),
      anchor: new google.maps.Point(size / 2, size - 2),
    };
  };

  return { map, initMap, updateMarkers, fitBounds };
}
