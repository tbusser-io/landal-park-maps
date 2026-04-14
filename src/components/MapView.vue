<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { GoogleMap, Marker, MarkerCluster } from 'vue3-google-map';
import { useParks } from '../composables/useParks';
import { useAuth } from '../composables/useAuth';
import type { Park } from '../types/Park';
import MarkerLegend from './MarkerLegend.vue';

const props = defineProps<{
  selectedPark?: Park | null;
}>();

const emit = defineEmits<{
  markerClick: [park: Park];
  openFilters: [];
}>();

const { filteredParks, loading } = useParks();
const { user } = useAuth();

const mapCenter = { lat: 51.0, lng: 10.0 }; // Center of Europe
const mapRef = ref<InstanceType<typeof GoogleMap> | null>(null);
const mapReady = ref(false); // Track when map bounds are properly set

// Map options to hide controls
const mapOptions = {
  mapTypeControl: false,
  mapTypeId: 'roadmap',
  streetViewControl: false,
  fullscreenControl: false,
  zoomControl: true,
  gestureHandling: 'greedy',
};

// Track if this is the first bounds fit
const isFirstBoundsFit = ref(true);

// Function to fit map bounds with proper padding
const fitMapBounds = async (parks: Park[]) => {
  if (parks.length === 0 || !mapRef.value) {
    return;
  }

  try {
    // Wait for the map instance to be ready
    const mapInstance = await mapRef.value.map;
    if (!mapInstance) return;

    // Use longer delay on first load to ensure map is fully initialized
    const delay = isFirstBoundsFit.value ? 500 : 100;

    // Small delay to ensure markers are rendered
    setTimeout(() => {
      const bounds = new google.maps.LatLngBounds();
      parks.forEach((park) => {
        bounds.extend(park.coordinates);
      });

      // Add padding to account for overlays on desktop
      // Left: 300px (filter sidebar + margins)
      // Right: 420px if side panel open, 20px otherwise
      // Top/Bottom: 20px
      const isMobile = window.innerWidth <= 767;
      const padding = isMobile
        ? { top: 20, right: 20, bottom: 100, left: 20 } // Mobile padding
        : {
            top: 20,
            right: props.selectedPark ? 420 : 20,
            bottom: 20,
            left: 300
          };

      mapInstance.fitBounds(bounds, padding);

      // Mark map as ready after first successful bounds fit
      if (isFirstBoundsFit.value) {
        isFirstBoundsFit.value = false;
        mapReady.value = true;
      }
    }, delay);
  } catch (error) {
    console.error('Error fitting bounds:', error);
  }
};

// Watch for changes in filtered parks and adjust bounds
watch(filteredParks, (parks) => {
  fitMapBounds(parks);
}, { immediate: true });

// Watch for changes in selected park to center map on the marker
watch(() => props.selectedPark, async (park) => {
  if (!park || !mapRef.value) return;

  try {
    const mapInstance = await mapRef.value.map;
    if (!mapInstance) return;

    // Pan to center the selected marker
    mapInstance.panTo(park.coordinates);
  } catch (error) {
    console.error('Error panning to marker:', error);
  }
});

// Apply map options after component mounts
onMounted(async () => {
  // Wait a bit for the map to initialize
  setTimeout(async () => {
    if (!mapRef.value) return;

    try {
      const mapInstance = await mapRef.value.map;
      if (mapInstance) {
        // Force hide map type control
        mapInstance.setOptions({
          mapTypeControl: false,
          mapTypeId: 'roadmap',
          streetViewControl: false,
          fullscreenControl: false,
        });

        // Explicitly fit bounds after map is ready
        fitMapBounds(filteredParks.value);
      }
    } catch (error) {
      console.error('Error setting map options:', error);
    }
  }, 500);
});

