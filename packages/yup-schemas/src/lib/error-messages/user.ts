import { PASSWORD_MAX, PASSWORD_MIN, USERNAME_MAX, USERNAME_MIN } from "../constants";

const usernameErrorMessages = {
  tooShort: `Too short! Minimum of ${USERNAME_MIN} characters in length`,
  tooLong: `Too long! Maximum of ${USERNAME_MAX} characters in length`,
  invalidRegEx: 'Username can only contain letters, numbers, and "_"',
};

const passwordErrorMessages = {
  tooShort: `Too short! Minimum of ${PASSWORD_MIN} characters in length`,
  tooLong: `Too long! Maximum of ${PASSWORD_MAX} characters in length`,
  invalidRegEx: "Must contain at least one uppercase letter, one lowercase letter, and one number",
};

const emailErrorMessages = {
  invalid: "InvalidEmail",
};

export const userErrorMessages = {
  username: {
    ...usernameErrorMessages,
  },
  password: {
    ...passwordErrorMessages,
  },
  email: {
    ...emailErrorMessages,
  },
};
