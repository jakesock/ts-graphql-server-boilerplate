import { DatabaseConnectionError } from "@monorepo/errors";
import { AppDataSource } from "../config";
import { logger } from "./logger";

/**
 * Asynchronous function that creates our database connection.
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    logger.info("Database connection initialized");
  } catch (error) {
    logger.error("Database Connection Error: %s", error);
    throw new DatabaseConnectionError();
  }
};
