# Landal Parks Map - Design Document

**Project:** Vue app for visualizing and filtering Landal vacation parks  
**Timeline:** 24-hour hackathon  
**Date:** 2026-04-14

---

## Understanding Summary

### What is Being Built
A Vue 3 web application that displays ~100 Landal vacation parks across Europe on an interactive Google Map with real-time filtering, user booking history integration, and promotion indicators.

### Why It Exists
To provide users with a visual overview and exploration tool for discovering and planning Landal park visits.

### Who It's For
- **Primary users:** Both existing Landal customers (with login/booking history) AND potential new customers (browsing without login)
- **Auth level:** Login and booking history are optional progressive enhancements

### Key Constraints
- **Timeline:** 24-hour hackathon (single day)
- **Scope:** ~100 parks with moderate detail, 14 filters, responsive design
- **Tech stack:** Vue 3 + Composition API + TypeScript, Google Maps, Vite, scoped CSS
- **Data:** Mock/hardcoded data (JSON file generated from real Landal API + enhanced with mock attributes)

### Explicit Non-Goals
- Real API integration (beyond initial data fetch)
- Complex authentication (just mock login)
- Price/rating filters (keeping scope realistic)
- Comprehensive testing (no unit/e2e tests)
- Full WCAG accessibility compliance
- Offline support

---

## Assumptions

1. **Google Maps API key** will be set up (with help/documentation)
2. **Mock data** will be generated from real Landal API + enhanced attributes
3. **Browser support** limited to modern browsers (latest Chrome, Firefox, Safari, Edge)
4. **Internet connection** required (Google Maps dependency)
5. **Performance** target is < 5s initial load (demo quality)
6. **Deployment** to Vercel/Netlify/GitHub Pages
7. **Login persistence** uses localStorage (simple implementation)
8. **Filter updates** happen in real-time without debouncing
9. **100 parks** distributed across 7 European countries (NL, DE, BE, DK, AT, CH, UK)
10. **Moderate TypeScript strictness** for balanced development speed
11. **Basic accessibility** includes semantic HTML, contrast, keyboard nav, `prefers-reduced-motion`
12. **Security** not a concern (all mock data, fake logins)

---

## Architecture

### Overall Structure

```
src/
├── components/
│   ├── AppHeader.vue          # Logo, login/logout, user indicator
│   ├── MapView.vue            # Google Maps integration, markers
│   ├── FilterSidebar.vue      # Filter UI, active chips, result count
│   ├── SidePanel.vue          # Park details when marker clicked
│   ├── MarkerLegend.vue       # Collapsible legend explaining markers
│   └── LoginModal.vue         # Simple email/password login
├── composables/
│   ├── useParks.ts            # Park data, filtering logic
│   ├── useFilters.ts          # Filter state, active filters
│   ├── useAuth.ts             # Login state, localStorage
│   └── useMap.ts              # Google Maps instance, markers, clustering
├── data/
│   └── parks.json             # 100 mock parks (generated)
├── types/
│   └── Park.ts                # TypeScript types
├── utils/
│   └── mapIcons.ts            # Custom marker icons
├── scripts/
│   └── generateParks.ts       # Data generation script
└── App.vue                    # Layout orchestration
```

### Data Flow

```
User Input → Filters → Filtered Parks → Map Updates → UI Reflects Changes
```

1. App.vue loads → `useParks()` fetches parks.json
2. User applies filters → `useFilters()` updates state
3. `useParks()` reactively filters parks based on active filters
4. MapView receives filtered parks → updates markers/clusters
5. User clicks marker → opens SidePanel with park details
6. User logs in → `useAuth()` updates state → `useParks()` adds visited data

---

## Data Model

### TypeScript Types

```typescript
// types/Park.ts
type Park = {
  id: string;
  name: string;
  country: string;
  region: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
  imageUrl: string;
  
  features: {
    indoorPool: boolean;
    swimmingParadise: boolean;
    petsAllowed: boolean;
    luxury: boolean;
    childFriendly: boolean;
    wellness: boolean;
    restaurant: boolean;
  };
  
  location: {
    nearSea: boolean;
    forest: boolean;
    nearLake: boolean;
  };
  
  promotion?: {
    active: boolean;
    text: string;
  };
};

type User = {
  email: string;
  name: string;
  visitedParkIds: string[];
};

type FilterState = {
  countries: string[];
  features: string[];
  locations: string[];
  showVisitedOnly: boolean;
  showUnvisitedOnly: boolean;
  showPromotionsOnly: boolean;
};
```

