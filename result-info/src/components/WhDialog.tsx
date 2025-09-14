import { defineComponent, useAttrs, useSlots, h, watch, computed, resolveComponent } from "vue";
import { useLock } from "~/composables/useLock";

export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const attrs = useAttrs();
    const slots = useSlots();
    const { lock, unLock } = useLock(['scroll', 'system-key']);
    const visCompu = computed({
      get: () => props.modelValue,
      set: (v) => {
        emit('update:modelValue', v);
      }
    })
    watch(visCompu, (visible) => {
      if (visible) {
        lock();
      } else {
        unLock();
      }
    })
    // 与全局的ElDialog保持一致，故不从element-plus中具名导入
    return () => h(resolveComponent('el-dialog'), { ...attrs, modelValue: visCompu.value, "onUpdate:modelValue": (v: boolean) => visCompu.value = v }, slots);
  }
});