import { cloneDeep } from 'lodash-es';
import { getLocalStore, setLocalStore } from "~/env/storage";
import { getKeys, getUniqueId } from "~/helpers/utils";
import type { InventoryInfoT } from "~/types/inventory";
import type { Prettier } from "~/types/tools";

const STORE_KEY = 'whsg/inventories';
const inventoryInfoRoot: InventoryInfoT = {
  id: '',
  name: '',
  classification: '',
  applicableAge: '',
  files: [],
}

export function genEmptyInventoryInfo() {
  const uid = getUniqueId();
  const info = cloneDeep(inventoryInfoRoot);
  info.id = uid;
  return info;
}

type InventoryFormInfo = Omit<InventoryInfoT, 'id'>;
export function addInventoryInfo(info: InventoryFormInfo) {
  const emptyInfo = genEmptyInventoryInfo();
  const newInfo = Object.assign(emptyInfo, info);
  const data = getLocalStore<InventoryInfoT[]>(STORE_KEY);
  let newData: InventoryInfoT[] = [];
  if (data) {
    newData = data.concat(newInfo);
  } else {
    newData = [newInfo];
  }
  const result = setLocalStore(STORE_KEY, newData);
  return result;
}

export function setInventoryInfo(info: InventoryInfoT[]) {
  const result = setLocalStore(STORE_KEY, info);
  return result;
}

type InventoryInfoFilter = Pick<InventoryInfoT, 'classification' | 'name' | 'applicableAge'>;
export function getInventoryInfo(searchVal?: string, filter?: Prettier<InventoryInfoFilter>) {
  const data = getLocalStore<InventoryInfoT[]>(STORE_KEY);
  if (!filter && !searchVal) {
    return data ? data : [];
  }
  if (data) {
    let filterdData = data;
    if (searchVal) {
      filterdData = filterdData.filter((item) => {
        return getKeys(item).some((key) => typeof item[key] === 'string' && item[key] ? item[key].includes(searchVal) || searchVal.includes(item[key]) : false);
      });
    }
    if (filter) {
      const keys = getKeys(filter);
      keys.forEach((key) => {
        const v = filter[key];
        if (!v) {
          return;
        }
        filterdData = filterdData.filter((item) => {
          if (typeof item[key] === 'string') {
            return item[key].includes(String(v));
          }
          if (typeof item[key] === 'number') {
            return item[key] === Number(v);
          }
          if (typeof item[key] === 'boolean') {
            return item[key] === Boolean(v);
          }
        })
      });
    }    
    return filterdData
  } else {
    return [];
  }
}

export function removeInventoryItem(id: string) {
  const data = getLocalStore<InventoryInfoT[]>(STORE_KEY);
  if (data) {
    const newData = data.filter((item) => item.id !== id);
    setLocalStore(STORE_KEY, newData);
  }
}