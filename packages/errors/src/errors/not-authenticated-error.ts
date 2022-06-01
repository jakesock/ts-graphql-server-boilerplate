import { SerializedErrors, ServerErrorMessage, StatusCodes } from "../types";
import { CustomError } from "./custom-error";

/**
 * Not Authenticated Error (401)
 * This is not much different from the not authorized error, but it's a bit more specific with the message.
 */
export class NotAuthenticatedError extends CustomError {
  statusCode = StatusCodes.NOT_AUTHORIZED;

  /**
   * Set error message and prototype
   */
  constructor() {
    super(ServerErrorMessage.NOT_AUTHENTICATED);

    Object.setPrototypeOf(this, NotAuthenticatedError.prototype);
  }

  /**
   * Serialize error.
   * @return {SerializedErrors} An array of formatted errors.
   */
  serializeErrors(): SerializedErrors {
    return [{ message: ServerErrorMessage.NOT_AUTHENTICATED, status: this.statusCode }];
  }
}
