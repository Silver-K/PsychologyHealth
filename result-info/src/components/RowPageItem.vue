<script lang="ts" setup>
import { inject, onUnmounted, ref } from 'vue';
import { debounce } from 'lodash-es';

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
  const scrollTop = contRef.value.scrollTop
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
function _onWheel(evt: WheelEvent) {

  const { deltaY } = evt;
  // deltaY > 0 滑轮向下
  if (deltaY < 0) {
    forPageUp();
  } else {
    forPageDown();
  }
}
const onWheel = debounce(_onWheel, 160);
window.addEventListener('wheel', onWheel);
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
  window.removeEventListener('wheel', onWheel);
  window.removeEventListener('keyup', handleKeyUp);
});

</script>

<template>
  <div ref="contRef" class="row-page-item">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.row-page-item {
  width: 100%;
  height: calc(var(--row-page-root-height) * 1px);
  overflow-y: auto;
}
</style>