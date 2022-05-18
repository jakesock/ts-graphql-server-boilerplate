import { CorsOptions } from "cors";
import { FRONTEND_URL, PROD, SERVER_PORT } from "../constants";

type StaticOrigin = boolean | string | RegExp | (boolean | string | RegExp)[];
type OriginCallback = (err: Error | null, origin?: StaticOrigin | undefined) => void;

const whitelist = new Set([
  FRONTEND_URL,
  `http://localhost:${SERVER_PORT}`,
  "https://studio.apollographql.com",
]);

export const corsConfig: CorsOptions = {
  /**
   * Origin CORS configuration option.
   * Determins if a request is in our origin whitelist.
   * @param {string | undefined} origin - Origin of the request.
   * @param {OriginCallback} callback - Callback to be called when origin is determined. Either allows request to proceed or throws an error.
   */
  origin(origin: string | undefined, callback: OriginCallback) {
    if (whitelist.has(origin as string) || (!PROD && !origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