---

## Composables

### `useParks()`

**Responsibility:** Park data and filtering

```typescript
export function useParks() {
  const allParks = ref<Park[]>([]);
  const loading = ref(true);
  const { user } = useAuth();
  const { filterState } = useFilters();
  
  // Load parks.json on mount
  onMounted(async () => {
    try {
      const data = await import('@/data/parks.json');
      allParks.value = data.default;
      loading.value = false;
    } catch (error) {
      console.error('Failed to load parks:', error);
    }
  });
  
  // Computed: apply all active filters
  const filteredParks = computed(() => {
    return allParks.value.filter(park => {
      // Country filter (OR logic)
      if (filterState.countries.length > 0) {
        if (!filterState.countries.includes(park.country)) return false;
      }
      
      // Feature filters (AND logic)
      for (const feature of filterState.features) {
        if (feature === 'indoorPool' && !park.features.indoorPool) return false;
        if (feature === 'petsAllowed' && !park.features.petsAllowed) return false;
        if (feature === 'luxury' && !park.features.luxury) return false;
        if (feature === 'swimmingParadise' && !park.features.swimmingParadise) return false;
        if (feature === 'childFriendly' && !park.features.childFriendly) return false;
        if (feature === 'wellness' && !park.features.wellness) return false;
        if (feature === 'restaurant' && !park.features.restaurant) return false;
      }
      
      // Location filters (OR logic)
      if (filterState.locations.length > 0) {
        const matchesLocation = filterState.locations.some(loc => {
          if (loc === 'nearSea') return park.location.nearSea;
          if (loc === 'forest') return park.location.forest;
          if (loc === 'nearLake') return park.location.nearLake;
          return false;
        });
        if (!matchesLocation) return false;
      }
      
      // Visited filter
      const isVisited = user.value?.visitedParkIds.includes(park.id);
      if (filterState.showVisitedOnly && !isVisited) return false;
      if (filterState.showUnvisitedOnly && isVisited) return false;
      
      // Promotion filter
      if (filterState.showPromotionsOnly && !park.promotion?.active) return false;
      
      return true;
    });
  });
  
  return { allParks, filteredParks, loading };
}
```

### `useFilters()`

**Responsibility:** Filter state management

```typescript
export function useFilters() {
  const filterState = reactive<FilterState>({
    countries: [],
    features: [],
    locations: [],
    showVisitedOnly: false,
    showUnvisitedOnly: false,
    showPromotionsOnly: false,
  });
  
  // Computed: active filter chips for display
  const activeFilters = computed(() => {
    const chips: Array<{ label: string; key: string; value: string }> = [];
    
    filterState.countries.forEach(c => 
      chips.push({ label: c, key: 'countries', value: c }));
    
    filterState.features.forEach(f => 
      chips.push({ label: f, key: 'features', value: f }));
    
    filterState.locations.forEach(l => 
      chips.push({ label: l, key: 'locations', value: l }));
    
    if (filterState.showVisitedOnly) 
      chips.push({ label: 'Visited', key: 'special', value: 'visited' });
    
    if (filterState.showUnvisitedOnly) 
      chips.push({ label: 'Not Visited', key: 'special', value: 'unvisited' });
    
    if (filterState.showPromotionsOnly) 
      chips.push({ label: 'Promotions', key: 'special', value: 'promotions' });
    
    return chips;
  });
  
  const toggleFilter = (category: keyof FilterState, value: string) => {
    const arr = filterState[category] as string[];
    const index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    } else {
      arr.push(value);
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
  
  const removeChip = (chip: { key: string; value: string }) => {
    if (chip.key === 'special') {
      if (chip.value === 'visited') filterState.showVisitedOnly = false;
      if (chip.value === 'unvisited') filterState.showUnvisitedOnly = false;
      if (chip.value === 'promotions') filterState.showPromotionsOnly = false;
    } else {
      const arr = filterState[chip.key as keyof FilterState] as string[];
      const index = arr.indexOf(chip.value);
      if (index > -1) arr.splice(index, 1);
    }
  };
  
  return { 
    filterState, 
    activeFilters, 
    toggleFilter, 
    clearAll, 
    removeChip 
  };
}
```

