<script setup lang="ts">
import type { Park } from '../types/Park';
import { useAuth } from '../composables/useAuth';

const props = defineProps<{
  park: Park;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { user } = useAuth();

const isVisited = () => {
  return user.value?.visitedParkIds.includes(props.park.id) || false;
};

const getFeatureLabel = (key: string): string => {
  const labels: Record<string, string> = {
    indoorPool: 'Indoor Pool',
    swimmingParadise: 'Swimming Paradise',
    petsAllowed: 'Pets Allowed',
    luxury: 'Luxury',
    childFriendly: 'Child Friendly',
    wellness: 'Wellness & Spa',
    restaurant: 'Restaurant',
  };
  return labels[key] || key;
};

const getLocationLabel = (key: string): string => {
  const labels: Record<string, string> = {
    nearSea: 'Near Sea',
    forest: 'Forest Area',
    nearLake: 'Near Lake',
  };
  return labels[key] || key;
};

const activeFeatures = () => {
  return Object.entries(props.park.features)
    .filter(([_, value]) => value)
    .map(([key]) => getFeatureLabel(key));
};

const activeLocations = () => {
  return Object.entries(props.park.location)
    .filter(([_, value]) => value)
    .map(([key]) => getLocationLabel(key));
};
</script>

<template>
  <div class="side-panel">
    <div class="panel-header">
      <button class="close-button" @click="emit('close')" aria-label="Close panel">
        ×
      </button>
    </div>

    <div class="panel-content">
      <div class="park-image-container">
        <img :src="park.imageUrl" :alt="park.name" class="park-image" />

        <div v-if="park.promotion" class="promotion-badge">
          {{ park.promotion.text }}
        </div>

        <div v-if="isVisited()" class="visited-badge">
          ✓ Visited
        </div>
      </div>

      <div class="park-info">
        <h2 class="park-name">{{ park.name }}</h2>

        <div class="park-location">
          <span class="location-icon">📍</span>
          <span>{{ park.region }}, {{ park.country }}</span>
        </div>

        <p class="park-description">{{ park.description }}</p>

        <div v-if="activeFeatures().length > 0" class="amenities-section">
          <h3>Amenities</h3>
          <div class="amenities-list">
            <span
              v-for="feature in activeFeatures()"
              :key="feature"
              class="amenity-chip"
            >
              {{ feature }}
            </span>
          </div>
        </div>

        <div v-if="activeLocations().length > 0" class="location-section">
          <h3>Location Features</h3>
          <div class="amenities-list">
            <span
              v-for="location in activeLocations()"
              :key="location"
              class="amenity-chip location-chip"
            >
              {{ location }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.side-panel {
  background: white;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.close-button {
  background: none;
  border: none;
  font-size: 32px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-button:hover {
  color: #1f2937;
}

.close-button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
}

.park-image-container {
  position: relative;
  width: 100%;
  height: 250px;
}

.park-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.promotion-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #f59e0b;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.visited-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  background: #10b981;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.park-info {
  padding: 24px;
}

.park-name {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.park-location {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 16px;
}

.location-icon {
  font-size: 16px;
}

.park-description {
  color: #374151;
  line-height: 1.6;
  margin-bottom: 24px;
}

.amenities-section,
.location-section {
  margin-bottom: 24px;
}

.amenities-section h3,
.location-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.amenities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.amenity-chip {
  background: #eff6ff;
  color: #1e40af;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
}

.location-chip {
  background: #f0fdf4;
  color: #166534;
}

@media (max-width: 767px) {
  .side-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60vh;
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
  }

  .park-image-container {
    height: 200px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .close-button {
    transition: none;
  }
}
</style>
