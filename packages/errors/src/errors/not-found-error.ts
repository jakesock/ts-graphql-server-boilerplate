import { SerializedErrors, ServerErrorMessage, StatusCodes } from "../types";
import { CustomError } from "./custom-error";

/**
 * Not Found Error (404)
 */
export class NotFoundError extends CustomError {
  statusCode = StatusCodes.NOT_FOUND;

  /**
   * Set error message and prototype
   */
  constructor() {
    super(ServerErrorMessage.NOT_FOUND);

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  /**
   * Serialize error.
   * @return {SerializedErrors} An array of formatted errors.
   */
  serializeErrors(): SerializedErrors {
    return [{ message: ServerErrorMessage.NOT_FOUND, status: this.statusCode }];
  }
}
