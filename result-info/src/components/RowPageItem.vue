<script lang="ts" setup>
import { inject, onUnmounted, ref } from 'vue';
import vIntersect from '~/directives/intersect';

const pageDown = inject('page-down', () => {
  console.log('page down');
});
const pageUp = inject('page-up', () => {
  console.log('page up');
});
const isActive = inject<(dom: HTMLDivElement) => boolean>('active-index', () => { return false });
const contRef = ref<HTMLDivElement>();
let scrollable = false;
let doubleCheck: 'up' | 'down' | 'none' = 'none';
function getMaxScrollHeight() {
  const scrollHeight = contRef.value ? contRef.value.scrollHeight - contRef.value.clientHeight : 0;
  scrollable = scrollHeight > 0;
  return scrollHeight;
}

function delayTo(fn: () => void) {
  setTimeout(fn);
}
function forPageUp() {
  if (!contRef.value || !isActive(contRef.value)) {
    return;
  }
  const scrollTop = contRef.value.scrollTop;
  if (doubleCheck === 'up' && (!scrollable || scrollTop === 0)) {
    delayTo(pageUp);
    doubleCheck = 'none';
  } else if ((!scrollable || scrollTop === 0) && doubleCheck !== 'up') {
    doubleCheck = 'up';
  }
}
function forPageDown() {
  if (!contRef.value || !isActive(contRef.value)) {
    return;
  }
  const maxScrollHeight = getMaxScrollHeight();
  const scrollTop = contRef.value.scrollTop;
  if (doubleCheck === 'down' && (!scrollable || scrollTop === maxScrollHeight)) {
    delayTo(pageDown);
    doubleCheck = 'none';
  } else if ((!scrollable || scrollTop === maxScrollHeight) && doubleCheck !== 'down') {
    doubleCheck = 'down';
  }
}

function handleKeyUp(evt: KeyboardEvent) {
  if (!contRef.value || !isActive(contRef.value)) {
    return;
  }
  const { key, ctrlKey, altKey } = evt;
  if (key === 'ArrowUp' && !ctrlKey && !altKey) {
    forPageUp();
  }
  if (key === 'ArrowDown' && !ctrlKey && !altKey) {
    forPageDown();
  }
}
window.addEventListener('keyup', handleKeyUp);
onUnmounted(() => {
  window.removeEventListener('keyup', handleKeyUp);
});
const isAsyncLoaded = ref(false);
const loadComp = (entry: IntersectionObserverEntry) => {
  if (entry.intersectionRatio > 0) {
    isAsyncLoaded.value = true;
  }
}
</script>

<template>
  <div v-intersect.showOnce="{ callback: loadComp, options: { threshold: 0.5 } }" ref="contRef" class="row-page-item">
    <suspense v-if="isAsyncLoaded">
      <slot></slot>
      <template #fallback>
        <div class="skeleton">
          <span class="label">loading...</span>  
        </div>
      </template>
    </suspense>
    <div v-else class="placeholder"></div>
  </div>
</template>

<style lang="scss" scoped>
.row-page-item {
  width: 100%;
  height: calc(100 * var(--vh));
  overflow-y: auto;
}
.placeholder {
  height: 100%;
}
/* Shimmer skeleton effect applied when .skeleton is present */
.skeleton {
  /* local CSS variables for this component (avoid :root in scoped styles) */
  --sk-bg: #f2f3f5;
  --sk-highlight: #afeeff;
  --sk-speed: 1.8s;
  --sk-radius: 8px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background: var(--sk-bg);
  border-radius: var(--sk-radius);
  height: 100%;
  width: 100%;
}

.skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--sk-highlight) 50%,
    transparent 100%
  );
  animation: sk-shimmer var(--sk-speed) infinite;
}
.skeleton {
  .label {
    position: relative;
    z-index: 1;
    font-size: 32px;
    line-height: 48px;
  }
}

@keyframes sk-shimmer {
  100% {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton::after {
    animation: none;
  }
}
</style>