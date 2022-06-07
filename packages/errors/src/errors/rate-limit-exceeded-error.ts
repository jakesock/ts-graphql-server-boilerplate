import { SerializedErrors, StatusCodes } from "../types";
import { CustomError } from "./custom-error";

/**
 * Rate Limit Exceed Error (429)
 */
export class RateLimitExceededError extends CustomError {
  statusCode = StatusCodes.RATE_LIMIT_EXCEEDED;

  /**
   * Set error message and prototype
   * @param {string} message - Error message.
   */
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, RateLimitExceededError.prototype);
  }

  /**
   * Serialize error.
   * @return {SerializedErrors} An array of formatted errors.
   */
  serializeErrors(): SerializedErrors {
    return [{ message: this.message, status: this.statusCode }];
  }
}
