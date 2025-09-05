import type { MinorInfoT } from "shared";

export function isStreetOrCommunityKey(key: string): key is 'street' | 'community' {
  return ['street', 'community'].includes(key)
}
export function isTempProtectKey(key: keyof MinorInfoT): key is 'tempProtect' {
  return key === 'tempProtect';
}
export function isStreetKey(key: keyof MinorInfoT): key is 'street' {
  return key === 'street';
}
export function isCommunityKey(key: keyof MinorInfoT): key is 'community' {
  return key === 'community';
}
export function isWarningStatus(key: string | keyof MinorInfoT): key is 'warningStatus' {
  return key === 'warningStatus';
}
export function isRegistratedWuhou(key: string | keyof MinorInfoT): key is 'registratedWuhou' {
  return key === 'registratedWuhou';
}
export function isGender(key: string | keyof MinorInfoT): key is 'gender' | 'guardianGender' {
  return key === 'gender' || key === 'guardianGender';
}