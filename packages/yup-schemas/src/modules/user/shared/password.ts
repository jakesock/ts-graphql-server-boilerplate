import * as Yup from "yup";
import { PASSWORD_MAX, PASSWORD_MIN, PASSWORD_REGEX } from "../../../lib/constants";
import { message } from "../../../lib/error-messages";

export const passwordFieldSchema = Yup.string()
  .min(PASSWORD_MIN, message.user.password.tooShort)
  .max(PASSWORD_MAX, message.user.password.tooLong)
  .matches(PASSWORD_REGEX, message.user.password.invalidRegEx)
  .required(message.common.required);

export const confirmPasswordFieldSchema = Yup.string()
  .oneOf([Yup.ref("password"), undefined], message.common.fieldsDoNotMatch("Passwords"))
  .required(message.common.required);
