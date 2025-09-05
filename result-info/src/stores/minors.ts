import axios from '~/request/axios';
import { cloneDeep } from 'lodash-es';
import { downloadFile, getUniqueId } from "~/helpers/utils";
import { calcAge, type MinorInfoT, type StaticFile } from 'shared';
import type { Prettier } from "~/types/tools";
import dayjs from 'dayjs';

const minorInfoRoot: MinorInfoT = {
  id: '',
  name: '',
  registratedWuhou: 0,
  guardianName: '',
  guardianBirthday: '',
  guardianAge: 0,
  guardianContact: '',
  guardianGender: 0,
  relationship: '',
  street: '',
  community: '',
  warningStatus: 0,
  age: 0,
  birthday: '',
  gender: 0,
  school: '',
  grade: '',
  contact: '',
  tempProtect: false,
  detail: '',
  psyTest: {
    synthesisPsyHealth: [],
    anxiety: [],
    depression: [],
    traumaReaction: [],
    socialAnxiety: [],
    intellect: [],
    personality: [],
    insomnia: [],
    other: [],
  },
  psyCounsel: [],
  lifeEvent: '',
  focus: [],
  familyGuard: [],
  otherServer: [],
  serveCount: '',
}

export function genEmptyMinorInfo() {
  const uid = getUniqueId();
  const info = cloneDeep(minorInfoRoot);
  info.id = uid;
  return info;
}

export function createRecordDate(month: Date) {
  return dayjs(month).format('YYYY/MM');
}
export async function getRecordByMonth(type: 'in' | 'out', month: string) {
  const resp = await axios(`/api/data/${type === 'in' ? 'record-in' : 'record-out'}`, {
    method: 'POST',
    data: { date: month },
  });
  if (resp && resp.status === 200 && resp.data && resp.data.success) {
    return resp.data.data;
  } else {
    return 0;
  }
}

type MinorFormInfo = Omit<MinorInfoT, 'id'>;
export async function addMinorInfo(info: MinorFormInfo) {
  const emptyInfo = genEmptyMinorInfo();
  const newInfo = Object.assign(emptyInfo, info);
  const resp = await axios('/api/data/new-minor', {
    method: 'POST',
    data: calcAge(newInfo),
  });
  if (resp && resp.status === 200 && resp.data && resp.data.success) {
    return 0;
  }
  
  return 1;
}

export async function modifyMinorInfo(id: string, data: Partial<MinorInfoT>) {
  const resp = await axios(`/api/data/edit-minor?id=${id}`, {
    method: 'POST',
    data: calcAge(data),
  });
  if (resp && resp.status === 200 && resp.data && resp.data.success) {
    return 0;
  }

  return 1;
}

type MinorInfoFilter = Pick<MinorInfoT, 'id' | 'street' | 'community' | 'warningStatus' | 'age' | 'gender' | 'school' | 'grade'>;
export async function getMinorInfo(searchVal?: string, filter?: Prettier<Partial<MinorInfoFilter>>) {
  const resp = await axios('/api/data/get-minors', {
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

export async function removeMinorItem(id: string) {
  const resp = await axios(`/api/data/remove-minor?id=${id}`, {
    method: 'POST',
  });
  if (resp && resp.status === 200 && resp.data && resp.data.success) {
    return 0;
  }
  return 1;
}

export async function downloadMinorInfo(id: string) {
  downloadFile(`/api/data/download-minor?id=${id}`);
}

export async function addPsyTestInfo(id: string, key: string, data: StaticFile) {
  const resp = await axios(`/api/data/new-psytest?id=${id}&key=${key}`, {
    method: 'POST',
    data,
  });
  if (resp && resp.status === 200 && resp.data && resp.data.success) {
    return 0;
  }
  return 1;
}

export async function editPsyTestInfo(id: string, key: string, editId: string, data: StaticFile) {
  const resp = await axios(`/api/data/edit-psytest?id=${id}&key=${key}&edit=${editId}`, {
    method: 'POST',
    data,
  });
  if (resp && resp.status === 200 && resp.data && resp.data.success) {
    return 0;
  }
  return 1;
}