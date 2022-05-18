import * as Yup from "yup";
import { FieldError } from "../../types";

/**
 * Checks form input against a provided Yup schema.
 * @param {Record<string, unknown>} formInput - An object containing form data (i.e. {field: value, ...}).
 * @param {Yup.AnyObjectSchema} schema - Yup object schema to check against
 * @return {Promise<FieldError[]>} Promise that resolves to an array of field errors.
 */
export const validateFormInput = async (
  formInput: Record<string, unknown>,
  schema: Yup.AnyObjectSchema
): Promise<FieldError[]> => {
  try {
    await schema.validate(formInput, { abortEarly: false });
    return [];
  } catch (error) {
    return (error as Yup.ValidationError).inner.map((err) => ({
      message: err.message,
      field: err.path as string,
    }));
  }
};
