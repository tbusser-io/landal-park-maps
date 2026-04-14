<script setup lang="ts">
import { computed } from 'vue';
import { useFilters } from '../composables/useFilters';
import { useParks } from '../composables/useParks';
import { useAuth } from '../composables/useAuth';

const emit = defineEmits<{
  close: [];
}>();

const { filterState, activeFilters, toggleFilter, clearAll, removeChip } = useFilters();
const { filteredParks } = useParks();
const { isAuthenticated } = useAuth();

const countries = ['Netherlands', 'Germany', 'Belgium', 'Denmark', 'Austria', 'Switzerland', 'United Kingdom'];

const features = [
  { key: 'indoorPool', label: 'Indoor Pool' },
  { key: 'swimmingParadise', label: 'Swimming Paradise' },
  { key: 'petsAllowed', label: 'Pets Allowed' },
  { key: 'luxury', label: 'Luxury' },
  { key: 'childFriendly', label: 'Child Friendly' },
  { key: 'wellness', label: 'Wellness & Spa' },
  { key: 'restaurant', label: 'Restaurant' },
];

const locations = [
  { key: 'nearSea', label: 'Near Sea' },
  { key: 'forest', label: 'Forest Area' },
  { key: 'nearLake', label: 'Near Lake' },
];

const resultCount = computed(() => filteredParks.value.length);
</script>

<template>
  <aside class="filter-sidebar">
    <div class="sidebar-header">
      <h2>Filters</h2>
      <button class="close-button-mobile" @click="emit('close')" aria-label="Close filters">
        ×
      </button>
    </div>

    <div class="result-count">
      {{ resultCount }} {{ resultCount === 1 ? 'park' : 'parks' }} found
    </div>

    <div v-if="activeFilters.length > 0" class="active-filters">
      <div class="active-filters-header">
        <span>Active Filters</span>
        <button class="clear-all-button" @click="clearAll">Clear All</button>
      </div>

      <div class="filter-chips">
        <button
          v-for="chip in activeFilters"
          :key="`${chip.key}-${chip.value}`"
          class="filter-chip"
          @click="removeChip(chip)"
        >
          {{ chip.label }}
          <span class="chip-remove">×</span>
        </button>
      </div>
    </div>

    <div class="filters-content">
      <!-- Country Filter -->
      <div class="filter-section">
        <h3 class="filter-title">Country</h3>
        <div class="filter-options">
          <label
            v-for="country in countries"
            :key="country"
            class="checkbox-label"
          >
            <input
              type="checkbox"
              :checked="filterState.countries.includes(country)"
              @change="toggleFilter('countries', country)"
            />
            <span>{{ country }}</span>
          </label>
        </div>
      </div>

      <!-- Features Filter -->
      <div class="filter-section">
        <h3 class="filter-title">Amenities</h3>
        <div class="filter-options">
          <label
            v-for="feature in features"
            :key="feature.key"
            class="checkbox-label"
          >
            <input
              type="checkbox"
              :checked="filterState.features.includes(feature.key)"
              @change="toggleFilter('features', feature.key)"
            />
            <span>{{ feature.label }}</span>
          </label>
        </div>
      </div>

      <!-- Location Filter -->
      <div class="filter-section">
        <h3 class="filter-title">Location Type</h3>
        <div class="filter-options">
          <label
            v-for="location in locations"
            :key="location.key"
            class="checkbox-label"
          >
            <input
              type="checkbox"
              :checked="filterState.locations.includes(location.key)"
              @change="toggleFilter('locations', location.key)"
            />
            <span>{{ location.label }}</span>
          </label>
        </div>
      </div>

      <!-- Special Filters -->
      <div class="filter-section">
        <h3 class="filter-title">Special</h3>
        <div class="filter-options">
          <label class="checkbox-label">
            <input
              type="checkbox"
              :checked="filterState.showPromotionsOnly"
              @change="toggleFilter('special', 'promotions')"
            />
            <span>Promotions Only</span>
          </label>

          <template v-if="isAuthenticated">
            <label class="checkbox-label">
              <input
                type="checkbox"
                :checked="filterState.showVisitedOnly"
                @change="toggleFilter('special', 'visited')"
              />
              <span>Visited Only</span>
            </label>

            <label class="checkbox-label">
              <input
                type="checkbox"
                :checked="filterState.showUnvisitedOnly"
                @change="toggleFilter('special', 'unvisited')"
              />
              <span>Not Visited Only</span>
            </label>
          </template>

          <p v-else class="auth-hint">
            Login to filter by visited parks
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.filter-sidebar {
  background: white;
  border-right: 1px solid #e5e7eb;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.close-button-mobile {
  display: none;
  background: none;
  border: none;
  font-size: 32px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
}

.result-count {
  padding: 16px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #3b82f6;
  background: #eff6ff;
  border-bottom: 1px solid #e5e7eb;
}

.active-filters {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.active-filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.clear-all-button {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.clear-all-button:hover {
  color: #2563eb;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.filter-chip:hover {
  background: #2563eb;
}

.chip-remove {
  font-size: 16px;
  font-weight: bold;
}

.filters-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.filter-section {
  margin-bottom: 28px;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.filter-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.checkbox-label:hover {
  color: #1f2937;
}

.auth-hint {
  font-size: 13px;
  color: #6b7280;
  font-style: italic;
  margin: 8px 0 0 0;
}

@media (max-width: 767px) {
  .filter-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 80vw;
    max-width: 320px;
    z-index: 200;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  }

  .close-button-mobile {
    display: block;
  }
}

@media (prefers-reduced-motion: reduce) {
  .clear-all-button,
  .filter-chip {
    transition: none;
  }
}
</style>
