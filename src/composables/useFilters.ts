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
  showFavoritesOnly: false,
});

/**
 * Helper function to create filter chips from a category
 * Reduces code duplication for countries, features, and locations
 */
const createChipsFromCategory = (
  category: 'countries' | 'features' | 'locations',
  formatLabel: (value: string) => string = (v) => v
): FilterChip[] => {
  return Object.entries(filterState[category])
    .filter(([, filterValue]) => filterValue !== 'any')
    .map(([value, filterValue]) => ({
      label: formatLabel(value),
      key: category,
      value,
      filterValue
    }));
};

/**
 * Converts camelCase to readable labels
 * @example formatFilterLabel('indoorPool') => 'Indoor Pool'
 */
const formatFilterLabel = (value: string): string => {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

/**
 * Composable for managing park filters with tri-state logic
 *
 * Provides tri-state filtering (must/any/exclude) for countries, features, and locations,
 * plus boolean filters for special cases (visited, promotions).
 *
 * @returns Filter state and operations
 *
 * @example
 * ```typescript
 * const { filterState, setFilter, activeFilters } = useFilters();
 *
 * // Set a tri-state filter
 * setFilter('countries', 'Netherlands', 'must');
 *
 * // Get active filters for UI display
 * console.log(activeFilters.value); // Array of FilterChip objects
 * ```
 */
export function useFilters() {

  /**
   * Computed property that returns active filter chips for UI display
   * Only includes filters that are not set to 'any' (neutral state)
   */
  const activeFilters = computed(() => {
    const chips: FilterChip[] = [
      ...createChipsFromCategory('countries'),
      ...createChipsFromCategory('features', formatFilterLabel),
      ...createChipsFromCategory('locations', formatFilterLabel),
    ];

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

    if (filterState.showFavoritesOnly) {
      chips.push({
        label: 'Favorites',
        key: 'special',
        value: 'favorites',
        filterValue: 'must'
      });
    }

    return chips;
  });

  /**
   * Sets a tri-state filter value for a given category and key
   *
   * @param category - The filter category (countries, features, or locations)
   * @param value - The specific value to filter (e.g., 'Netherlands', 'indoorPool')
   * @param filterValue - The tri-state value: 'must', 'any', or 'exclude'
   *
   * @example
   * setFilter('countries', 'Netherlands', 'must'); // Show only Netherlands
   * setFilter('features', 'indoorPool', 'exclude'); // Hide parks with indoor pool
   * setFilter('locations', 'nearSea', 'any'); // Remove filter (neutral)
   */
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

  /**
   * Gets the current filter value for a specific category and key
   *
   * @param category - The filter category
   * @param value - The specific value to check
   * @returns The current filter value ('must', 'any', or 'exclude')
   */
  const getFilter = (
    category: 'countries' | 'features' | 'locations',
    value: string
  ): FilterValue => {
    return filterState[category][value] || 'any';
  };

  /**
   * Toggles a special boolean filter (visited, unvisited, promotions, favorites)
   * Note: visited and unvisited are mutually exclusive
   *
   * @param category - Must be 'special' for these filters
   * @param value - One of: 'visited', 'unvisited', 'promotions', 'favorites'
   */
  const toggleFilter = (category: string, value: string) => {
    if (category === 'special') {
      if (value === 'visited') {
        // Toggle visited filter
        filterState.showVisitedOnly = !filterState.showVisitedOnly;
        // Mutually exclusive: disable unvisited when visited is enabled
        if (filterState.showVisitedOnly) filterState.showUnvisitedOnly = false;
      } else if (value === 'unvisited') {
        // Toggle unvisited filter
        filterState.showUnvisitedOnly = !filterState.showUnvisitedOnly;
        // Mutually exclusive: disable visited when unvisited is enabled
        if (filterState.showUnvisitedOnly) filterState.showVisitedOnly = false;
      } else if (value === 'promotions') {
        filterState.showPromotionsOnly = !filterState.showPromotionsOnly;
      } else if (value === 'favorites') {
        filterState.showFavoritesOnly = !filterState.showFavoritesOnly;
      }
    }
  };

  /**
   * Resets all filters to their default state
   */
  const clearAll = () => {
    filterState.countries = {};
    filterState.features = {};
    filterState.locations = {};
    filterState.showVisitedOnly = false;
    filterState.showUnvisitedOnly = false;
    filterState.showPromotionsOnly = false;
    filterState.showFavoritesOnly = false;
  };

  /**
   * Removes a specific filter chip
   *
   * @param chip - The filter chip to remove
   */
  const removeChip = (chip: FilterChip) => {
    if (chip.key === 'special') {
      if (chip.value === 'visited') filterState.showVisitedOnly = false;
      if (chip.value === 'unvisited') filterState.showUnvisitedOnly = false;
      if (chip.value === 'promotions') filterState.showPromotionsOnly = false;
      if (chip.value === 'favorites') filterState.showFavoritesOnly = false;
    } else {
      const category = chip.key as 'countries' | 'features' | 'locations';
      delete filterState[category][chip.value];
    }
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
