<script setup lang="ts">
import { defineAsyncComponent, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import WhDialog from "~/components/WhDialog.vue";
import { disposeAuth } from "~/stores/auth";
import RowPages from '~comp/RowPages.vue';
import RowPageItem from '~comp/RowPageItem.vue';
import { useLock } from "~/composables/useLock";

const Statics = defineAsyncComponent(() => {
  return import('~comp/Statics.vue');
})
const MinorsList = defineAsyncComponent(() => {
  return import('~comp/MinorsList.vue');
});
const QaList = defineAsyncComponent(() => {
  return import('~comp/QaList.vue');
});
const ROW_PAGE_KEYS = [
  {
    key: 'static',
    name: '数据概览',
  },
  {
    key: 'minors',
    name: '服务记录',
  },
  {
    key: 'inventory',
    name: '量表库',
  } 
];
const router = useRouter();
const rowIndex = ref(0);
const systemMenuVisible = ref(false);
const { getLocker } = useLock('system-key');

function exit() {
  systemMenuVisible.value = false;
  const result = disposeAuth();
  if (result === 0) {
    router.replace('/auth');
  }
}
function reset() {
  systemMenuVisible.value = false;
  router.push('/auth?modify_password=true');
}

const handleKeyup = (evt: KeyboardEvent) => {
  if (getLocker()) {
    return;
  }
  const { key ,ctrlKey, altKey } = evt;
  if (key === 'Escape' && !ctrlKey && !altKey) {
    systemMenuVisible.value = true;
  }

  if (key === '1') {
    rowIndex.value = 0;
  } else if (key === '2') {
    rowIndex.value = 1;
  } else if (key === '3') {
    rowIndex.value = 2;
  }
}
window.addEventListener('keyup', handleKeyup);
onUnmounted(() => {
  window.removeEventListener('keyup', handleKeyup);
});
const clickMenu = (idx: number) => {
  rowIndex.value = idx;
}
const sideMenuOpen = ref(false);
let sideMenuTimer = 0;
const SIDE_MENU_DELAY = 260;
const openSideMenu = () => {
  clearTimeout(sideMenuTimer);
  sideMenuTimer = window.setTimeout(() => {
    sideMenuOpen.value = true;
  }, SIDE_MENU_DELAY);
}
const closeSideMenu = () => {
  clearTimeout(sideMenuTimer);
  sideMenuTimer = window.setTimeout(() => {
    sideMenuOpen.value = false;
  }, SIDE_MENU_DELAY);
}
</script>

<template>
  <div class="home">
    <WhDialog v-model="systemMenuVisible" width="360" :modal="false" class="cyber-dlg" title="系统操作">
      <div class="system-btns">
        <div class="cyber-btn" @click="reset">修改密码</div>
        <div class="cyber-btn" @click="exit">退出系统</div>
      </div>
    </WhDialog>
    <Teleport to="body">
      <ul class="side-menu" :class="{ 'dark': rowIndex === 0, 'light': rowIndex !== 0, 'show': sideMenuOpen }" @mouseenter="openSideMenu" @mouseleave="closeSideMenu">
        <li class="side-menu-item" v-for="(item, index) in ROW_PAGE_KEYS" :key="item.key" @click="clickMenu(index)">
          <span class="side-menu-label" :class="{ active: rowIndex === index }">
            <span v-show="rowIndex === index" class="icon icon-free icon-arrow-r icon-bold side-menu-icon"></span>
            {{ item.name }}
          </span>
        </li>
      </ul>
      <div class="side-menu-trigger" @mouseenter="openSideMenu" @mouseleave="closeSideMenu"></div>
    </Teleport>
    <RowPages class="pages" v-model:index="rowIndex" :page-query-keys="ROW_PAGE_KEYS">
      <RowPageItem>
        <Statics />
      </RowPageItem>
      <RowPageItem>
        <MinorsList />
      </RowPageItem>
      <RowPageItem>
        <QaList />
      </RowPageItem>
    </RowPages>
  </div>
</template>

<style lang="scss" scoped>
.pages {
  height: calc(100 * var(--vh));
}
</style>
