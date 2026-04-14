<script setup lang="ts">
import { ref, watch } from 'vue';
import { GoogleMap, Marker, MarkerCluster } from 'vue3-google-map';
import { useParks } from '../composables/useParks';
import { useAuth } from '../composables/useAuth';
import type { Park } from '../types/Park';
import MarkerLegend from './MarkerLegend.vue';

const emit = defineEmits<{
  markerClick: [park: Park];
  openFilters: [];
}>();

const { filteredParks, loading } = useParks();
const { user } = useAuth();

const mapCenter = { lat: 51.0, lng: 10.0 }; // Center of Europe
const mapRef = ref<InstanceType<typeof GoogleMap> | null>(null);

// Watch for changes in filtered parks and adjust bounds
watch(filteredParks, async (parks) => {
  if (parks.length === 0 || !mapRef.value) return;

  try {
    // Wait for the map instance to be ready
    const mapInstance = await mapRef.value.map;
    if (!mapInstance) return;

    // Small delay to ensure markers are rendered
    setTimeout(() => {
      const bounds = new google.maps.LatLngBounds();
      parks.forEach((park) => {
        bounds.extend(park.coordinates);
      });
      mapInstance.fitBounds(bounds);
    }, 100);
  } catch (error) {
    console.error('Error fitting bounds:', error);
  }
});

const getMarkerIcon = (park: Park) => {
  const isVisited = user.value?.visitedParkIds.includes(park.id) || false;
  const hasPromotion = park.promotion?.active || false;
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
    scaledSize: { width: size, height: size },
    anchor: { x: size / 2, y: size - 2 },
  };
};

const handleMarkerClick = (park: Park) => {
  emit('markerClick', park);
};
</script>


<template>
  <div class="map-container">
    <div v-if="loading" class="loading-skeleton">
      <div class="skeleton-pulse"></div>
      <span>Loading parks...</span>
    </div>

    <GoogleMap
      ref="mapRef"
      api-key="AIzaSyBFndI0-S8lHHyfTIzNApFxOLPfFDVBEAM"
      :center="mapCenter"
      :zoom="5"
      class="map-element"
    >
      <MarkerCluster>
        <Marker
          v-for="park in filteredParks"
          :key="park.id"
          :options="{
            position: park.coordinates,
            icon: getMarkerIcon(park),
            title: park.name,
          }"
          @click="handleMarkerClick(park)"
        />
      </MarkerCluster>
    </GoogleMap>

    <MarkerLegend />

    <!-- Mobile filter button -->
    <button class="mobile-filter-button" @click="emit('openFilters')" aria-label="Open filters">
      <span class="filter-icon">⚙</span>
      <span>Filters</span>
    </button>

    <!-- Empty state -->
    <div v-if="!loading && filteredParks.length === 0" class="empty-state">
      <div class="empty-state-content">
        <span class="empty-icon">🔍</span>
        <h3>No parks match your filters</h3>
        <p>Try adjusting your filter criteria to see more results</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f3f4f6;
}

.map-element {
  width: 100%;
  height: 100%;
}

.loading-skeleton {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  z-index: 10;
  gap: 16px;
}

.skeleton-pulse {
  width: 60px;
  height: 60px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-skeleton span {
  font-size: 14px;
  color: #6b7280;
}

.mobile-filter-button {
  display: none;
  position: fixed;
  bottom: 24px;
  left: 24px;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  z-index: 50;
  gap: 8px;
  align-items: center;
  transition: all 0.2s;
}

.mobile-filter-button:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.mobile-filter-button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.filter-icon {
  font-size: 18px;
}

.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  pointer-events: none;
}

.empty-state-content {
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 320px;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.empty-state-content h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.empty-state-content p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

@media (max-width: 767px) {
  .mobile-filter-button {
    display: flex;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-pulse {
    animation: none;
    border-top-color: #e5e7eb;
  }

  .mobile-filter-button {
    transition: none;
  }

  .mobile-filter-button:hover {
    transform: none;
  }
}
</style>
