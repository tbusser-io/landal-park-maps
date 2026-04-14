<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  label: string;
  modelValue: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const handleClick = () => {
  emit('update:modelValue', !props.modelValue);
};

const handlePosition = computed(() => {
  // Off: 25%, On: 75%
  return props.modelValue ? '75%' : '25%';
});

const stateLabel = computed(() => {
  return props.modelValue ? 'On' : 'Off';
});

const stateIcon = computed(() => {
  return props.modelValue ? '✓' : '○';
});
</script>

<template>
  <div class="two-state-toggle">
    <label class="toggle-label">{{ label }}</label>

    <div
      class="toggle-track"
      :class="{ active: modelValue }"
      role="switch"
      :aria-label="label"
      :aria-checked="modelValue"
      tabindex="0"
      @click="handleClick"
      @keydown.space.prevent="handleClick"
      @keydown.enter.prevent="handleClick"
    >
      <!-- State indicators -->
      <div class="state-indicators">
        <span class="state-label state-off">○</span>
        <span class="state-label state-on">✓</span>
      </div>

      <!-- Sliding handle -->
      <div
        class="toggle-handle"
        :style="{ left: handlePosition }"
      >
        <span class="handle-icon">{{ stateIcon }}</span>
      </div>

      <!-- Background gradient -->
      <div class="toggle-background" :class="{ active: modelValue }"></div>
    </div>
  </div>
</template>

<style scoped>
.two-state-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
}

.toggle-label {
  font-size: 14px;
  color: #374151;
  font-weight: 400;
  flex: 1;
  cursor: pointer;
}

.toggle-track {
  position: relative;
  width: 52px;
  height: 24px;
  background: #f3f4f6;
  border-radius: 12px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
  outline: none;
  flex-shrink: 0;
}

.toggle-track:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.toggle-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 12px;
  background: linear-gradient(to right, #f3f4f6 0%, #f3f4f6 50%, #d1fae5 50%, #d1fae5 100%);
  opacity: 0.4;
  transition: opacity 0.3s;
  pointer-events: none;
}

.toggle-background.active {
  opacity: 1;
}

.state-indicators {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 8px;
  pointer-events: none;
}

.state-label {
  font-size: 10px;
  font-weight: 600;
  opacity: 0.25;
  transition: opacity 0.2s;
}

.state-off {
  color: #6b7280;
}

.state-on {
  color: #059669;
}

.toggle-track.active .state-on {
  opacity: 0.5;
}

.toggle-track:not(.active) .state-off {
  opacity: 0.5;
}

.toggle-handle {
  position: absolute;
  top: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  transform: translateX(-50%);
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.toggle-handle:active {
  cursor: grabbing;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

.handle-icon {
  font-size: 10px;
  font-weight: bold;
}

.toggle-track:not(.active) .handle-icon {
  color: #6b7280;
}

.toggle-track.active .handle-icon {
  color: #059669;
}

@media (prefers-reduced-motion: reduce) {
  .toggle-handle,
  .toggle-background,
  .state-label {
    transition: none;
  }
}
</style>
