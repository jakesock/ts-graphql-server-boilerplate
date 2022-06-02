import { v4 as uuidV4 } from "uuid";
import { FORGOT_PASSWORD_PREFIX, FRONTEND_URL } from "../../../lib/constants";
import { createConfirmationCode, sendEmail } from "../../../lib/utils";
import { SendEmailParams } from "../../../lib/utils/send-email";
import { MyContext } from "../../../types";

export interface ISendUserAuthEmailOptions {
  userId: string;
  userEmail: string;
  ctx: MyContext;
}

/**
 * Send Confirmation Code Email
 * @param {ISendConfirmationCodeEmailOptions} options - User ID, User Email, and GraphQL Context
 * @return {Promise<boolean>} Returns true if email was sent successfully, false otherwise.
 */
export const sendConfirmationCodeEmail = async ({
  userId,
  userEmail,
  ctx,
}: ISendUserAuthEmailOptions): Promise<boolean> => {
  try {
    // Create new confirmation code
    const confirmationCode = await createConfirmationCode(userId, ctx);
    console.log("confirmationCode", confirmationCode);

    // Send email params
    const mailOptions: SendEmailParams = {
      template: "confirmation-code",
      options: {
        to: userEmail,
      },
      locals: {
        code: confirmationCode,
        username: userEmail,
      },
    };

    // Send email
    await sendEmail(mailOptions);
    return true; // Email sent successfully
  } catch {
    return false; // Something went wrong
  }
};

/**
 * Send Password Reset Link Email
 * @param {ISendConfirmationCodeEmailOptions} options - User ID, User Email, and GraphQL Context
 * @return {Promise<void>} Returns nothing.
 */
export const sendResetPasswordLinkEmail = async ({
  userId,
  userEmail,
  ctx: { redis },
}: ISendUserAuthEmailOptions): Promise<void> => {
  const token = uuidV4().split("-").join(""); // Generate new token
  const prefixedToken = FORGOT_PASSWORD_PREFIX + token;

  // Add token to redis
  await redis.set(
    prefixedToken,
    userId,
    "EX",
    1000 * 60 * 60 * 24 * 1 // 1 day
  );

  // const resetPasswordHref = `${FRONTEND_URL}/reset-password?token=${token}`;
  const mailOptions: SendEmailParams = {
    template: "reset-password",
    options: {
      to: userEmail,
    },
    locals: {
      frontendUrl: FRONTEND_URL,
      token,
    },
  };

  // Send email
  await sendEmail(mailOptions);
};
