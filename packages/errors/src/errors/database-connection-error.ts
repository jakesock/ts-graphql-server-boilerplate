import { SerializedErrors, ServerErrorMessage, StatusCodes } from "../types";
import { CustomError } from "./custom-error";

/**
 * Database Connection Error (500)
 */
export class DatabaseConnectionError extends CustomError {
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

  reason = ServerErrorMessage.DATABASE_CONNECTION_ERROR;

  /**
   * Set error message and prototype
   */
  constructor() {
    super(ServerErrorMessage.DATABASE_CONNECTION_ERROR);

    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  /**
   * Serialize error.
   * @return {SerializedErrors} An array of formatted errors.
   */
  serializeErrors(): SerializedErrors {
    return [{ message: this.reason, status: this.statusCode }];
  }
}
