import { nanoid } from "nanoid";

type UnionToIntersection<U> = (U extends any ? (a: (k: U) => void) => void : never) extends (a: infer I) => void ? I : never;
type UnionLast<U> = UnionToIntersection<U> extends (a: infer I) => void ? I : never;
type UnionToTuple<U> = [U] extends [never] ? [] : [...UnionToTuple<Exclude<U, UnionLast<U>>>, UnionLast<U>];

export function getKeys<T extends {
  [key: string | symbol]: any
}>(obj: T) {
  if (typeof obj !== 'object' || obj === null) {
    return [];
  }
  return Object.keys(obj) as UnionToTuple<keyof T>;
}

export function getKeyLengthOfObject<T extends {
  [key: string | symbol]: any
}>(obj: T) {
  if (typeof obj !== 'object' || obj === null) {
    return -1;
  }
  return getKeys(obj).length;
}

export function makeUnionDebouncer() {
  let timer = 0;
  return function debounce<T extends any[]>(fn: (...params: T) => void, delay = 120) {
    return (...params: T) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(void 0, params);
      }, delay);
    }
  }
}

export function getUniqueId(size = 16) {
  return nanoid(size);
}

export function getRandomInt(min: number, max: number) {
  const [l, r] = max > min ? [min, max] : [max, min];
  return Math.floor(Math.random() * (r - l + 1)) + l - 1;
}

export function downloadFile(url: string, filename = '') {
  let downloadName = filename;
  if (!downloadName) {
    downloadName = url.split('/').pop() as string;
  }
  const aTag = document.createElement('a');
  aTag.download = downloadName;
  aTag.href = url;
  document.body.appendChild(aTag);
  aTag.click();
  document.body.removeChild(aTag);
}

/**
 * 获取.后缀名
 * @param filename 带后缀的文件名
 * @returns 后缀名
 */
export function getType(filename: string) {
  const suffix = filename.split('.').pop();
  if (suffix) {
    return suffix;
  }
  return 'docx';
}

export function group<T extends object, R extends keyof T>(arr: T[], key: R) {
  return arr.reduce((acc, cur) => {
    const value = cur[key];
    if (Array.isArray(acc[value])) {
      acc[value].push(cur);
    } else {
      acc[value] = [cur];
    }
    return acc;
  }, Object.create(null));
}