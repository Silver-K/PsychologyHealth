import dayjs from "dayjs";
/**
 * 根据生日字符串和当前时间字符串计算年龄，字符串需要是Date可解析格式
 * @param birth 1997/01/07
 * @returns 年龄字符串
 */
export function calculateAge(birth, curDate) {
  try {
    const d = dayjs(birth);
    const c = dayjs(curDate ? curDate : new Date().toString());
    return c.diff(d, 'year');
  } catch {
    return 0;
  }
}

export function formatBirthday(birth) {
  try {
    return dayjs(birth).format('YYYY/MM/DD');
  } catch {
    return birth;
  }
}

export const radioLookupMap = {
  'warningStatus': ['绿', '黄', '橙', '红'],
  'gender': ['男', '女'],
  'guardianGender': ['男', '女'],
  'registratedWuhou': ['是', '否'],
}

export const StaticsLabels = {
  warningStatus: '预警状态',
  street: '街道',
  community: '社区',
  age: '年龄',
  gender: '性别',
  tempProtect: '临时庇护',
};

export function textifyData(data, streetMap, communityMap) {
  const result = Object.keys(data).reduce((acc, key) => {
    const v = data[key];
    if (typeof v !== 'undefined') {
      acc[key] = v;
    } else {
      acc[key] = '';
    }
    return acc;
  }, Object.create(null));
  for (const key of ['registratedWuhou', 'gender', 'guardianGender', 'warningStatus']) {
    if (typeof data[key] === 'number') {
      result[key] = radioLookupMap[key][data[key]];
    }
  }
  if (streetMap) {
    result.street = streetMap[data.street];
  }
  if (communityMap) {
    result.community = communityMap[data.community];
  }
  return result;
}

export function calcAge(data) {
  const result = Object.keys(data).reduce((acc, key) => {
    const v = data[key];
    if (typeof v !== 'undefined') {
      acc[key] = v;
    } else {
      acc[key] = '';
    }
    return acc;
  }, Object.create(null));
  for (const key of ['birthday', 'guardianBirthday']) {
    if (typeof data[key] === 'string' || data[key] instanceof Date) {
      result[key] = formatBirthday(data[key]);
    }
  }
  for (const key of ['age', 'guardianAge']) {
    const v = data[key.replace('age', 'birthday').replace('Age', 'Birthday')];
    if (typeof v === 'string' || v instanceof Date) {
      result[key] = calculateAge(v);
    }
  }
  return result;
}