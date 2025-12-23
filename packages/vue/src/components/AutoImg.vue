<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import 'autoimg';

export interface AutoImgProps {
  // Core properties
  src?: string;
  width?: string;
  height?: string;

  // Image properties
  imgAlt?: string;
  imgLoading?: 'lazy' | 'eager';
  imgTitle?: string;
  imgDraggable?: boolean;
  imgCrossOrigin?: 'anonymous' | 'use-credentials' | '';
  imgDecoding?: 'async' | 'sync' | 'auto';
  imgFetchPriority?: 'high' | 'low' | 'auto';

  // Model properties
  focus?: string;
  focusCenter?: string;
  focusTl?: string;
  focusTlX?: string;
  focusTlY?: string;
  focusBr?: string;
  focusBrX?: string;
  focusBrY?: string;
  defer?: boolean;
  allowDistortion?: boolean;
  padding?: string;
  placeholder?: string;
}

const props = defineProps<AutoImgProps>();
const elementRef = ref<HTMLElement | null>(null);

// Set dotted properties that can't be set via template attributes
const updateDottedProps = () => {
  const element = elementRef.value;
  if (!element) return;

  // Dotted properties (can't be set via template)
  if (props.focusTl !== undefined) {
    element.setAttribute('focus.tl', props.focusTl);
  }
  if (props.focusTlX !== undefined) {
    element.setAttribute('focus.tl.x', props.focusTlX);
  }
  if (props.focusTlY !== undefined) {
    element.setAttribute('focus.tl.y', props.focusTlY);
  }
  if (props.focusBr !== undefined) {
    element.setAttribute('focus.br', props.focusBr);
  }
  if (props.focusBrX !== undefined) {
    element.setAttribute('focus.br.x', props.focusBrX);
  }
  if (props.focusBrY !== undefined) {
    element.setAttribute('focus.br.y', props.focusBrY);
  }
};

onMounted(() => {
  updateDottedProps();
});

// Watch for changes to dotted properties
watch(
  () => [props.focusTl, props.focusTlX, props.focusTlY, props.focusBr, props.focusBrX, props.focusBrY],
  () => {
    updateDottedProps();
  }
);
</script>

<template>
  <auto-img
    ref="elementRef"
    :src="src"
    :width="width"
    :height="height"
    :img-alt="imgAlt"
    :img-loading="imgLoading"
    :img-title="imgTitle"
    :img-draggable="imgDraggable ?? Boolean(imgDraggable)"
    :img-crossOrigin="imgCrossOrigin"
    :img-decoding="imgDecoding"
    :img-fetchPriority="imgFetchPriority"
    :focus="focus"
    :focus-center="focusCenter"
    :defer="defer ?? Boolean(defer)"
    :allowDistortion="allowDistortion ?? Boolean(allowDistortion)"
    :padding="padding"
    :placeholder="placeholder"
  >
    <slot />
  </auto-img>
</template>