### `useAuth()`

**Responsibility:** Authentication and persistence

```typescript
const STORAGE_KEY = 'landal_auth';

// Mock users database
const MOCK_USERS: User[] = [
  {
    email: 'demo@landal.com',
    name: 'Demo User',
    visitedParkIds: ['park-1', 'park-5', 'park-12', 'park-23', 'park-34'],
  },
  {
    email: 'test@landal.com',
    name: 'Test User',
    visitedParkIds: ['park-2', 'park-8', 'park-15', 'park-28'],
  },
];

export function useAuth() {
  const user = ref<User | null>(null);
  const isAuthenticated = computed(() => user.value !== null);
  
  // Restore from localStorage on mount
  onMounted(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        user.value = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to restore auth', e);
      localStorage.removeItem(STORAGE_KEY);
    }
  });
  
  const login = (email: string, password: string): boolean => {
    const found = MOCK_USERS.find(u => u.email === email);
    if (found) {
      user.value = found;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
      return true;
    }
    return false;
  };
  
  const logout = () => {
    user.value = null;
    localStorage.removeItem(STORAGE_KEY);
  };
  
  return { user, isAuthenticated, login, logout };
}
```

### `useMap()`

**Responsibility:** Google Maps integration

```typescript
export function useMap(mapElementRef: Ref<HTMLElement | null>) {
  const map = ref<google.maps.Map | null>(null);
  const markers = ref<google.maps.Marker[]>([]);
  const markerClusterer = ref<MarkerClusterer | null>(null);
  
  // Initialize map
  const initMap = () => {
    if (!mapElementRef.value || !window.google) return;
    
    map.value = new google.maps.Map(mapElementRef.value, {
      zoom: 5,
      center: { lat: 51.0, lng: 10.0 }, // Center of Europe
      mapTypeControl: false,
      fullscreenControl: true,
      streetViewControl: false,
    });
  };
  
  // Update markers based on filtered parks
  const updateMarkers = (
    parks: Park[], 
    visitedParkIds: string[], 
    onMarkerClick: (park: Park) => void
  ) => {
    if (!map.value) return;
    
    // Clear existing markers
    markers.value.forEach(m => m.setMap(null));
    markers.value = [];
    
    // Clear existing clusterer
    if (markerClusterer.value) {
      markerClusterer.value.clearMarkers();
    }
    
    // Create new markers
    parks.forEach(park => {
      const isVisited = visitedParkIds.includes(park.id);
      const hasPromotion = park.promotion?.active || false;
      
      const marker = new google.maps.Marker({
        position: park.coordinates,
        map: map.value,
        icon: getMarkerIcon(isVisited, hasPromotion),
        title: park.name,
      });
      
      marker.addListener('click', () => onMarkerClick(park));
      
      markers.value.push(marker);
    });
    
    // Update clustering
    updateClustering();
    
    // Fit bounds to show all markers
    fitBounds();
  };
  
  const updateClustering = () => {
    if (!map.value) return;
    
    if (markerClusterer.value) {
      markerClusterer.value.clearMarkers();
    }
    
    markerClusterer.value = new MarkerClusterer({
      map: map.value,
      markers: markers.value,
    });
  };
  
  const fitBounds = () => {
    if (!map.value || markers.value.length === 0) return;
    
    const bounds = new google.maps.LatLngBounds();
    markers.value.forEach(marker => {
      const pos = marker.getPosition();
      if (pos) bounds.extend(pos);
    });
    
    map.value.fitBounds(bounds);
  };
  
  return { map, initMap, updateMarkers, fitBounds };
}
```

---

## Components

### `App.vue`

**Responsibility:** Layout orchestration

