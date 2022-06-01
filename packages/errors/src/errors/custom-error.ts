import { SerializedErrors, StatusCodes } from "../types";

/**
 * Custom error class which extends the built-in Error class.
 * All errors thrown by the application should extend this class.
 */
export abstract class CustomError extends Error {
  abstract statusCode: StatusCodes;

  /**
   * @param {string} message - Error message.
   */
  constructor(public message: string) {
    super(message);

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  abstract serializeErrors(): SerializedErrors;
}
