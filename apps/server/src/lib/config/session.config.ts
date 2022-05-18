import { SessionOptions } from "express-session";
import { COOKIE_NAME, PROD, SESSION_SECRET } from "../constants";
import { redisStore } from "./redis.config";

export const sessionConfig: SessionOptions = {
  name: COOKIE_NAME,
  store: redisStore,
  cookie: {
    httpOnly: true,
    secure: PROD,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 Week
  },
  saveUninitialized: false,
  secret: SESSION_SECRET,
  resave: false,
};
