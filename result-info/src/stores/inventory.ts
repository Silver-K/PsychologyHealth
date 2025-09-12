import axios from '~/request/axios';
import { cloneDeep } from 'lodash-es';
import { getUniqueId } from "~/helpers/utils";
import type { InventoryInfoT } from "~/types/inventory";
import type { Prettier } from "~/types/tools";

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
export async function addInventoryInfo(info: InventoryFormInfo) {
  const emptyInfo = genEmptyInventoryInfo();
  const newInfo = Object.assign(emptyInfo, info);
  const resp = await axios('/api/data/new-inventory', {
    method: 'POST',
    data: newInfo,
  });
  if (resp && resp.status === 200 && resp.data && resp.data.success) {
    return 0;
  }
  
  return 1;
}

export async function patchInventoryInfo(infos: InventoryFormInfo[]) {
  const resp = await axios('/api/data/new-patch-inventory', {
    method: 'POST',
    data: infos,
  });
  if (resp && resp.status === 200 && resp.data && resp.data.success) {
    return 0;
  }
  
  return 1;
}

export async function modifyInventoryInfo(id: string, data: Partial<InventoryFormInfo>) {
  const resp = await axios(`/api/data/edit-inventory?id=${id}`, {
    method: 'POST',
    data,
  });
  if (resp && resp.status === 200 && resp.data && resp.data.success) {
    return 0;
  }

  return 1;
}

type InventoryInfoFilter = Pick<InventoryInfoT, 'classification' | 'name' | 'applicableAge'>;
export async function getInventoryInfo(searchVal?: string, filter?: Prettier<InventoryInfoFilter>) {
  const resp = await axios('/api/data/get-inventory', {
    method: 'POST',
    data: {
      searchVal,
      ...filter,
    }
  });
  if (resp && resp.status === 200 && resp.data && resp.data.success) {
    return resp.data.data;
  } else {
    return [];
  }
}

export async function removeInventoryItem(id: string) {
  const resp = await axios(`/api/data/remove-inventory?id=${id}`, {
    method: 'POST',
  });
  if (resp && resp.status === 200 && resp.data && resp.data.success) {
    return 0;
  }
  return 1;
}