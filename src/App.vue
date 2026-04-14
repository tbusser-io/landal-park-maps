<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import type { Park } from './types/Park';
import AppHeader from './components/AppHeader.vue';
import FilterSidebar from './components/FilterSidebar.vue';
import MapView from './components/MapView.vue';
import SidePanel from './components/SidePanel.vue';
import LoginModal from './components/LoginModal.vue';

const selectedPark = ref<Park | null>(null);
const showLoginModal = ref(false);
const showFilterSidebar = ref(false);
const isMobile = useMediaQuery('(max-width: 767px)');

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
  display: grid;
  grid-template-columns: 280px 1fr;
  overflow: hidden;
  position: relative;
}

.main-content.panel-open {
  grid-template-columns: 280px 1fr 400px;
}

.mobile-overlay {
  display: none;
}

@media (max-width: 1023px) {
  .main-content.panel-open {
    grid-template-columns: 240px 1fr;
  }

  .main-content.panel-open .side-panel {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    width: 400px;
    z-index: 150;
  }
}

@media (max-width: 767px) {
  .main-content {
    display: block;
  }

  .filter-sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .filter-sidebar.open {
    transform: translateX(0);
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
