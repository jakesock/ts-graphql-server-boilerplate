import { logger } from "../lib/utils";
import { testConnection } from "./utils";

testConnection(true)
  // eslint-disable-next-line unicorn/no-process-exit
  .then(() => process.exit(0))
  .catch((error) => logger.error("Test DB Connection Error:", error));
