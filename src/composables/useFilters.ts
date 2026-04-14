import { reactive, computed } from 'vue';
import type { FilterState, FilterChip, FilterValue } from '../types/Park';

// Shared state (singleton) - created once, shared by all components
const filterState = reactive<FilterState>({
  countries: {},
  features: {},
  locations: {},
  showVisitedOnly: false,
  showUnvisitedOnly: false,
  showPromotionsOnly: false,
});

export function useFilters() {

  // Computed: active filter chips for display (only show non-'any' filters)
  const activeFilters = computed(() => {
    const chips: FilterChip[] = [];

    Object.entries(filterState.countries).forEach(([country, filterValue]) => {
      if (filterValue !== 'any') {
        chips.push({
          label: country,
          key: 'countries',
          value: country,
          filterValue
        });
      }
    });

    Object.entries(filterState.features).forEach(([feature, filterValue]) => {
      if (filterValue !== 'any') {
        chips.push({
          label: formatFilterLabel(feature),
          key: 'features',
          value: feature,
          filterValue
        });
      }
    });

    Object.entries(filterState.locations).forEach(([location, filterValue]) => {
      if (filterValue !== 'any') {
        chips.push({
          label: formatFilterLabel(location),
          key: 'locations',
          value: location,
          filterValue
        });
      }
    });

    if (filterState.showVisitedOnly) {
      chips.push({
        label: 'Visited',
        key: 'special',
        value: 'visited',
        filterValue: 'must'
      });
    }

    if (filterState.showUnvisitedOnly) {
      chips.push({
        label: 'Not Visited',
        key: 'special',
        value: 'unvisited',
        filterValue: 'must'
      });
    }

    if (filterState.showPromotionsOnly) {
      chips.push({
        label: 'Promotions',
        key: 'special',
        value: 'promotions',
        filterValue: 'must'
      });
    }

    return chips;
  });

  const setFilter = (
    category: 'countries' | 'features' | 'locations',
    value: string,
    filterValue: FilterValue
  ) => {
    if (filterValue === 'any') {
      delete filterState[category][value];
    } else {
      filterState[category][value] = filterValue;
    }
  };

  const getFilter = (
    category: 'countries' | 'features' | 'locations',
    value: string
  ): FilterValue => {
    return filterState[category][value] || 'any';
  };

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
    }
  };

  const clearAll = () => {
    filterState.countries = {};
    filterState.features = {};
    filterState.locations = {};
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
      const category = chip.key as 'countries' | 'features' | 'locations';
      delete filterState[category][chip.value];
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
    setFilter,
    getFilter,
    toggleFilter,
    clearAll,
    removeChip,
  };
}
