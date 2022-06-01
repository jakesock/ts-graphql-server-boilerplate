import { SerializedErrors, StatusCodes } from "../types";
import { CustomError } from "./custom-error";

/**
 * Bad Request Error (400)
 */
export class BadRequestError extends CustomError {
  statusCode = StatusCodes.BAD_REQUEST;

  /**
   * @param {string} message - Error message.
   */
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  /**
   * Serialize error.
   * @return {SerializedErrors} An array of formatted errors.
   */
  serializeErrors(): SerializedErrors {
    return [{ message: this.message, status: this.statusCode }];
  }
}
