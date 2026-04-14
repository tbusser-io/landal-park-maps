import { ref, computed, onMounted } from 'vue';
import type { Park } from '../types/Park';
import { useAuth } from './useAuth';
import { useFilters } from './useFilters';

export function useParks() {
  const allParks = ref<Park[]>([]);
  const loading = ref(true);
  const { user } = useAuth();
  const { filterState } = useFilters();

  // Load parks.json on mount
  onMounted(async () => {
    try {
      const module = await import('../data/parks.json');
      allParks.value = module.default;
      loading.value = false;
    } catch (error) {
      console.error('Failed to load parks:', error);
      loading.value = false;
    }
  });

  // Computed: apply all active filters
  const filteredParks = computed(() => {
    return allParks.value.filter((park) => {
      // 1. Country filter (OR logic within countries)
      if (filterState.countries.length > 0) {
        if (!filterState.countries.includes(park.country)) return false;
      }

      // 2. Feature filters (AND logic - must have ALL selected features)
      for (const feature of filterState.features) {
        if (feature === 'indoorPool' && !park.features.indoorPool) return false;
        if (feature === 'petsAllowed' && !park.features.petsAllowed) return false;
        if (feature === 'luxury' && !park.features.luxury) return false;
        if (feature === 'swimmingParadise' && !park.features.swimmingParadise)
          return false;
        if (feature === 'childFriendly' && !park.features.childFriendly) return false;
        if (feature === 'wellness' && !park.features.wellness) return false;
        if (feature === 'restaurant' && !park.features.restaurant) return false;
      }

      // 3. Location filters (OR logic - match ANY selected location)
      if (filterState.locations.length > 0) {
        const matchesLocation = filterState.locations.some((loc) => {
          if (loc === 'nearSea') return park.location.nearSea;
          if (loc === 'forest') return park.location.forest;
          if (loc === 'nearLake') return park.location.nearLake;
          return false;
        });
        if (!matchesLocation) return false;
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