```vue
<template>
  <div class="app">
    <AppHeader />
    <div class="main-content" :class="{ 'panel-open': selectedPark }">
      <FilterSidebar 
        v-if="!isMobile || showFilters"
        @close="showFilters = false"
      />
      <MapView 
        @marker-click="handleMarkerClick"
        @open-filters="showFilters = true"
      />
      <SidePanel 
        v-if="selectedPark"
        :park="selectedPark"
        @close="selectedPark = null"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMediaQuery } from '@vueuse/core';

const selectedPark = ref<Park | null>(null);
const showFilters = ref(false);
const isMobile = useMediaQuery('(max-width: 767px)');

const handleMarkerClick = (park: Park) => {
  selectedPark.value = park;
  if (isMobile.value) {
    showFilters.value = false; // Close filters when opening park on mobile
  }
};
</script>
```

### `AppHeader.vue`

**Responsibility:** Logo, login/logout, user indicator

- Logo/app name on left
- Login/logout button on right
- Shows user name when authenticated
- Responsive (stacks on mobile)

### `FilterSidebar.vue`

**Responsibility:** Filter UI

- Consumes `useFilters()` and `useParks()`
- Displays result count at top
- Shows active filter chips with remove buttons
- "Clear all filters" button
- Filter sections:
  - Countries (checkboxes)
  - Features (checkboxes)
  - Locations (checkboxes)
  - Special filters (visited/unvisited/promotions toggles)
- Desktop: always visible sidebar (280px)
- Mobile: drawer that slides from left

### `MapView.vue`

**Responsibility:** Google Maps rendering

- Consumes `useMap()` and `useParks()`
- Renders Google Maps in a div
- Watches `filteredParks` - updates markers when filters change
- Emits marker click events to parent
- Includes `MarkerLegend` component
- Mobile: shows floating "Filters" button

### `SidePanel.vue`

**Responsibility:** Park details display

- Receives `park` prop
- Displays:
  - Park image
  - Park name
  - Location (country, region)
  - Description
  - Amenities list with icons
  - Promotion badge/text (if applicable)
  - Visited badge (if applicable)
- Close button (X)
- Desktop: fixed right panel (400px)
- Mobile: bottom drawer (60vh height, map still visible)

### `MarkerLegend.vue`

**Responsibility:** Explain marker colors

- Collapsible box in map corner
- Shows:
  - Blue marker = Not visited
  - Green marker = Visited
  - Badge icon = Promotion
- Toggle button to show/hide

### `LoginModal.vue`

**Responsibility:** Simple authentication UI

- Modal/dialog with:
  - Email input
  - Password input (mock, not validated)
  - Login button
  - Error message (if login fails)
  - Close button
- Calls `useAuth().login()`

---

## Google Maps Integration

### Custom Marker Icons

```typescript
// utils/mapIcons.ts
export function getMarkerIcon(
  isVisited: boolean, 
  hasPromotion: boolean
): google.maps.Icon {
  
  const baseColor = isVisited ? '#10b981' : '#3b82f6'; // green : blue
  
  return {
    url: createMarkerSVG(baseColor, hasPromotion),
    scaledSize: new google.maps.Size(
      hasPromotion ? 40 : 32, 
      hasPromotion ? 40 : 32
    ),
  };
}

function createMarkerSVG(color: string, withBadge: boolean): string {
  // SVG marker with optional promotion badge in corner
  const badgeIcon = withBadge 
    ? `<circle cx="30" cy="10" r="8" fill="#f59e0b"/>
       <text x="30" y="14" text-anchor="middle" font-size="10" fill="white">%</text>`
    : '';
  
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <!-- Main marker pin -->
      <path d="M20 5 C12 5 5 12 5 20 C5 28 20 38 20 38 S35 28 35 20 C35 12 28 5 20 5 Z" 
            fill="${color}" stroke="white" stroke-width="2"/>
      ${badgeIcon}
    </svg>
  `)}`;
}
```

### Marker Clustering

- Use `@googlemaps/markerclusterer` library
- Default clustering algorithm
- Standard Google Maps behavior (zoom on click)
- Cluster icons show count

---

## Responsive Layout

### Desktop (≥1024px)

