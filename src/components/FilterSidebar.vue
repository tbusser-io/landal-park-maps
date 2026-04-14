<script setup lang="ts">
import { computed } from 'vue';
import { useFilters } from '../composables/useFilters';
import { useParks } from '../composables/useParks';
import { useAuth } from '../composables/useAuth';
import TriStateToggle from './TriStateToggle.vue';
import TwoStateToggle from './TwoStateToggle.vue';

const emit = defineEmits<{
  close: [];
}>();

const { filterState, activeFilters, setFilter, getFilter, toggleFilter, clearAll, removeChip } = useFilters();
const { filteredParks } = useParks();
const { isAuthenticated } = useAuth();

/** All countries with Landal parks (alphabetically sorted) */
const countries = [
  'Austria',
  'Belgium',
  'Czech Republic',
  'Denmark',
  'Germany',
  'Netherlands',
  'Switzerland',
  'United Kingdom',
];

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
          :class="`chip-${chip.filterValue}`"
          @click="removeChip(chip)"
        >
          <span class="chip-icon">{{ chip.filterValue === 'exclude' ? '✕' : '✓' }}</span>
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
          <TriStateToggle
            v-for="country in countries"
            :key="country"
            :label="country"
            :model-value="getFilter('countries', country)"
            @update:model-value="(value) => setFilter('countries', country, value)"
          />
        </div>
      </div>

      <!-- Features Filter -->
      <div class="filter-section">
        <h3 class="filter-title">Amenities</h3>
        <div class="filter-options">
          <TriStateToggle
            v-for="feature in features"
            :key="feature.key"
            :label="feature.label"
            :model-value="getFilter('features', feature.key)"
            @update:model-value="(value) => setFilter('features', feature.key, value)"
          />
        </div>
      </div>

      <!-- Location Filter -->
      <div class="filter-section">
        <h3 class="filter-title">Location Type</h3>
        <div class="filter-options">
          <TriStateToggle
            v-for="location in locations"
            :key="location.key"
            :label="location.label"
            :model-value="getFilter('locations', location.key)"
            @update:model-value="(value) => setFilter('locations', location.key, value)"
          />
        </div>
      </div>

      <!-- Special Filters -->
      <div class="filter-section">
        <h3 class="filter-title">Special</h3>
        <div class="filter-options">
          <TwoStateToggle
            label="Promotions Only"
            :model-value="filterState.showPromotionsOnly"
            @update:model-value="toggleFilter('special', 'promotions')"
          />

          <template v-if="isAuthenticated">
            <TwoStateToggle
              label="Favorites Only"
              :model-value="filterState.showFavoritesOnly"
              @update:model-value="toggleFilter('special', 'favorites')"
            />

            <TwoStateToggle
              label="Visited Only"
              :model-value="filterState.showVisitedOnly"
              @update:model-value="toggleFilter('special', 'visited')"
            />

            <TwoStateToggle
              label="Not Visited Only"
              :model-value="filterState.showUnvisitedOnly"
              @update:model-value="toggleFilter('special', 'unvisited')"
            />
          </template>

          <p v-else class="auth-hint">
            Login to filter by favorites and visited parks
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.filter-sidebar {
  background: var(--site-header-navigation_background-color);
  border: 1px solid var(--site-header-navigation_border-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--site-header-navigation_box-shadow);
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--site-header-navigation_border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px 8px 0 0;
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
  color: var(--brand-color);
  background: white;
  border-bottom: 1px solid var(--site-header-navigation_border-color);
}

.active-filters {
  padding: 16px 20px;
  border-bottom: 1px solid var(--site-header-navigation_border-color);
  background: var(--background-color-secondary);
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

.filter-chip.chip-exclude {
  background: #dc2626;
}

.filter-chip.chip-exclude:hover {
  background: #b91c1c;
}

.filter-chip.chip-must {
  background: #059669;
}

.filter-chip.chip-must:hover {
  background: #047857;
}

.filter-chip:hover {
  background: #2563eb;
}

.chip-icon {
  font-size: 12px;
  font-weight: bold;
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
  gap: 4px;
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
    border-radius: 0;
    border-right: 1px solid #e5e7eb;
    border-left: none;
    border-top: none;
    border-bottom: none;
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
