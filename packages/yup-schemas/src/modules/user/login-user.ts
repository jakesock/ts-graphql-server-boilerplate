import * as Yup from "yup";
import { message } from "../../lib/error-messages";

export const loginUserSchema = Yup.object().shape({
  usernameOrEmail: Yup.string().required(message.common.required),
  password: Yup.string().required(message.common.required),
});