const getMarkerIcon = (park: Park) => {
  const isVisited = user.value?.visitedParkIds.includes(park.id) || false;
  const hasPromotion = park.promotion?.active || false;
  const isSelected = props.selectedPark?.id === park.id;

  // Landal brand colors
  let backgroundColor: string;
  let symbolColor: string;

  if (isSelected) {
    // Selected state - use brand-color-active
    backgroundColor = '#007f88';
    symbolColor = '#FFFFFF';
  } else if (isVisited) {
    // Visited state
    backgroundColor = '#3dae2b';
    symbolColor = '#FFFFFF';
  } else {
    // Unvisited state
    backgroundColor = '#FFFAE9';
    symbolColor = '#0097A2';
  }

  const baseSize = 32; // Base size in pixels
  const size = hasPromotion ? 38 : 32;
  const scale = hasPromotion ? 1.15 : 1;

  const promotionBadge = hasPromotion
    ? `<circle cx="44" cy="12" r="9" fill="#f5a800" stroke="white" stroke-width="2"/>
       <text x="44" y="16.5" text-anchor="middle" font-size="11" fill="white" font-weight="bold">%</text>`
    : '';

  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}px" height="${size * 1.23}px" viewBox="0 0 52 64" version="1.1">
      <defs>
        <path d="M18.9992078,0 C8.52355206,0 0,8.25794171 0,18.4081791 C0,21.0557557 0.559328395,23.5835926 1.66161202,25.9220976 C6.41194212,35.9930203 15.5196464,46.6257983 18.1985072,49.644363 C18.3992105,49.8700262 18.6918148,50 18.9997359,50 C19.307657,50 19.6002613,49.8700262 19.8009646,49.644363 C22.4787691,46.62631 31.5864734,35.9940437 36.338388,25.9220976 C37.4411998,23.5835926 38,21.0557557 38,18.4081791 C37.9989437,8.25794171 29.4753916,0 18.9992078,0 Z" id="path-1"/>
        <filter x="-30.3%" y="-19.0%" width="160.5%" height="146.0%" filterUnits="objectBoundingBox" id="filter-2">
          <feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1"/>
          <feGaussianBlur stdDeviation="3.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"/>
          <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.202275815 0" type="matrix" in="shadowBlurOuter1"/>
        </filter>
      </defs>
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g transform="translate(7.000000, 5.000000)">
          <g>
            <g id="Path">
              <use fill="black" fill-opacity="1" filter="url(#filter-2)" xlink:href="#path-1"/>
              <use fill="${backgroundColor}" fill-rule="evenodd" xlink:href="#path-1"/>
            </g>
            <path d="M17.2371228,14.1815839 C17.2371228,13.1135027 16.4008162,12.2476412 15.3688569,12.2476412 C15.1869636,12.2476412 15.0114466,12.2747428 14.8449907,12.325124 C14.8473399,12.2945478 14.8490179,12.2636242 14.8490179,12.2323531 C14.8490179,11.6131857 14.3640809,11.1111111 13.7660479,11.1111111 C13.1680148,11.1111111 12.6830778,11.6131857 12.6830778,12.2323531 C12.6830778,12.2636242 12.6847558,12.2945478 12.687105,12.325124 C12.5209847,12.2747428 12.3451321,12.2476412 12.1632388,12.2476412 C11.1316151,12.2476412 10.2953085,13.1135027 10.2953085,14.1815839 C10.2953085,14.368168 10.3211494,14.5484979 10.3688041,14.719099 C9.54961299,14.9240983 8.94117647,15.6874602 8.94117647,16.598491 C8.94117647,17.4984032 9.53451114,18.2544685 10.3386004,18.4705864 C10.3104103,18.6040097 10.2949729,18.7426448 10.2949729,18.8847545 C10.2949729,19.9528357 11.1312795,20.8186972 12.1632388,20.8186972 C12.4397703,20.8186972 12.7025424,20.7565025 12.9388024,20.6446215 L12.9388024,27.7695851 L14.5929577,27.7695851 L14.5929577,24.0688049 L14.5929577,22.59142 L14.5929577,20.6446215 C14.8292177,20.7565025 15.0919898,20.8186972 15.3688569,20.8186972 C16.4004807,20.8186972 17.2371228,19.9528357 17.2371228,18.8847545 C17.2371228,18.7426448 17.2216854,18.6040097 17.1934953,18.4705864 C17.997249,18.2544685 18.5909192,17.4984032 18.5909192,16.598491 C18.5909192,15.6874602 17.9824827,14.9240983 17.1632916,14.719099 C17.2109463,14.5484979 17.2371228,14.368168 17.2371228,14.1815839 Z" fill="${symbolColor}"/>
            <path d="M26.7097042,17.8069446 L26.7097042,13.4950099 C26.7097042,13.3963323 26.6791649,13.3153749 26.6177507,13.2517904 C26.5566721,13.1885533 26.4781426,13.1569348 26.3828331,13.1569348 L24.4236206,13.1569348 C24.3279756,13.1569348 24.2497816,13.1885533 24.188703,13.2517904 C24.1276244,13.3153749 24.0967495,13.3963323 24.0967495,13.4950099 L24.0967495,15.5561216 L21.6066233,13.4001543 C21.3888211,13.2173922 21.1300762,13.1253162 20.8310597,13.1253162 C20.5310364,13.1253162 20.2729626,13.2173922 20.0551605,13.4001543 L18.4985661,14.7569978 C18.867687,14.9822484 19.2829529,15.6235282 19.2977191,16.2558989 L20.8303885,14.9324373 L27.8940243,21.0302981 C27.948391,21.079637 28.019873,21.1043064 28.1081349,21.1043064 C28.2272717,21.0904081 28.2984182,21.0511455 28.353456,20.987561 L28.9863911,20.2054365 C29.0404221,20.1352503 29.0649207,20.0522082 29.0575375,19.9573526 C29.0508256,19.8621495 29.0129032,19.7867515 28.9447771,19.7304635 L26.7097042,17.8069446 Z" fill="${symbolColor}"/>
            <path d="M20.790184,15.9424585 L19.1595204,17.334369 C18.9678948,18.0153837 18.5168531,18.5921614 17.908081,18.9243298 C17.887274,20.355503 16.7563137,21.5135753 15.368622,21.5135753 C15.3337199,21.5135753 15.2988179,21.5128804 15.2642515,21.5114906 L15.2642515,27.7777778 L19.4572193,27.7777778 L19.4572193,23.1454141 L22.2005348,23.1454141 L22.2005348,27.7777778 L26.0167644,27.7777778 C26.1936238,27.7777778 26.3466558,27.7103712 26.4758605,27.5769479 C26.6054008,27.4431772 26.6701709,27.2843896 26.6701709,27.10128 C26.6677099,23.0110827 26.664242,20.961467 26.6597674,20.9524332 L20.790184,15.9424585 Z" fill="${symbolColor}"/>
          </g>
        </g>
        ${promotionBadge}
      </g>
    </svg>
  `;

  return {
    url: `data:image/svg+xml,${encodeURIComponent(svgIcon)}`,
    scaledSize: { width: size * scale, height: (size * 1.23) * scale },
    anchor: { x: (size * scale) / 2, y: (size * 1.23) * scale },
  };
};

const handleMarkerClick = (park: Park) => {
  emit('markerClick', park);
};

// Custom cluster options - use default renderer with brand colors
const clusterOptions = {
  renderer: {
    render: ({ count, position }: any) => {
      // Calculate size based on count (scales with number of markers)
      const baseSize = 40;
      const size = Math.min(baseSize + Math.floor(count / 10) * 5, 70); // Max size of 70px

      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}px" height="${size}px" viewBox="0 0 ${size} ${size}" version="1.1">
          <defs>
            <circle id="cluster-path" cx="${size/2}" cy="${size/2}" r="${size/2 - 6}"/>
            <filter x="-30.3%" y="-25.0%" width="160.5%" height="160.5%" filterUnits="objectBoundingBox" id="cluster-filter">
              <feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1"/>
              <feGaussianBlur stdDeviation="3.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"/>
              <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.202275815 0" type="matrix" in="shadowBlurOuter1"/>
            </filter>
          </defs>
          <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g>
              <use fill="black" fill-opacity="1" filter="url(#cluster-filter)" xlink:href="#cluster-path"/>
              <use fill="#FFFAE9" fill-rule="evenodd" xlink:href="#cluster-path"/>
            </g>
            <text x="${size/2}" y="${size/2 + 6}" text-anchor="middle" font-size="${Math.min(16 + Math.floor(count / 50) * 2, 22)}" font-weight="700" fill="#0097A2" font-family="Inter, arial, sans-serif">${count}</text>
          </g>
        </svg>
      `;

      return new google.maps.Marker({
        position,
        icon: {
          url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
          scaledSize: new google.maps.Size(size, size),
          anchor: new google.maps.Point(size/2, size/2),
        },
        label: undefined,
        zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
      });
    },
  },
};
</script>


