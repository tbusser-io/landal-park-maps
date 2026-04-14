# Code Review - Landal Parks Map

## Summary
Overall code quality is good with proper Vue 3 Composition API usage. Found several areas for improvement around DRY, documentation, and idiomatic patterns.

---

## 🔴 Critical Issues

### 1. Environment Variable Not Loading
**Location:** `.env.local` not being picked up by Vite

**Issue:** `VITE_GOOGLE_MAPS_API_KEY` from `.env.local` returns `undefined`
- Both `main.ts:8` and `MapView.vue:9` read from env var
- Currently BOTH are necessary because:
  - Global config in main.ts gets `undefined`
  - Component-level prop in MapView.vue also gets `undefined`
  - App currently works because of fallback in main.ts

**Current State:**
```typescript
// main.ts - Has fallback (if implemented)
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'fallback';

// MapView.vue - Needed as backup
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
```

**Proper Fix:** Fix environment variable loading, then choose ONE approach:
- **Option A:** Global only (remove from MapView.vue)
- **Option B:** Component-level only (remove from main.ts)

Typically global configuration is preferred for single API key apps.

**Impact:** Both locations needed until env var loading is fixed

---

## 🟡 Moderate Issues

### 2. Repeated Filter Chip Creation (DRY Violation)
**Location:** `src/composables/useFilters.ts:20-78`

**Issue:** Nearly identical code repeated 3 times for countries, features, locations

**Current:**
```typescript
Object.entries(filterState.countries).forEach(([country, filterValue]) => {
  if (filterValue !== 'any') {
    chips.push({ label: country, key: 'countries', value: country, filterValue });
  }
});
// Repeated for features...
// Repeated for locations...
```

**Suggested Fix:**
```typescript
const createChipsFromCategory = (
  category: 'countries' | 'features' | 'locations',
  formatLabel = (v: string) => v
) => {
  return Object.entries(filterState[category])
    .filter(([, filterValue]) => filterValue !== 'any')
    .map(([value, filterValue]) => ({
      label: formatLabel(value),
      key: category,
      value,
      filterValue
    }));
};

const chips: FilterChip[] = [
  ...createChipsFromCategory('countries'),
  ...createChipsFromCategory('features', formatFilterLabel),
  ...createChipsFromCategory('locations', formatFilterLabel),
];
```

---

### 3. Magic Numbers Throughout Codebase
**Locations:** Multiple files

**Issues:**
- Padding values: `300px`, `420px`, `20px` (MapView.vue:62-73)
- Delays: `500`, `100` (MapView.vue:52)
- Breakpoints: `767px` (multiple files)
- Cluster sizes: `40`, `70`, `10` (MapView.vue:178-179)

**Suggested Fix:** Extract to constants
```typescript
// src/constants/layout.ts
export const LAYOUT = {
  BREAKPOINTS: {
    MOBILE: 767,
    TABLET: 1023,
  },
  SIDEBAR_WIDTH: 300,
  PANEL_WIDTH: 420,
  MAP_PADDING: 20,
  MAP_INIT_DELAY: 500,
  MAP_UPDATE_DELAY: 100,
} as const;

// src/constants/clustering.ts
export const CLUSTER_CONFIG = {
  BASE_SIZE: 40,
  MAX_SIZE: 70,
  SIZE_INCREMENT: 5,
  MARKERS_PER_INCREMENT: 10,
} as const;
```

---

### 4. Missing JSDoc Documentation
**Location:** All composables and complex functions

**Issue:** No function documentation

**Suggested Fix:**
```typescript
/**
 * Composable for managing park filters with tri-state logic
 * 
 * @returns {Object} Filter state and operations
 * @property {FilterState} filterState - Current filter state
 * @property {ComputedRef<FilterChip[]>} activeFilters - Active filter chips for UI
 * @property {Function} setFilter - Set a tri-state filter (must/any/exclude)
 * @property {Function} clearAll - Reset all filters
 * 
 * @example
 * const { filterState, setFilter } = useFilters();
 * setFilter('countries', 'Netherlands', 'must');
 */
export function useFilters() { ... }
```

---

## 🟢 Minor Issues / Improvements

### 5. Type Safety - Any Types
**Location:** `src/components/MapView.vue:209`

