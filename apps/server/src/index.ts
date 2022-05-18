// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-console */

import "dotenv/config";
import "reflect-metadata";
import { bootstrap } from "./bootstrap";

bootstrap().catch((error) => console.error("Server failed to start:", error));
