import { Options } from "express-rate-limit";
import RateLimitRedis from "rate-limit-redis";
import {
  SERVER_WIDE_RATE_LIMIT_MAX,
  SERVER_WIDE_RATE_LIMIT_MESSAGE,
  SERVER_WIDE_RATE_LIMIT_WINDOW_MS,
} from "../constants";
import { redisClient } from "./redis.config";

const rateLimitStore = new RateLimitRedis({
  // @ts-expect-error - Known issue: the `call` function is not correctly typed for an ioredis client but returns a type of
  // RedisReply from the rate-limit-redis package.
  sendCommand: (...args: string[]) => redisClient.call(...args),
});

export const rateLimitConfig: Partial<Options> = {
  store: rateLimitStore,
  max: SERVER_WIDE_RATE_LIMIT_MAX,
  windowMs: SERVER_WIDE_RATE_LIMIT_WINDOW_MS,
  message: SERVER_WIDE_RATE_LIMIT_MESSAGE,
  standardHeaders: true,
  legacyHeaders: false,
};
