import { type Directive, type DirectiveBinding } from "vue";

type BindingValue = Partial<{
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit
}>;
interface BindingEl extends HTMLElement {
  __v_intersect_binding?: DirectiveBinding<BindingValue>;
  __v_intersect_observe?: IntersectionObserver;
  __v_intersect_dispose?: (el: BindingEl) => void;
}

const dispose = (el: BindingEl) => {
  el.__v_intersect_observe?.disconnect();
  el.__v_intersect_observe = void 0;
  el.__v_intersect_binding = void 0;
}
const mount: (el: BindingEl, binding: DirectiveBinding) => void = (el, binding) => {
  el.__v_intersect_binding = binding;
  const ob = new IntersectionObserver((entries) => {
    const [entry] = entries;
    if (el.__v_intersect_binding) {
      const { value, modifiers } = el.__v_intersect_binding;
      value.callback?.(entry);
      
      if (modifiers.showOnce && entry.intersectionRatio > 0
        || modifiers.hideOnce && entry.intersectionRatio === 0
        || modifiers.once
      ) {
        dispose(el);
      }
    }
  }, binding.value.options || {});
  el.__v_intersect_dispose = dispose;
  ob.observe(el);
  el.__v_intersect_observe = ob;
}
export default {
  mounted: mount,
  updated: mount,
  unmounted(el) {
    el.__v_intersect_dispose?.(el);
  }
} as Directive<BindingEl, BindingValue>;