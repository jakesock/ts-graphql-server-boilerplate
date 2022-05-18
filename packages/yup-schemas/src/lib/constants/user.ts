export const USERNAME_MIN = 4;
export const USERNAME_MAX = 16;
export const USERNAME_NOTONEOF_SET = ["superadmin", "admin", "god", "null", "undefined"];
export const USERNAME_REGEX = /^\w+$/;

export const PASSWORD_MIN = 6;
export const PASSWORD_MAX = 99;
export const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[A-Za-z]).*$/;