```css
.main-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  height: calc(100vh - 64px); /* minus header */
}

.main-content.panel-open {
  grid-template-columns: 280px 1fr 400px;
}

.filter-sidebar {
  /* Always visible */
}

.side-panel {
  /* Fixed right panel */
}
```

### Tablet (768px - 1023px)

```css
.main-content {
  display: grid;
  grid-template-columns: 240px 1fr;
}

.side-panel {
  position: fixed;
  right: 0;
  width: 400px;
  /* Overlays map */
}
```

### Mobile (<768px)

```css
.main-content {
  display: block;
}

.filter-sidebar {
  position: fixed;
  left: 0;
  width: 80vw;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.filter-sidebar.open {
  transform: translateX(0);
}

.side-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60vh;
  /* Bottom drawer */
}

.floating-filter-button {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 100;
}
```

---

## Mock Data Generation

### Data Source

Fetch real park data from Landal API:

```
https://www.landal.nl/?scController=MapComponent&scAction=GetMarkers&searchType=1&
travelGroup%5B0%5D%5BId%5D=18-120&travelGroup%5B0%5D%5BAmount%5D=0&
travelGroup%5B1%5D%5BId%5D=3-17&travelGroup%5B1%5D%5BAmount%5D=0&
travelGroup%5B2%5D%5BId%5D=0-2&travelGroup%5B2%5D%5BAmount%5D=0&
travelGroup%5B3%5D%5BId%5D=pets&travelGroup%5B3%5D%5BAmount%5D=0&
travelGroupCombiEnabled=false&ShowAllMarkers=true
```

### Generation Script

```typescript
// scripts/generateParks.ts
import fs from 'fs';

const LANDAL_API = '...'; // URL above

async function generateParks() {
  console.log('🔄 Fetching real park data from Landal...');
  
  const response = await fetch(LANDAL_API);
  const realParks = await response.json();
  
  console.log(`✅ Fetched ${realParks.length} parks`);
  console.log('🔄 Enhancing with mock attributes...');
  
  const enhancedParks = realParks.map((park: any, index: number) => ({
    id: `park-${index + 1}`,
    name: park.name,
    country: park.country || deriveCountryFromCoordinates(park.latitude, park.longitude),
    region: park.region || 'Unknown',
    coordinates: {
      lat: park.latitude,
      lng: park.longitude,
    },
    description: generateDescription(park.name),
    imageUrl: `https://picsum.photos/seed/park${index}/800/600`,
    features: generateFeatures(park.name),
    location: generateLocationTypes(park.name, park.latitude, park.longitude),
    promotion: Math.random() < 0.3 ? generatePromotion() : undefined,
  }));
  
  fs.writeFileSync(
    './src/data/parks.json',
    JSON.stringify(enhancedParks, null, 2)
  );
  
  console.log(`✅ Generated ${enhancedParks.length} parks → src/data/parks.json`);
}

function generateFeatures(parkName: string) {
  // Generate realistic features based on park name patterns
  const hasPool = Math.random() < 0.6;
  const hasParadise = parkName.toLowerCase().includes('resort') ? Math.random() < 0.4 : Math.random() < 0.1;
  
  return {
    indoorPool: hasPool,
    swimmingParadise: hasParadise,
    petsAllowed: Math.random() < 0.5,
    luxury: Math.random() < 0.3,
    childFriendly: Math.random() < 0.7,
    wellness: Math.random() < 0.4,
    restaurant: Math.random() < 0.6,
  };
}

function generateLocationTypes(name: string, lat: number, lng: number) {
  const lowerName = name.toLowerCase();
  
  return {
    nearSea: lowerName.includes('strand') || lowerName.includes('beach') || lowerName.includes('coast'),
    forest: lowerName.includes('bos') || lowerName.includes('forest') || lowerName.includes('wood'),
    nearLake: lowerName.includes('meer') || lowerName.includes('lake') || lowerName.includes('see'),
  };
}

