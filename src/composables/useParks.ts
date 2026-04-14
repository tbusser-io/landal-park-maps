import { ref, computed, onMounted } from 'vue';
import type { Park } from '../types/Park';
import { useAuth } from './useAuth';
import { useFilters } from './useFilters';

// Shared state (singleton) - created once, shared by all components
const allParks = ref<Park[]>([]);
const loading = ref(true);

// Load parks.json immediately
(async () => {
  try {
    const module = await import('../data/parks.json');
    allParks.value = module.default;
    loading.value = false;
  } catch (error) {
    console.error('Failed to load parks:', error);
    loading.value = false;
  }
})();

export function useParks() {
  const { user } = useAuth();
  const { filterState } = useFilters();

  // Computed: apply all active filters with tri-state logic
  const filteredParks = computed(() => {
    return allParks.value.filter((park) => {
      // 1. Country filters (tri-state)
      // First, handle exclude filters
      for (const [country, filterValue] of Object.entries(filterState.countries)) {
        if (filterValue === 'exclude' && park.country === country) {
          return false; // Exclude parks from this country
        }
      }

      // Then check if park matches any 'must' countries (OR logic)
      const mustCountries = Object.entries(filterState.countries)
        .filter(([_, value]) => value === 'must')
        .map(([country]) => country);

      if (mustCountries.length > 0 && !mustCountries.includes(park.country)) {
        return false; // Park doesn't match any required country
      }

      // 2. Feature filters (tri-state)
      for (const [feature, filterValue] of Object.entries(filterState.features)) {
        const featureKey = feature as keyof typeof park.features;
        const hasFeature = park.features[featureKey];

        if (filterValue === 'exclude' && hasFeature) {
          return false; // Exclude parks that have this feature
        }
        if (filterValue === 'must' && !hasFeature) {
          return false; // Only include parks that have this feature
        }
      }

      // 3. Location filters (tri-state)
      for (const [location, filterValue] of Object.entries(filterState.locations)) {
        const locationKey = location as keyof typeof park.location;
        const hasLocation = park.location[locationKey];

        if (filterValue === 'exclude' && hasLocation) {
          return false; // Exclude parks with this location type
        }
        if (filterValue === 'must' && !hasLocation) {
          return false; // Only include parks with this location type
        }
      }

      // 4. Visited filter
      const isVisited = user.value?.visitedParkIds.includes(park.id) || false;
      if (filterState.showVisitedOnly && !isVisited) return false;
      if (filterState.showUnvisitedOnly && isVisited) return false;

      // 5. Promotion filter
      if (filterState.showPromotionsOnly && !park.promotion?.active) return false;

      return true; // Park passes all filters
    });
  });

  return { allParks, filteredParks, loading };
}
