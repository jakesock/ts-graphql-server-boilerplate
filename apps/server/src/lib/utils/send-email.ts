// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-console */

import { InternalServerError } from "@monorepo/errors";
import nodemailer, { SendMailOptions } from "nodemailer";

/**
 * Sends an email.
 * @param {SendMailOptions} options - Object containing options for the outgoing email.
 */
export async function sendEmail(options: SendMailOptions): Promise<void> {
  try {
    const account = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // True for 465, false for other ports
      auth: {
        user: account.user, // Generated Ethereal User for DEV
        pass: account.pass, // Generated Ethereal Password for DEV
      },
    });

    const info = await transporter.sendMail(options);

    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch {
    throw new InternalServerError("Error sending email");
  }
}
