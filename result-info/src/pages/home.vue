<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

import { disposeAuth } from "~/stores/auth";
import RowPages from '~comp/RowPages.vue';
import RowPageItem from '~comp/RowPageItem.vue';
import Statics from '~comp/Statics.vue';
import MinorsList from '~comp/MinorsList.vue';
import QaList from '~comp/QaList.vue';
import { useLock } from "~/composables/useLock";

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
const { lock, unLock } = useLock('scroll');
watch(systemMenuVisible, (visible) => {
  visible ? lock() : unLock();
});
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
</script>

<template>
  <div class="home">
    <ElDialog v-model="systemMenuVisible" width="360" :modal="false" class="cyber-dlg" title="系统操作">
      <div class="system-btns">
        <div class="cyber-btn" @click="reset">修改密码</div>
        <div class="cyber-btn" @click="exit">退出系统</div>
      </div>
    </ElDialog>
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
