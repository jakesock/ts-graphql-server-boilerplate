import * as Yup from "yup";
import {
  USERNAME_MAX,
  USERNAME_MIN,
  USERNAME_NOTONEOF_SET,
  USERNAME_REGEX,
} from "../../lib/constants";
import { message } from "../../lib/error-messages";
import { confirmPasswordFieldSchema, passwordFieldSchema } from "./shared";

// TODO: Make password matches individual checks with individual messages;

export const registerUserSchema = Yup.object().shape({
  username: Yup.string()
    .min(USERNAME_MIN, message.user.username.tooShort)
    .max(USERNAME_MAX, message.user.username.tooLong)
    .notOneOf(USERNAME_NOTONEOF_SET, "Nice try")
    .matches(USERNAME_REGEX, message.user.username.invalidRegEx)
    .required(message.common.required),
  email: Yup.string().email(message.user.email.invalid).required(message.common.required),
  confirmEmail: Yup.string()
    .oneOf([Yup.ref("email"), undefined], message.common.fieldsDoNotMatch("Emails"))
    .required(message.common.required),
  password: passwordFieldSchema,
  confirmPassword: confirmPasswordFieldSchema,
});
