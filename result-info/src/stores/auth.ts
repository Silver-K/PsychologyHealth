import { getLocalStore, setLocalStore } from "~/env/storage";
import type { UserAccount } from "~/types/account";

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


export function getAuth(account: UserAccount) {
  const { username, password } = account;
  if (username === 'guest1' && password === 'password1') {
    return setLocalStore(AUTH_KEY, {
      expire: Date.now() + AUTH_LAST,
    });
  }
  return 1;
}

export function renewAuth() {
  return setLocalStore(AUTH_KEY, {
    expire: Date.now() + AUTH_LAST,
  });
}