<template>
  <div class="map-container">
    <div v-if="loading || !mapReady" class="loading-skeleton">
      <div class="skeleton-pulse"></div>
      <span>Loading parks...</span>
    </div>

    <GoogleMap
      ref="mapRef"
      api-key="AIzaSyBFndI0-S8lHHyfTIzNApFxOLPfFDVBEAM"
      :center="mapCenter"
      :zoom="5"
      :options="mapOptions"
      class="map-element"
      :style="{ visibility: mapReady ? 'visible' : 'hidden' }"
    >
      <MarkerCluster :options="clusterOptions">
        <Marker
          v-for="park in filteredParks"
          :key="park.id"
          :options="{
            position: park.coordinates,
            icon: getMarkerIcon(park),
            title: park.name,
          }"
          @click="handleMarkerClick(park)"
        />
      </MarkerCluster>
    </GoogleMap>

    <MarkerLegend />

    <!-- Mobile filter button -->
    <button class="mobile-filter-button" @click="emit('openFilters')" aria-label="Open filters">
      <span class="filter-icon">⚙</span>
      <span>Filters</span>
    </button>

    <!-- Empty state -->
    <div v-if="!loading && filteredParks.length === 0" class="empty-state">
      <div class="empty-state-content">
        <span class="empty-icon">🔍</span>
        <h3>No parks match your filters</h3>
        <p>Try adjusting your filter criteria to see more results</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f3f4f6;
}

