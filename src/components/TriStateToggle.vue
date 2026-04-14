<script setup lang="ts">
import { ref, computed } from 'vue';

export type FilterValue = 'exclude' | 'any' | 'must';

interface Props {
  label: string;
  modelValue: FilterValue;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: FilterValue];
}>();

const trackRef = ref<HTMLDivElement | null>(null);
const isDragging = ref(false);

// Position mapping: 0 = exclude (left), 1 = any (center), 2 = must (right)
const positionMap: Record<FilterValue, number> = {
  exclude: 0,
  any: 1,
  must: 2,
};

const valueMap: Record<number, FilterValue> = {
  0: 'exclude',
  1: 'any',
  2: 'must',
};

const handlePosition = computed(() => {
  const pos = positionMap[props.modelValue];
  // Adjust positions so handle stays within track bounds (72px track, 20px handle)
  // Left: ~14%, Center: 50%, Right: ~86%
  const positions = [14, 50, 86];
  return `${positions[pos]}%`;
});

const getStateFromPosition = (x: number, trackWidth: number): FilterValue => {
  const percentage = x / trackWidth;

  if (percentage < 0.33) return 'exclude';
  if (percentage < 0.67) return 'any';
  return 'must';
};

const handleTrackClick = (event: MouseEvent) => {
  if (isDragging.value) return;

  const track = trackRef.value;
  if (!track) return;

  const rect = track.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const newValue = getStateFromPosition(x, rect.width);

  emit('update:modelValue', newValue);
};

const handleDragStart = (event: MouseEvent) => {
  isDragging.value = true;
  event.preventDefault();

  const handleDrag = (e: MouseEvent) => {
    const track = trackRef.value;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newValue = getStateFromPosition(x, rect.width);

    emit('update:modelValue', newValue);
  };

  const handleDragEnd = () => {
    isDragging.value = false;
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', handleDragEnd);
  };

  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', handleDragEnd);
};

const handleKeydown = (event: KeyboardEvent) => {
  const currentPos = positionMap[props.modelValue];

  if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
    event.preventDefault();
    const newPos = Math.max(0, currentPos - 1);
    emit('update:modelValue', valueMap[newPos]);
  } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
    event.preventDefault();
    const newPos = Math.min(2, currentPos + 1);
    emit('update:modelValue', valueMap[newPos]);
  }
};

const stateLabel = computed(() => {
  const labels = {
    exclude: 'Excluded',
    any: 'Optional',
    must: 'Required',
  };
  return labels[props.modelValue];
});

const stateIcon = computed(() => {
  const icons = {
    exclude: '✕',
    any: '○',
    must: '✓',
  };
  return icons[props.modelValue];
});
</script>

<template>
  <div class="tri-state-toggle">
    <label class="toggle-label">{{ label }}</label>

    <div
      ref="trackRef"
      class="toggle-track"
      :class="`state-${modelValue}`"
      role="slider"
      :aria-label="label"
      :aria-valuetext="stateLabel"
      :aria-valuenow="positionMap[modelValue]"
      aria-valuemin="0"
      aria-valuemax="2"
      tabindex="0"
      @click="handleTrackClick"
      @keydown="handleKeydown"
    >
      <!-- Zone indicators -->
      <div class="zone-indicators">
        <span class="zone-label zone-exclude">✕</span>
        <span class="zone-label zone-any">○</span>
        <span class="zone-label zone-must">✓</span>
      </div>

      <!-- Sliding handle -->
      <div
        class="toggle-handle"
        :style="{ left: handlePosition }"
        @mousedown="handleDragStart"
      >
        <span class="handle-icon">{{ stateIcon }}</span>
      </div>

      <!-- Zone backgrounds -->
      <div class="zone-backgrounds">
        <div class="zone zone-exclude-bg"></div>
        <div class="zone zone-any-bg"></div>
        <div class="zone zone-must-bg"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tri-state-toggle {
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
  width: 72px;
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

.zone-backgrounds {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 12px;
  overflow: hidden;
  opacity: 0.15;
  pointer-events: none;
}

.zone {
  flex: 1;
  transition: opacity 0.3s;
}

.zone-exclude-bg {
  background: #dc2626;
}

.zone-any-bg {
  background: #9ca3af;
}

.zone-must-bg {
  background: #059669;
}

.toggle-track.state-exclude .zone-exclude-bg {
  opacity: 1;
}

.toggle-track.state-must .zone-must-bg {
  opacity: 1;
}

.zone-indicators {
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

.zone-label {
  font-size: 10px;
  font-weight: 600;
  opacity: 0.25;
  transition: opacity 0.2s;
}

.zone-exclude {
  color: #dc2626;
}

.zone-any {
  color: #6b7280;
}

.zone-must {
  color: #059669;
}

.toggle-track.state-exclude .zone-exclude,
.toggle-track.state-any .zone-any,
.toggle-track.state-must .zone-must {
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

.toggle-track.state-exclude .handle-icon {
  color: #dc2626;
}

.toggle-track.state-any .handle-icon {
  color: #6b7280;
}

.toggle-track.state-must .handle-icon {
  color: #059669;
}

@media (prefers-reduced-motion: reduce) {
  .toggle-handle,
  .zone,
  .zone-label,
  .toggle-state-label {
    transition: none;
  }
}
</style>
