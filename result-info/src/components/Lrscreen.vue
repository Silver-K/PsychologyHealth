<script setup lang="tsx">
import { ref, type Ref } from 'vue'
import { ElButton } from 'element-plus';
interface Screen {
  id: string;
  url: string;
}
interface LrPropT {
  left: Screen;
  right: Screen;
}
const props = defineProps<Partial<LrPropT>>();
const leftScreen = ref<Screen>(props.left || {
  id: 'main',
  url: 'main',
});
const rightScreen = ref<Screen | void>(props.right || void 0);

const emits = defineEmits<{
 (evt: 'close-screen'): void
}>();
function closeScreen(screen: Ref<Screen | void>) {
  screen.value = void 0;
  emits('close-screen');
}

function CloseBtn() {
  return (<ElButton type="danger" class="close-controller" onClick={() => closeScreen(rightScreen)}>关闭</ElButton>)
}
defineExpose({
  setLeftScreen(screen: Screen) {
    leftScreen.value = screen
  },
  setRightScreen(screen: Screen) {
    rightScreen.value = screen
  },
})
</script>

<template>
  <div
    class="screen-frame"
  >
    <div v-if="leftScreen" class="frame left-frame">
      <slot name="left"></slot>
    </div>
    <div v-if="rightScreen" class="frame right-frame">
      <div class="right-controller">
        <CloseBtn />
      </div>

      <slot name="right"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.screen-frame {
  display: flex;
  height: 100%;
}
.frame {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 100%;
  overflow: hidden;
}
.right-frame {
  position: relative;
  overflow: hidden;
  flex-shrink: 1;
  border-left: 2px solid rgba(var(--wh-black), 0.15);
}
.right-controller {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 8px;
  text-align: right;
}
</style>