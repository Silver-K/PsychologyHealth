<script setup lang="ts">
import { useRouter } from 'vue-router';
import { renewAuth, requestAuth } from './stores/auth';
import { SYSTEM_NAME } from './constants/main';
import { ElMessage } from 'element-plus';

document.title = SYSTEM_NAME;
document.documentElement.style.setProperty('--vh', `${(innerHeight / 100).toFixed(2)}px`);
if (!window['_resize_']) {
  const resize = () => {
    document.documentElement.style.setProperty('--vh', `${(innerHeight / 100).toFixed(2)}px`);
  };
  window.addEventListener('resize', resize);
  window['_resize_'] = resize;
}
const router = useRouter();

const nonAuthPages = ['/auth', '/icons', '/demo'];
router.beforeEach((to) => {
  if (!nonAuthPages.includes(to.path)) {
    const fail = requestAuth();
    if (fail) {
      ElMessage({
        message: '登录已失效，请重新登录',
        type: 'warning'
      })
      return '/auth';
    } else {
      renewAuth();
      return true;
    }
  }
});
router.afterEach((to) => {
  if (to.path !== '/home' && to.query.row_page_key) {
    router.replace({
      query: {
        ...router.currentRoute.value.query,
        row_page_key: void 0,
      }
    })
  }
})
</script>

<template>
  <RouterView>
    <template #default="{ Component }">
      <KeepAlive>
        <Transition name="page-fade">
          <component :is="Component"></component>
        </Transition>
      </KeepAlive>
    </template>
  </RouterView>
</template>

<style scoped>

</style>
