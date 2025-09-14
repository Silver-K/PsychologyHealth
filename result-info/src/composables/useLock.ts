import { ref } from "vue";

const locker = ref<Record<string, number>>({});

export function useLock(key: string): {
  getLocker: () => boolean,
  lock: () => void,
  unLock: () => void,
}
export function useLock(key: string[]): {
  getLocker: () => Record<string, boolean>,
  lock: () => void,
  unLock: () => void,
}
export function useLock(key: string | string[]) {
  const keys = [key].flat();
  keys.forEach((k) => {
    if (typeof locker.value[k] === 'undefined') {
      locker.value[k] = 0;
    }
  });

  return {
    getLocker: () => {
      if (typeof key === 'string') {
        return typeof locker.value[key] === 'undefined' || locker.value[key] !== 0;
      } else {
        return keys.reduce((acc, k) => {
          acc[k] = locker.value[k];
          return acc;
        }, Object.create(null));
      }
    },
    lock: () => {
      keys.forEach((k) => {
        locker.value[k]++;
      });
    },
    unLock: () => {
      keys.forEach((k) => {
        locker.value[k]--;
        if (locker.value[k] < 0) {
          locker.value[k] = 0;
        }
      });
    }
  }
}