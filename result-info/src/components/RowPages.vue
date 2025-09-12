<script lang="ts" setup>
import { provide, ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useLock } from '~/composables/useLock';

type QueryKey = string | {
  name: string;
  key: string;
}
interface PropT {
  loop?: boolean;
  pageQueryKeys?: QueryKey[];
}
const props = defineProps<PropT>();
type ModelT = number;

const router = useRouter();
const route = useRoute();

const contRef = ref<HTMLDivElement>();
const index = defineModel<ModelT>('index', {
  default: 0
});
const heightMemList = ref<number[]>([]);
let memChildren: HTMLDivElement[] = [];
const currentHeight = ref(innerHeight);
const headHeight = ref(0);

const currentOffsetTop = computed(() => {
  return index.value === 0 ? 0 : heightMemList.value.filter((_, ind) => ind < index.value).reduce((acc, cur) => {
    return acc + cur;
  }, 0);
});
let pagesLength = 0;

function hasPageTitle(item: QueryKey[] | undefined): item is { name: string, key: string }[]{
  return !!item && Array.isArray(item) && !!item.length && typeof item[0] !== 'string';
}
function getQueryKey(queryItem: QueryKey) {
  return typeof queryItem === 'string' ? queryItem : queryItem.key;
}
const pageTitleShow = ref(false);
let showPageTimeout = 0;
const TITLE_SHOW_DURATION = 2000;
function showPageTitle() {
  clearTimeout(showPageTimeout);
  pageTitleShow.value = true;
  showPageTimeout = window.setTimeout(() => {
    pageTitleShow.value = false;
  }, TITLE_SHOW_DURATION);
}
const pageTitle = computed(() => {
  const arr = props.pageQueryKeys;
  if (!hasPageTitle(arr)) {
    return '';
  }
  return index.value < arr.length ? arr[index.value].name : '';
});
watch(() => route.query.row_page_key, (key) => {
  if (!props.pageQueryKeys || !props.pageQueryKeys.length) {
    return;
  }
  const idx = props.pageQueryKeys.findIndex((item) => getQueryKey(item) === key);
  if (idx >= 0) {
    index.value = idx;
  }
}, {
  immediate: true,
});
watch(index, (idx) => {
  if (!props.pageQueryKeys || !props.pageQueryKeys.length || idx >= props.pageQueryKeys.length) {
    return;
  }
  router.replace({
    query: {
      ...route.query,
      row_page_key: getQueryKey(props.pageQueryKeys[idx])
    }
  });
  if (contRef.value) {
    const fn = () => {
      showPageTitle();
      contRef.value?.removeEventListener('transitionend', fn);
    }
    contRef.value.addEventListener('transitionend', fn);
  }
}, {
  immediate: true
});

function setPageTransition() {
  if (!contRef.value) {
    return;
  }
  contRef.value.style.transition = 'transform .5s ease-in';
  const fn = () => {
    if (!contRef.value) {
      return;
    }
    contRef.value.style.transition = '';
    contRef.value.removeEventListener('transitionend', fn);
  }
  contRef.value.addEventListener('transitionend', fn);
}
const { getLocker } = useLock('scroll');
provide('page-down', () => {
  const isLocked = getLocker();
  console.log(isLocked);
  if (isLocked) {
    return;
  }
  setPageTransition();
  let calcResult = index.value + 1;
  if (calcResult >= pagesLength) {
    if (props.loop) {
      calcResult = calcResult % pagesLength;
    } else {
      calcResult = pagesLength - 1;
    }
  }
  index.value = calcResult;
});
provide('page-up', () => {
  const isLocked = getLocker();
  if (isLocked) {
    return;
  }
  setPageTransition();
  let calcResult = index.value - 1;
  if (calcResult < 0) {
    if (props.loop) {
      calcResult = pagesLength - 1;
    } else {
      calcResult = 0;
    }
  }
  index.value = calcResult;
});
provide('active-index', (activeDom: HTMLDivElement) => {
  return memChildren[index.value] === activeDom;
});

let forceHeightChange = false;
let delayTimeout = 0;
let ob: ResizeObserver | null = new ResizeObserver(() => {
  clearTimeout(delayTimeout);
  if (forceHeightChange) {
    forceHeightChange = false;
    return;
  }

  delayTimeout = window.setTimeout(() => {
    if (!contRef.value) {
      return;
    }
    const children = Array.from(contRef.value.children).filter((dom) => dom.classList.contains('row-page-item')) as HTMLDivElement[];
    pagesLength = children.length;
    if (pagesLength === 0) {
      return;
    }
    if (index.value >= pagesLength) {
      index.value = pagesLength - 1;
    }
    heightMemList.value = children.map((child) => child.clientHeight);
    memChildren = children.slice();
    const height = heightMemList.value[index.value];
    headHeight.value = index.value === 0 ? 0 : heightMemList.value[index.value - 1];
    currentHeight.value = height;
    forceHeightChange = true;
  });
});
onMounted(() => {
  if (contRef.value && ob) {
    ob.observe(contRef.value);
    contRef.value.style.transition = 'none';
  }
});
onUnmounted(() => {
  ob?.disconnect();
  ob = null;
})
</script>

<template>
  <div class="row-pages" :style="{ '--row-page-root-height': `${currentHeight}`, height: `${currentHeight}px` }">
    <Transition>
      <div v-show="pageTitleShow" class="row-page-title">{{ pageTitle }}</div>
    </Transition>

    <div ref="contRef" class="content" :style="{ transform: `translateY(${-1 * currentOffsetTop}px)`} ">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.row-pages {
  overflow: hidden;
}
.row-page-title {
  position: fixed;
  left: 50%;
  top: 40%;
  transform: translate(-50%, -50%);
  min-width: 350px;
  text-align: center;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 24px;
  line-height: 32px;
  color: var(--wh-color-text-inverse);
  background-color: rgba(0,0,0,0.6);
  z-index: 999999;
  pointer-events: none;
}
</style>