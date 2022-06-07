import { createLogger, format, transports } from "winston";

export const logger = createLogger({
  transports: [new transports.Console()],
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.splat(),
    format.printf(
      ({ timestamp, level, message, service }) =>
        `[${timestamp as string}] ${service as string} (${level}): ${message}`
    )
  ),
  defaultMeta: {
    service: "SERVER",
  },
});
