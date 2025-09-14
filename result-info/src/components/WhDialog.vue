<script lang="ts" setup>
import type { ElDialog } from "element-plus";
import { useAttrs, h, watch, resolveComponent, type ComponentInstance, getCurrentInstance } from "vue";
import { useLock } from "~/composables/useLock";
const { lock, unLock } = useLock(['scroll', 'system-key']);

const vm = getCurrentInstance();
const changeRef = (exposed: any) => {
  if (vm) {
    vm.exposed = exposed;
  }  
}
const attrs = useAttrs();
watch(() => attrs.modelValue, (visible) => {
  if (visible) {
    lock();
  } else {
    unLock();
  }
});

defineExpose({} as ComponentInstance<typeof ElDialog>);
</script>

<template>
  <!-- 这里使用resolveComponent，以使得ElDialog与全局导入的保持一致 -->
  <component :is="h(resolveComponent('el-dialog'), { ...$attrs, ref: changeRef }, $slots)"></component>
</template>