function generateDescription(parkName: string): string {
  const templates = [
    `Welcome to ${parkName}, a beautiful vacation park perfect for families and nature lovers.`,
    `${parkName} offers a unique blend of comfort and outdoor adventure.`,
    `Discover ${parkName}, where relaxation meets recreation.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generatePromotion() {
  const promotions = [
    '20% off spring bookings',
    'Summer special: 3 nights for the price of 2',
    'Early bird discount: book now and save',
    'Weekend special offer',
    'Last minute deal',
  ];
  
  return {
    active: true,
    text: promotions[Math.floor(Math.random() * promotions.length)],
  };
}

function deriveCountryFromCoordinates(lat: number, lng: number): string {
  // Simple heuristic based on coordinate ranges
  if (lat > 51 && lng < 8) return 'Netherlands';
  if (lng > 8 && lng < 15) return 'Germany';
  if (lat < 51 && lng < 6) return 'Belgium';
  // Add more rules as needed
  return 'Unknown';
}

generateParks().catch(console.error);
```

**Run with:** `tsx scripts/generateParks.ts`

---

## State Persistence

### What Gets Persisted

- ✅ **Login state** (user object) → localStorage
- ❌ **Filter selections** → reset on refresh
- ❌ **Map position/zoom** → reset on refresh
- ❌ **Selected park** → reset on refresh

### Implementation

Already covered in `useAuth()` composable.

---

## Error Handling

### Minimal Error Handling (Demo Quality)

All errors are logged to console:

1. **Failed to load parks.json** → console.error, loading state persists
2. **Google Maps fails to load** → console.error, map div stays empty
3. **Invalid localStorage data** → console.error, clear corrupted data
4. **Login fails** → Show error message in LoginModal

### Edge Cases

1. **No parks match filters** → Show empty state message in map area
2. **User clicks marker while side panel open** → Replace current park
3. **User logs out while viewing visited parks** → Filters reset
4. **Mobile: Both drawers open** → Side panel takes priority, filter drawer closes

---

## Accessibility

### Basic Accessibility Features

- **Semantic HTML:** Proper `<button>`, `<nav>`, `<main>`, `<header>` usage
- **Color contrast:** 4.5:1 minimum for text
- **Keyboard navigation:** All interactive elements focusable and operable
- **Focus states:** Visible focus indicators on all interactive elements
- **Alt text:** All park images have descriptive alt text
- **Reduced motion:** Respect `prefers-reduced-motion` preference

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Animations & Transitions

### Moderate Animation Level

**Quick wins (CSS transitions):**
- Drawer slide-in/out: `transform 0.3s ease`
- Hover effects: `opacity 0.2s ease`, `transform 0.2s ease`
- Filter chip removal: `opacity 0.2s ease`
- Side panel open/close: `transform 0.3s ease`

**Skip (too time-consuming):**
- Custom map marker animations
- Complex enter/leave animations
- Parallax or decorative effects

---

## Decision Log

### Decision 1: Architecture Pattern
**Decision:** Component-based architecture with multiple components + Composables  
**Alternatives:** Single-component, Library-based wrapper  
**Why:** Clean separation, maintainable, Vue-idiomatic, achievable in 24 hours

### Decision 2: State Management
**Decision:** Composables only (no Pinia/Vuex)  
**Alternatives:** Pinia, Vuex  
**Why:** Sufficient for app scope, less overhead, faster

### Decision 3: Styling Approach
**Decision:** Vue SFC with scoped CSS/SCSS  
**Alternatives:** Tailwind, Component library  
**Why:** User preference, full control, no learning curve

### Decision 4: Filter Scope
**Decision:** 14 core filters (skip price/rating)  
**Alternatives:** All Landal filters, minimal subset  
**Why:** Realistic for 24 hours, demonstrates variety, covers requirements

### Decision 5: Map Technology
**Decision:** Google Maps with direct API  
**Alternatives:** Leaflet, Mapbox, wrapper library  
**Why:** User preference, familiar, full control

### Decision 6: Mock Data Source
**Decision:** Fetch from Landal API + enhance  
**Alternatives:** Fully manual, template duplication  
**Why:** Real data, saves time, authentic

### Decision 7: Filter Behavior
**Decision:** Real-time updates  
**Alternatives:** Apply button, debounced  
**Why:** Interactive UX, Vue reactivity, simpler

### Decision 8: State Persistence
**Decision:** Login only via localStorage  
**Alternatives:** All state, nothing, filters only  
**Why:** Better UX, simple, no stale state issues

### Decision 9: Responsive Strategy
**Decision:** Fully responsive with breakpoints  
**Alternatives:** Desktop-only, mobile-first only  
**Why:** User requirement, professional quality

### Decision 10: Marker Design
**Decision:** Color-coded + badge overlay  
**Alternatives:** Different icons, animations  
**Why:** Clear distinction, user preference, easy to implement

### Decision 11: Side Panel Content
**Decision:** Standard detail level  
**Alternatives:** Minimal, detailed with booking  
**Why:** Demonstrates features, achievable in timeline

### Decision 12: Authentication
**Decision:** Mock login with hardcoded users  
**Alternatives:** No auth, pre-populated, OAuth sim  
**Why:** Realistic demo, tests flows, simple

### Decision 13: Testing
**Decision:** No tests  
**Alternatives:** Unit tests, e2e tests  
**Why:** 24-hour constraint, demo quality acceptable

### Decision 14: TypeScript Config
**Decision:** Moderate strictness  
**Alternatives:** Strict, relaxed  
**Why:** Balance of safety and speed

### Decision 15: Accessibility
**Decision:** Basic (semantic, contrast, keyboard, reduced-motion)  
**Alternatives:** Full WCAG, minimal  
**Why:** Quick wins, professional polish, appropriate for timeline

---

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Google Maps API key

### Initial Setup

```bash
# Create Vue 3 + TypeScript project
npm create vite@latest landal-parks-map -- --template vue-ts
cd landal-parks-map

# Install dependencies
npm install

# Install additional packages
npm install @googlemaps/markerclusterer
npm install @vueuse/core
npm install -D tsx

# Generate mock data
npm run generate-parks

# Create .env file with Google Maps API key
echo "VITE_GOOGLE_MAPS_API_KEY=your_api_key_here" > .env.local

# Start dev server
npm run dev
```

### Google Maps API Key Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable "Maps JavaScript API"
4. Create credentials → API Key
5. (Optional) Restrict key to your domain
6. Add to `.env.local`

---

## Implementation Order (Suggested)

For 24-hour timeline:

1. **Setup** (30 min)
   - Project scaffold
   - Install dependencies
   - Google Maps API key

2. **Data generation** (1 hour)
   - Write generateParks script
   - Run and verify parks.json

3. **Types & Composables** (2 hours)
   - Define TypeScript types
   - Implement useParks, useFilters, useAuth, useMap

4. **Core Components** (4 hours)
   - App.vue layout
   - MapView with basic Google Maps
   - FilterSidebar structure
   - SidePanel structure

5. **Google Maps Integration** (2 hours)
   - Custom marker icons
   - Clustering
   - Marker click handlers

6. **Filter Logic** (2 hours)
   - Connect filters to useFilters
   - Wire up real-time updates
   - Active filter chips

7. **Authentication** (1 hour)
   - LoginModal
   - useAuth integration
   - Visited park indicators

8. **Responsive Design** (3 hours)
   - Mobile layout
   - Tablet layout
   - Filter drawer on mobile
   - Side panel drawer

9. **Polish** (2 hours)
   - Styling and CSS
   - Animations
   - Legend
   - Empty states

10. **Testing & Deployment** (1.5 hours)
    - Manual testing
    - Fix bugs
    - Deploy to Vercel/Netlify

**Total: ~19 hours** (leaves 5 hours buffer)

---

## Future Enhancements (Post-Hackathon)

If time permits or for future iterations:

- Price tier and rating filters
- Search by park name
- Save favorite parks
- Share filtered map via URL
- Park comparison view
- More detailed park information
- Real booking integration
- User reviews/ratings
- Advanced map layers (terrain, satellite)
- Export filtered results

---

## Questions for Implementation

1. Should we use vue-router for any navigation, or keep it single-page?
2. Do you want any analytics tracking (e.g., filter usage)?
3. Should the app have a favicon and meta tags for sharing?

---

**Document Status:** Complete and ready for implementation  
**Next Step:** Begin implementation following suggested order
