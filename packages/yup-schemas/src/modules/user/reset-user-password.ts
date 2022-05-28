import * as Yup from "yup";
import { message } from "../../lib/error-messages";
import { confirmPasswordFieldSchema, passwordFieldSchema } from "./shared";

export const resetPasswordSchema = Yup.object().shape({
  token: Yup.string().uuid("Invalid token").required(message.common.required),
  password: passwordFieldSchema,
  confirmPassword: confirmPasswordFieldSchema,
});
