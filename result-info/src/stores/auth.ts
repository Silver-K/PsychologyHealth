import axios from "~/request/axios";
import { getLocalStore, removeLocalStore, setLocalStore } from "~/env/storage";
import type { ResetAccount, UserAccount } from "~/types/account";

const AUTH_KEY = 'whsg/auth';
const AUTH_LAST = 1000 * 60 * 60; // 60分钟
function isExpire(date: number) {
  const now = Date.now();
  return now > date;
}
export function requestAuth() {
  const auth = getLocalStore(AUTH_KEY);
  if (!auth || isExpire(auth.expire)) {
    return 1;
  }
  return 0;
}
export function disposeAuth() {
  try {
    removeLocalStore(AUTH_KEY);
    return 0;
  } catch {
    return 1;
  }
}


export async function getAuth(account: UserAccount) {
  const { password } = account;
  const formData = new FormData();
  formData.append('password', password);
  const resp = await axios('/api/auth/login', {
    method: 'POST',
    data: formData,
  });
  if (resp && resp.status === 200 && resp.data && resp.data.success) {
    const result = setLocalStore(AUTH_KEY, {
      expire: Date.now() + (resp.data.message.includes('directly pass') ? 24 * 10000 * AUTH_LAST : AUTH_LAST),
    });
    return result === 0 ? {
      success: true,
      message: '',
    } : {
      success: false,
      message: '无法存入数据',
    }
  }
  return resp && resp.data && resp.data.message ? {
    success: false,
    message: resp.data.message,
  } : {
    success: false,
    message: '网络错误，请稍后再试'
  };
}

export async function resetAuth(account: ResetAccount) {
  const { newPassword, oldPassword } = account;
  const formData = new FormData();
  formData.append('newPassword', newPassword);
  formData.append('oldPassword', oldPassword);
  const resp = await axios('/api/auth/set-password', {
    method: 'POST',
    data: formData,
  });
  if (resp && resp.status === 200 && resp.data && resp.data.success) {
    return {
      success: true,
      message: ''
    };
  }
  return resp && resp.data && resp.data.message ? {
    success: false,
    message: resp.data.message,
  } : {
    success: false,
    message: '网络错误，请稍后再试'
  };
}

export function renewAuth() {
  return setLocalStore(AUTH_KEY, {
    expire: Date.now() + AUTH_LAST,
  });
}