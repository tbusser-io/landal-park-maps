<script setup lang="ts">
import { ref } from 'vue';

const isOpen = ref(false);

const toggleLegend = () => {
  isOpen.value = !isOpen.value;
};
</script>

<template>
  <div class="legend-container">
    <button
      class="legend-toggle"
      @click="toggleLegend"
      :aria-expanded="isOpen"
      aria-label="Toggle map legend"
    >
      <span v-if="!isOpen">?</span>
      <span v-else>×</span>
    </button>

    <div v-if="isOpen" class="legend-content">
      <h3>Map Legend</h3>

      <div class="legend-item">
        <div class="marker-icon blue"></div>
        <span>Not Visited</span>
      </div>

      <div class="legend-item">
        <div class="marker-icon green"></div>
        <span>Visited</span>
      </div>

      <div class="legend-item">
        <div class="marker-icon blue promotion"></div>
        <span>Promotion</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.legend-container {
  position: absolute;
  bottom: 24px;
  right: 24px;
  z-index: 10;
}

.legend-toggle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.legend-toggle:hover {
  background: #f3f4f6;
  transform: scale(1.05);
}

.legend-toggle:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.legend-content {
  position: absolute;
  bottom: 50px;
  right: 0;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 180px;
}

.legend-content h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #374151;
}

.legend-item:last-child {
  margin-bottom: 0;
}

.marker-icon {
  width: 24px;
  height: 24px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  border: 2px solid white;
  position: relative;
}

.marker-icon.blue {
  background: #3b82f6;
}

.marker-icon.green {
  background: #10b981;
}

.marker-icon.promotion::after {
  content: '%';
  position: absolute;
  top: -6px;
  right: -6px;
  width: 16px;
  height: 16px;
  background: #f59e0b;
  border-radius: 50%;
  border: 1px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  color: white;
  transform: rotate(45deg);
}

@media (max-width: 767px) {
  .legend-container {
    bottom: 80px;
    right: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .legend-toggle {
    transition: none;
  }

  .legend-toggle:hover {
    transform: none;
  }
}
</style>
