import { cloneDeep } from 'lodash-es';
import { getLocalStore, setLocalStore } from "~/env/storage";
import { getKeys, getUniqueId } from "~/helpers/utils";
import type { MinorInfoT } from "~/types/minors";
import type { Prettier } from "~/types/tools";

const STORE_KEY = 'whsg/minors';
const RECORD_IN_KEY = 'whsg/record_minors_in';
const RECORD_OUT_KEY = 'whsg/record_minors_out';
const minorInfoRoot: MinorInfoT = {
  id: '',
  name: '',
  street: '',
  community: '',
  warningStatus: '',
  age: 0,
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
}

export function genEmptyMinorInfo() {
  const uid = getUniqueId();
  const info = cloneDeep(minorInfoRoot);
  info.id = uid;
  return info;
}

type RecordInfo = {
  date: string;
  count: number;
};
export function createRecordDate(date: Date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
}
function modifyRecord(recordKey: typeof RECORD_IN_KEY | typeof RECORD_OUT_KEY) {
  const date = createRecordDate(new Date());
  const recorder = getLocalStore<RecordInfo[]>(recordKey);
  if (Array.isArray(recorder)) {
    const record = recorder.find((item) => item.date === date);
    if (record) {
      record.count = record.count + 1;
    } else {
      recorder.push({
        date,
        count: 1,
      });
    }
    setLocalStore(recordKey, recorder);
  } else {
    setLocalStore(recordKey, [
      {
        date,
        count: 1,
      }
    ]);
  }
}
export function getRecordByMonth(type: 'in' | 'out', month: string) {
  const recorder = getLocalStore<RecordInfo[]>(type === 'in' ? RECORD_IN_KEY : RECORD_OUT_KEY);
  if (recorder) {
    const record = recorder.find((item) => item.date === month);
    return record ? record.count : 0;
  } else {
    return 0;
  }
}

type MinorFormInfo = Omit<MinorInfoT, 'id'>;
export function addMinorInfo(info: MinorFormInfo) {
  const emptyInfo = genEmptyMinorInfo();
  const newInfo = Object.assign(emptyInfo, info);
  const data = getLocalStore<MinorInfoT[]>(STORE_KEY);
  let newData: MinorInfoT[] = [];
  if (data) {
    newData = data.concat(newInfo);
  } else {
    newData = [newInfo];
  }
  modifyRecord(RECORD_IN_KEY);
  const result = setLocalStore(STORE_KEY, newData);
  return result;
}

export function setMinorInfo(info: MinorInfoT[]) {
  const result = setLocalStore(STORE_KEY, info);
  return result;
}

type MinorInfoFilter = Pick<MinorInfoT, 'street' | 'community' | 'warningStatus' | 'age' | 'gender' | 'school' | 'grade'>;
export function getMinorInfo(searchVal?: string, filter?: Prettier<MinorInfoFilter>) {
  const data = getLocalStore<MinorInfoT[]>(STORE_KEY);
  if (!filter && !searchVal) {
    return data ? data : [];
  }
  if (data) {
    let filterdData = data;
    if (searchVal) {
      filterdData = filterdData.filter((item) => {
        return getKeys(item).some((key) => {
          return (typeof item[key] === 'string' && item[key]) ? item[key].includes(searchVal) || searchVal.includes(item[key]) : false
        });
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

export function removeMinorItem(id: string) {
  const data = getLocalStore<MinorInfoT[]>(STORE_KEY);
  if (data) {
    const newData = data.filter((item) => item.id !== id);
    setLocalStore(STORE_KEY, newData);
    modifyRecord(RECORD_OUT_KEY);
  }
}