**Issue:**
```typescript
render: ({ count, position }: any) => {
```

**Fix:**
```typescript
interface ClusterRenderParams {
  count: number;
  position: google.maps.LatLng | google.maps.LatLngLiteral;
}

render: ({ count, position }: ClusterRenderParams) => {
```

---

### 6. Manual localStorage Pattern
**Location:** `src/composables/useAuth.ts:25-33`

**Issue:** Direct localStorage access without abstraction

**Suggested Fix:** Create useLocalStorage composable
```typescript
// src/composables/useLocalStorage.ts
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const data = ref<T>(defaultValue);
  
  // Load from storage
  try {
    const stored = localStorage.getItem(key);
    if (stored) data.value = JSON.parse(stored);
  } catch (e) {
    console.error(`Failed to load ${key}:`, e);
  }
  
  // Watch and save
  watch(data, (newValue) => {
    try {
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (e) {
      console.error(`Failed to save ${key}:`, e);
    }
  }, { deep: true });
  
  return data;
}

// Usage in useAuth.ts
const user = useLocalStorage<User | null>('landal_auth', null);
```

---

### 7. Hardcoded Breakpoints in JavaScript
**Location:** `MapView.vue:65`, `App.vue:14`

**Issue:**
```typescript
const isMobile = window.innerWidth <= 767;
```

**Fix:** Use @vueuse/core consistently
```typescript
import { useMediaQuery } from '@vueuse/core';
const isMobile = useMediaQuery('(max-width: 767px)');
```

---

### 8. Missing Error Boundaries
**Location:** All components

**Issue:** No error handling UI for failed API loads or runtime errors

**Suggested Fix:** Add ErrorBoundary component
```vue
<!-- src/components/ErrorBoundary.vue -->
<template>
  <slot v-if="!error" />
  <div v-else class="error-boundary">
    <h2>Something went wrong</h2>
    <p>{{ error.message }}</p>
    <button @click="resetError">Try again</button>
  </div>
</template>
```

---

### 9. Inline Comments for Complex Logic
**Location:** `MapView.vue:61-73`, `useFilters.ts:102-113`

**Issue:** Complex logic lacks explanation

**Example:** Tri-state filter toggle logic needs comments:
```typescript
const toggleFilter = (category: string, value: string) => {
  if (category === 'special') {
    if (value === 'visited') {
      // Toggle visited filter
      filterState.showVisitedOnly = !filterState.showVisitedOnly;
      // Mutually exclusive: disable unvisited when visited is enabled
      if (filterState.showVisitedOnly) filterState.showUnvisitedOnly = false;
    }
    // ... similar for other cases
  }
};
```

---

### 10. CSS Variables for Theme Values
**Location:** Multiple style blocks

**Issue:** Some values still hardcoded instead of using CSS variables

**Example:**
```css
/* Current */
border: 1px solid #e5e7eb;

/* Should be */
border: 1px solid var(--site-header-navigation_border-color);
```

---

## 📊 Metrics

- **Total Files Reviewed:** 14
- **Critical Issues:** 1
- **Moderate Issues:** 3  
- **Minor Issues:** 6
- **Documentation Coverage:** ~20% (needs improvement)

---

## ✅ Good Practices Found

1. ✅ Proper use of Vue 3 Composition API
2. ✅ Singleton pattern for shared state (composables)
3. ✅ TypeScript usage throughout
4. ✅ Responsive design with mobile-first approach
5. ✅ Accessibility considerations (aria-labels, keyboard nav)
6. ✅ Loading states and skeleton screens
7. ✅ Git commit messages with co-author attribution

---

## 🎯 Priority Recommendations

1. **High:** Remove API key duplication from MapView.vue
2. **High:** Extract magic numbers to constants
3. **Medium:** Add JSDoc to all exported functions
4. **Medium:** Refactor repeated chip creation logic
5. **Low:** Add useLocalStorage composable
6. **Low:** Add error boundary component

---

## 📝 Documentation Checklist

- [ ] Add JSDoc comments to all composables
- [ ] Document tri-state filter logic
- [ ] Add inline comments for complex algorithms
- [ ] Create ARCHITECTURE.md for high-level design
- [ ] Document environment variable setup
- [ ] Add component prop documentation

---

*Generated: 2026-04-14*
