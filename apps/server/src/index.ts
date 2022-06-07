import "dotenv/config";
import "reflect-metadata";
import { bootstrap } from "./bootstrap";
import { logger } from "./lib/utils";

bootstrap().catch((error) => logger.error("Server failed to start: %s", error));
