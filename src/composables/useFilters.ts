import { reactive, computed } from 'vue';
import type { FilterState, FilterChip } from '../types/Park';

// Shared state (singleton) - created once, shared by all components
const filterState = reactive<FilterState>({
  countries: [],
  features: [],
  locations: [],
  showVisitedOnly: false,
  showUnvisitedOnly: false,
  showPromotionsOnly: false,
});

export function useFilters() {

  // Computed: active filter chips for display
  const activeFilters = computed(() => {
    const chips: FilterChip[] = [];

    filterState.countries.forEach((c) =>
      chips.push({ label: c, key: 'countries', value: c })
    );

    filterState.features.forEach((f) =>
      chips.push({ label: formatFilterLabel(f), key: 'features', value: f })
    );

    filterState.locations.forEach((l) =>
      chips.push({ label: formatFilterLabel(l), key: 'locations', value: l })
    );

    if (filterState.showVisitedOnly) {
      chips.push({ label: 'Visited', key: 'special', value: 'visited' });
    }

    if (filterState.showUnvisitedOnly) {
      chips.push({ label: 'Not Visited', key: 'special', value: 'unvisited' });
    }

    if (filterState.showPromotionsOnly) {
      chips.push({ label: 'Promotions', key: 'special', value: 'promotions' });
    }

    return chips;
  });

  const toggleFilter = (category: string, value: string) => {
    if (category === 'special') {
      if (value === 'visited') {
        filterState.showVisitedOnly = !filterState.showVisitedOnly;
        if (filterState.showVisitedOnly) filterState.showUnvisitedOnly = false;
      } else if (value === 'unvisited') {
        filterState.showUnvisitedOnly = !filterState.showUnvisitedOnly;
        if (filterState.showUnvisitedOnly) filterState.showVisitedOnly = false;
      } else if (value === 'promotions') {
        filterState.showPromotionsOnly = !filterState.showPromotionsOnly;
      }
    } else {
      const arr = filterState[category as keyof typeof filterState] as string[];
      const index = arr.indexOf(value);
      if (index > -1) {
        arr.splice(index, 1);
      } else {
        arr.push(value);
      }
    }
  };

  const clearAll = () => {
    filterState.countries = [];
    filterState.features = [];
    filterState.locations = [];
    filterState.showVisitedOnly = false;
    filterState.showUnvisitedOnly = false;
    filterState.showPromotionsOnly = false;
  };

  const removeChip = (chip: FilterChip) => {
    if (chip.key === 'special') {
      if (chip.value === 'visited') filterState.showVisitedOnly = false;
      if (chip.value === 'unvisited') filterState.showUnvisitedOnly = false;
      if (chip.value === 'promotions') filterState.showPromotionsOnly = false;
    } else {
      const arr = filterState[chip.key as keyof typeof filterState] as string[];
      const index = arr.indexOf(chip.value);
      if (index > -1) arr.splice(index, 1);
    }
  };

  const formatFilterLabel = (value: string): string => {
    // Convert camelCase to readable labels
    return value
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return {
    filterState,
    activeFilters,
    toggleFilter,
    clearAll,
    removeChip,
  };
}
