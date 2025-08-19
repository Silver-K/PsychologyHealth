export function getLocalStore<T = any>(key: string): T | null {
  const store = localStorage.getItem(key);
  if (store) {
    try {
      const res = JSON.parse(store);
      return res.data;
    } catch {
      return null;
    }
  } else {
    return null;
  }
}

export function setLocalStore(key: string, data: any, type: 'json' | 'string' | 'number' | 'boolean' = 'json') {
  const toStore = Object.create(null);
  toStore.type = type;
  toStore.data = data;
  try {
    const str = JSON.stringify(toStore);
    localStorage.setItem(key, str);
    return 0;
  } catch {
    return 1;
  }
}

export function removeLocalStore(key: string) {
  localStorage.removeItem(key);
}

