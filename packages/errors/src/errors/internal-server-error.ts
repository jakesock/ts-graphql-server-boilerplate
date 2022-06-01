import { SerializedErrors, StatusCodes } from "../types";
import { CustomError } from "./custom-error";

/**
 * Internal Server Error (500)
 */
export class InternalServerError extends CustomError {
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

  /**
   * @param {string} message - Error message.
   */
  constructor(message: string) {
    super(`Internal Server Error: ${message}`);

    Object.setPrototypeOf(this, InternalServerError.prototype);
  }

  /**
   * Serialize error.
   * @return {SerializedErrors} An array of formatted errors.
   */
  serializeErrors(): SerializedErrors {
    return [{ message: this.message, status: this.statusCode }];
  }
}
