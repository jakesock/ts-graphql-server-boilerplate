import * as Yup from "yup";
import { message } from "../../lib/error-messages";
import { confirmPasswordFieldSchema, passwordFieldSchema } from "./shared";

export const resetPasswordSchema = Yup.object().shape({
  token: Yup.string()
    .matches(/^([\da-z]){32}$/, message.common.invalidToken)
    .required(message.common.required),
  password: passwordFieldSchema,
  confirmPassword: confirmPasswordFieldSchema,
});
