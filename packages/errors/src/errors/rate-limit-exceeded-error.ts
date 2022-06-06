import { SerializedErrors, ServerErrorMessage, StatusCodes } from "../types";
import { CustomError } from "./custom-error";

/**
 * Rate Limit Exceed Error (403)
 */
export class RateLimitExceededError extends CustomError {
  statusCode = StatusCodes.FORBIDDEN;

  /**
   * Set error message and prototype
   */
  constructor() {
    super(ServerErrorMessage.RATE_LIMIT_EXCEEDED);

    Object.setPrototypeOf(this, RateLimitExceededError.prototype);
  }

  /**
   * Serialize error.
   * @return {SerializedErrors} An array of formatted errors.
   */
  serializeErrors(): SerializedErrors {
    return [{ message: ServerErrorMessage.RATE_LIMIT_EXCEEDED, status: this.statusCode }];
  }
}
