import * as Yup from "yup";
import { message } from "../../lib/error-messages";
import { confirmPasswordFieldSchema, passwordFieldSchema } from "./shared";

export const changeUserPasswordSchema = Yup.object().shape({
  oldPassword: Yup.string().required(message.common.required),
  password: passwordFieldSchema,
  confirmPassword: confirmPasswordFieldSchema,
});
