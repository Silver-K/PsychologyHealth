<script lang="ts" setup>
import { inject, onUnmounted, ref } from 'vue';

const pageDown = inject('page-down', () => {
  console.log('page down');
});
const pageUp = inject('page-up', () => {
  console.log('page up');
});
const isActive = inject<(dom: HTMLDivElement) => boolean>('active-index', () => { return false });
const contRef = ref<HTMLDivElement>();
let lastScrollTop = 0;
let maxScrollHeight = -1;
let confirmPageDown = false;
let confirmPageUp = false;
const handleScroll = () => {
  if (!contRef.value || !isActive(contRef.value)) {
    return;
  }
  const sTop = contRef.value.scrollTop;
  maxScrollHeight = contRef.value.scrollHeight - contRef.value.clientHeight;
  const checkBottom = Math.abs(maxScrollHeight - sTop) < 2;
  const checkTop = Math.abs(sTop - 0) < 2;

  if (checkBottom && lastScrollTop <= sTop) {
    confirmPageDown = true;
  }
  if (checkTop && lastScrollTop >= sTop) {
    confirmPageUp = true;
  }
  if (!checkBottom && !checkTop) {
    confirmPageDown = false;
    confirmPageUp = false;
  }
  lastScrollTop = sTop;
}
function onWheel(evt: WheelEvent) {
  if (!contRef.value || !isActive(contRef.value)) {
    return;
  }
  const { deltaY } = evt;
  // deltaY > 0 滑轮向下
  if (deltaY < 0) {
    if (confirmPageUp || lastScrollTop === 0) {
      pageUp();
      confirmPageUp = false;
    }
  } else {
    if (confirmPageDown || (maxScrollHeight !== 0 && lastScrollTop === maxScrollHeight)) {
      pageDown();
      confirmPageDown = false;
    }
  }
}
window.addEventListener('wheel', onWheel);
function handleKeyUp(evt: KeyboardEvent) {
  if (!contRef.value || !isActive(contRef.value)) {
    return;
  }
  const { key, ctrlKey, altKey } = evt;
  if (key === 'ArrowUp' && !ctrlKey && !altKey) {
    if (confirmPageUp) {
      pageUp();
      confirmPageUp = false;
    }
  }
  if (key === 'ArrowDown' && !ctrlKey && !altKey) {
    if (confirmPageDown) {
      pageDown();
      confirmPageDown = false;
    }
  }
}
window.addEventListener('keyup', handleKeyUp);
onUnmounted(() => {
  window.removeEventListener('wheel', onWheel);
  window.removeEventListener('keyup', handleKeyUp);
});

</script>

<template>
  <div ref="contRef" class="row-page-item" @scroll="handleScroll">
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