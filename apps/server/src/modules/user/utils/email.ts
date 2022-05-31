import { SendMailOptions } from "nodemailer";
import { v4 as uuidV4 } from "uuid";
import { FORGOT_PASSWORD_PREFIX, FRONTEND_URL } from "../../../lib/constants";
import { createConfirmationCode, sendEmail } from "../../../lib/utils";
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
    // TODO: Update this to use the production email service in the future
    // TODO: Update this to user a different email template in the future
    const mailOptions: SendMailOptions = {
      from: '"Fred Foo 👻" <foo@example.com>',
      to: userEmail,
      subject: "Confirmation Code ✔",
      text: `CODE: ${confirmationCode}`,
      html: `<div><span>CODE: <b>${confirmationCode}</b></span></div>`,
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

  // TODO: Update this to use the production email service in the future
  // TODO: Update this to user a different email template in the future
  const resetPasswordHref = `${FRONTEND_URL}/reset-password?token=${token}`;
  const resetPasswordLink = `<a href="${resetPasswordHref}">Reset Password</a>`;
  const mailOptions: SendMailOptions = {
    from: '"Fred Foo 👻" <foo@example.com>',
    to: userEmail,
    subject: "Confirmation Code ✔",
    text: `RESET PASSWORD: ${resetPasswordHref}`,
    html: `<div><span>RESET PASSWORD: ${resetPasswordLink}</span></div>`,
  };

  // Send email
  await sendEmail(mailOptions);
};
