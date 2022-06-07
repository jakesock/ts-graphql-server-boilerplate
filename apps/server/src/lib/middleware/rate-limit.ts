import { RateLimitExceededError, ServerErrorMessage } from "@monorepo/errors";
import { ResolverData, UseMiddleware } from "type-graphql";
import { MethodAndPropDecorator } from "type-graphql/dist/decorators/types";
import { MyContext } from "../../types";

type RateLimitArgs = {
  /**
   * Time window to count requests in IN SECONDS.
   */
  window: number;
  /**
   * Maximum number of requests allowed in the time window.
   */
  max: number;
  /**
   * Limit request by variables. If true, the limit will only be applied if the variables are haven't been changed.
   */
  limitByVariables?: boolean;
  /**
   * Error message to return if limit is exceeded.
   */
  errorMessage?: string;
};

/**
 * GraphQL middleware to limit number of requests for a given query/mutation.
 * See RateLimitArgs type for options.
 * @param {RateLimitArgs} args - Object that contains window, max, limitByVariables and errorMessage.
 * @return {MethodAndPropDecorator}
 */
export function RateLimit({
  window,
  max,
  errorMessage = ServerErrorMessage.RATE_LIMIT_EXCEEDED,
  limitByVariables = false,
}: RateLimitArgs): MethodAndPropDecorator {
  return UseMiddleware(
    async (
      { info: { variableValues, fieldName }, context: { req, redis } }: ResolverData<MyContext>,
      next
    ) => {
      // Get key for the current visitor based on userId or ip address.
      // If neither available, move on to next middleware.
      let identifierKey: string;
      if (req.session && req.session.userId) {
        identifierKey = `user:${req.session.userId}`; // User is logged in.
      } else if (req.ip) {
        identifierKey = `ip:${req.ip}`; // IP address if no user logged in.
      } else {
        return next(); // Something went wrong, no user or IP address.
      }

      // Get variable key if limitByVariables = true.
      const variableKey =
        limitByVariables &&
        JSON.stringify(variableValues)
          .replace(/[^\d,A-Za-z]/g, "")
          .trim();

      const key: string = ["limit", fieldName, variableKey, identifierKey].join(":"); // Create key for redis.
      const oldRecord = await redis.get(key); // Get current count.

      if (oldRecord) {
        if (Number.parseInt(oldRecord, 10) >= max) {
          throw new RateLimitExceededError(errorMessage); // Throw error if limit met/exceeded.
        } else {
          await redis.incrby(key, 1); // Increment count if limit not exceeded.
        }
      } else {
        await redis.set(key, 1, "EX", window); // If no current count for key, set to 1 and expire in window.
      }

      // Move to next middleware.
      return next();
    }
  );
}
