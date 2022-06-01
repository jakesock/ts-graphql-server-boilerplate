import { SerializedErrors, ServerErrorMessage, StatusCodes } from "../types";
import { CustomError } from "./custom-error";

/**
 * Not Authorized Error (401)
 */
export class NotAuthorizedError extends CustomError {
  statusCode = StatusCodes.NOT_AUTHORIZED;

  /**
   * Set error message and prototype
   */
  constructor() {
    super(ServerErrorMessage.NOT_AUTHORIZED);

    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }

  /**
   * Serialize error.
   * @return {SerializedErrors} An array of formatted errors.
   */
  serializeErrors(): SerializedErrors {
    return [{ message: ServerErrorMessage.NOT_AUTHORIZED, status: this.statusCode }];
  }
}
