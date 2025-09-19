import { nextTick, type Directive, type DirectiveBinding } from "vue";

type BindingValue = Partial<{
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit
}>;
interface BindingEl extends HTMLElement {
  __v_intersect_binding?: DirectiveBinding<BindingValue>;
  __v_intersect_observe?: IntersectionObserver;
  __v_intersect_dispose?: (el: BindingEl) => void;
  __v_intersect_inCallback?: boolean;
  __v_intersect_lastOptions?: IntersectionObserverInit | undefined;
  __v_intersect_lastModifiers?: Record<string, boolean> | undefined;
}

const dispose = (el: BindingEl) => {
  el.__v_intersect_observe?.disconnect();
  el.__v_intersect_observe = void 0;
  el.__v_intersect_binding = void 0;
}
const createObserver = (el: BindingEl, options: IntersectionObserverInit | undefined) => {
  // Dispose any existing observer first to avoid duplicate callbacks
  el.__v_intersect_observe?.disconnect();
  const ob = new IntersectionObserver((entries) => {
    const [entry] = entries;
    // Guard against re-entrant updates: mark we're in callback
    el.__v_intersect_inCallback = true;
    try {
      if (el.__v_intersect_binding) {
        const { value, modifiers } = el.__v_intersect_binding;
        value.callback?.(entry);

        if (
          (modifiers.showOnce && entry.intersectionRatio > 0) ||
          (modifiers.hideOnce && entry.intersectionRatio === 0) ||
          modifiers.once
        ) {
          dispose(el);
          return;
        }
      }
    } finally {
      // Defer clearing the flag to next microtask to let Vue finish the update cycle
      nextTick(() => {
        el.__v_intersect_inCallback = false;
      });
    }
  }, options || {});
  ob.observe(el);
  el.__v_intersect_observe = ob;
};

const shallowEqual = (a: any, b: any) => {
  if (a === b) return true;
  if (!a || !b) return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const k of aKeys) {
    if ((a as any)[k] !== (b as any)[k]) return false;
  }
  return true;
};

const normalizeModifiers = (mods: Record<string, boolean> | { [k: string]: boolean | undefined } | undefined): Record<string, boolean> => {
  if (!mods) return {};
  const result: Record<string, boolean> = {};
  for (const k of Object.keys(mods)) {
    result[k] = !!(mods as any)[k];
  }
  return result;
};

const mount: (el: BindingEl, binding: DirectiveBinding) => void = (el, binding) => {
  dispose(el);
  el.__v_intersect_binding = binding as DirectiveBinding<BindingValue>;
  el.__v_intersect_dispose = dispose;
  el.__v_intersect_lastOptions = binding.value?.options;
  el.__v_intersect_lastModifiers = normalizeModifiers(binding.modifiers as any);
  createObserver(el, el.__v_intersect_lastOptions);
}
export default {
  mounted: mount,
  // Only update stored binding, and re-create observer ONLY if options or modifiers changed.
  updated(el: BindingEl, binding: DirectiveBinding<BindingValue>) {
    // If the update is caused by our own callback-triggered DOM changes, ignore.
    if (el.__v_intersect_inCallback) {
      // Just refresh binding reference for latest callback/options
      el.__v_intersect_binding = binding;
      return;
    }

    const nextOptions = binding.value?.options;
    const nextModifiers = normalizeModifiers(binding.modifiers as any);
    const optionsChanged = !shallowEqual(nextOptions, el.__v_intersect_lastOptions);
    const modifiersChanged = !shallowEqual(nextModifiers, el.__v_intersect_lastModifiers);

    // Always refresh binding so callback reference stays current
    el.__v_intersect_binding = binding;

    if (optionsChanged || modifiersChanged) {
      el.__v_intersect_lastOptions = nextOptions;
      el.__v_intersect_lastModifiers = nextModifiers;
      createObserver(el, nextOptions);
    }
  },
  unmounted(el) {
    el.__v_intersect_dispose?.(el);
  }
} as Directive<BindingEl, BindingValue>;