// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-console */

import { testConnection } from "./utils";

testConnection(true)
  // eslint-disable-next-line unicorn/no-process-exit
  .then(() => process.exit(0))
  .catch((error) => console.log("Test DB Connection Error:", error));
