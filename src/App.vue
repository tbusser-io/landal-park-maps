<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import type { Park } from './types/Park';
import AppHeader from './components/AppHeader.vue';
import FilterSidebar from './components/FilterSidebar.vue';
import MapView from './components/MapView.vue';
import SidePanel from './components/SidePanel.vue';
import LoginModal from './components/LoginModal.vue';
import { MEDIA_QUERIES } from './constants/layout';

const selectedPark = ref<Park | null>(null);
const showLoginModal = ref(false);
const showFilterSidebar = ref(false);
const isMobile = useMediaQuery(MEDIA_QUERIES.MOBILE);

const handleMarkerClick = (park: Park) => {
  selectedPark.value = park;
  // Close filter sidebar on mobile when opening park details
  if (isMobile.value) {
    showFilterSidebar.value = false;
  }
};

const handleCloseSidePanel = () => {
  selectedPark.value = null;
};

const handleOpenLogin = () => {
  showLoginModal.value = true;
};

const handleCloseLogin = () => {
  showLoginModal.value = false;
};

const handleOpenFilters = () => {
  showFilterSidebar.value = true;
};

const handleCloseFilters = () => {
  showFilterSidebar.value = false;
};

const mainContentClass = computed(() => {
  return {
    'main-content': true,
    'panel-open': selectedPark.value !== null && !isMobile.value,
  };
});
</script>

<template>
  <div class="app">
    <AppHeader @open-login="handleOpenLogin" />

    <div :class="mainContentClass">
      <!-- Filter Sidebar -->
      <FilterSidebar
        v-if="!isMobile || showFilterSidebar"
        :class="{ open: showFilterSidebar }"
        @close="handleCloseFilters"
      />

      <!-- Mobile overlay -->
      <div
        v-if="isMobile && showFilterSidebar"
        class="mobile-overlay"
        @click="handleCloseFilters"
      ></div>

      <!-- Map View -->
      <MapView
        :selected-park="selectedPark"
        @marker-click="handleMarkerClick"
        @open-filters="handleOpenFilters"
      />

      <!-- Side Panel -->
      <SidePanel
        v-if="selectedPark"
        :park="selectedPark"
        @close="handleCloseSidePanel"
      />
    </div>

    <!-- Login Modal -->
    <LoginModal :show="showLoginModal" @close="handleCloseLogin" />
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* Filter sidebar overlay on desktop */
.filter-sidebar {
  position: absolute;
  top: 10px;
  left: 10px;
  bottom: 10px;
  width: 280px;
  z-index: 100;
}

/* Side panel overlay on desktop */
.side-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  bottom: 10px;
  width: 400px;
  z-index: 100;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.mobile-overlay {
  display: none;
}

@media (max-width: 1023px) {
  .filter-sidebar {
    width: 240px;
  }
}

@media (max-width: 767px) {
  .filter-sidebar {
    top: 0;
    left: 0;
    bottom: 0;
    right: auto;
    width: 80vw;
    max-width: 320px;
    z-index: 200;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .filter-sidebar.open {
    transform: translateX(0);
  }

  .side-panel {
    position: fixed;
    top: auto;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 60vh;
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
  }

  .mobile-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 150;
  }
}

@media (prefers-reduced-motion: reduce) {
  .filter-sidebar {
    transition: none;
  }
}
</style>
