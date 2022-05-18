import { v4 as uuidv4 } from "uuid";
import { MyContext } from "../../types";
import { CONFIRM_USER_PREFIX } from "../constants";

/**
 * Creates and stores a confirmation code in our redis cache upon user registration.
 * @param {string} userId - UUID representing a specific user in our database.
 * @param {MyContext} context - GraphQL context.
 * @return {string} Generated confirmation code.
 */
export const createConfirmationCode = async (
  userId: string,
  { redis }: MyContext
): Promise<string> => {
  const code = uuidv4().split("-")[0].toUpperCase();
  await redis.set(
    CONFIRM_USER_PREFIX + code, // key
    userId, // value
    "EX", // Set expires to true
    60 * 15 // 15 minute expiration time
  );

  return code;
};
