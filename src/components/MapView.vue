<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useMap } from '../composables/useMap';
import { useParks } from '../composables/useParks';
import { useAuth } from '../composables/useAuth';
import type { Park } from '../types/Park';
import MarkerLegend from './MarkerLegend.vue';

const emit = defineEmits<{
  markerClick: [park: Park];
  openFilters: [];
}>();

const mapElement = ref<HTMLElement | null>(null);
const { map, initMap, updateMarkers } = useMap(mapElement);
const { filteredParks, loading } = useParks();
const { user } = useAuth();

onMounted(() => {
  // Wait for Google Maps to load
  if (window.google) {
    initMap();
  } else {
    console.error('Google Maps not loaded');
  }
});

// Watch for changes in filtered parks, map, and user state
watch(
  [filteredParks, () => user.value?.visitedParkIds, map, loading],
  () => {
    if (map.value && !loading.value && filteredParks.value.length > 0) {
      const visitedIds = user.value?.visitedParkIds || [];
      updateMarkers(filteredParks.value, visitedIds, (park) => {
        emit('markerClick', park);
      });
    } else if (map.value && !loading.value && filteredParks.value.length === 0) {
      // Clear markers if no parks match filters
      updateMarkers([], [], () => {});
    }
  }
);
</script>

<template>
  <div class="map-container">
    <div v-if="loading" class="loading-skeleton">
      <div class="skeleton-pulse"></div>
      <span>Loading parks...</span>
    </div>

    <div ref="mapElement" class="map-element"></div>

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