.map-element {
  width: 100%;
  height: 100%;
}

/* Hide Google Maps controls via CSS as fallback */
.map-element :deep(.gm-style-mtc) {
  display: none !important;
}

/* Also hide the map type control button */
.map-element :deep(button[title="Show satellite imagery"]),
.map-element :deep(button[title="Show street map"]) {
  display: none !important;
}

.loading-skeleton {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  z-index: 10;
  gap: 16px;
}

.skeleton-pulse {
  width: 60px;
  height: 60px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-skeleton span {
  font-size: 14px;
  color: #6b7280;
}

.mobile-filter-button {
  display: none;
  position: fixed;
  bottom: 24px;
  left: 24px;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  z-index: 50;
  gap: 8px;
  align-items: center;
  transition: all 0.2s;
}

.mobile-filter-button:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.mobile-filter-button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.filter-icon {
  font-size: 18px;
}

.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  pointer-events: none;
}

.empty-state-content {
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 320px;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.empty-state-content h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.empty-state-content p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

@media (max-width: 767px) {
  .mobile-filter-button {
    display: flex;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-pulse {
    animation: none;
    border-top-color: #e5e7eb;
  }

  .mobile-filter-button {
    transition: none;
  }

  .mobile-filter-button:hover {
    transform: none;
  }
}
</style>
