export interface UserAccount {
  password: string;
}

export interface ResetAccount {
  newPassword: string;
  oldPassword: string;
}