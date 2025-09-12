import { ref } from "vue";

const locker = ref<Record<string, number>>({});
export function useLock(key: string) {
  if (typeof locker.value[key] === 'undefined') {
    locker.value[key] = 0;
  }
  return {
    getLocker: () => {
      return typeof locker.value[key] === 'undefined' || locker.value[key] !== 0;
    },
    lock: () => {
      locker.value[key]++;
    },
    unLock: () => {
      locker.value[key]--;
      if (locker.value[key] < 0) {
        locker.value[key] = 0;
      }
    }
  }
}