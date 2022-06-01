/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-console */

import { DatabaseConnectionError } from "@monorepo/errors";
import { AppDataSource } from "../config";

/**
 * Asynchronous function that creates our database connection.
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log("Database successfully initialized!");
  } catch (error) {
    console.error(error);
    throw new DatabaseConnectionError();
  }
};
