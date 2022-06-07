/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable unicorn/prefer-module */
/* eslint-disable no-console */

import { InternalServerError } from "@monorepo/errors";
import Email from "email-templates";
import path from "node:path";
import nodemailer, { SendMailOptions } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { PROD } from "../constants";
import { logger } from "./logger";

export interface ILocals {
  [key: string]: unknown;
}
export type SendEmailParams = {
  template?: string;
  locals?: ILocals;
  options: SendMailOptions;
};

/**
 * Create nodemailer transporter
 * @return {Promise<nodemailer.Transporter<SMTPTransport.SentMessageInfo>>} Nodemailer transporter
 */
async function createTransport(): Promise<nodemailer.Transporter<SMTPTransport.SentMessageInfo>> {
  try {
    const account = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: !PROD ? 587 : Number(process.env.EMAIL_PORT),
      secure: PROD, // True for 465, false for other ports
      auth: {
        user: !PROD ? account.user : process.env.EMAIL_USER, // Generated Ethereal User for DEV
        pass: !PROD ? account.pass : process.env.EMAIL_PASSWORD, // Generated Ethereal Password for DEV
      },
    });

    return transporter;
  } catch {
    throw new InternalServerError("Failed to create transporter");
  }
}

/**
 * Sends an email.
 * @param {SendEmailParams} options - Object containing options for the outgoing email, a template name, and locals for the template.
 * @param {string} template - Template name to use. Will match the name of a folder within the emails directory.
 * @param {ILocals} locals - Object containing variables to be used within the template.
 */
export async function sendEmail({ options, template, locals }: SendEmailParams): Promise<void> {
  try {
    const transport = await createTransport();
    const root = path.join(__dirname, "../../emails");

    const email = new Email({
      send: true,
      preview: !PROD,
      message: {
        from: '"SITE NAME 👻" <noreply@example.com>',
      },
      transport,
      views: {
        root,
      },
    });

    const info = (await email.send({
      template,
      message: {
        ...options,
      },
      locals,
    })) as SMTPTransport.SentMessageInfo;

    if (!PROD) {
      logger.info("Message sent: %s", info.messageId);
      // Preview only available when sending through an Ethereal account
      logger.info("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    logger.error("EMAIL ERROR: %s", error);
    throw new InternalServerError("Error sending email");
  }
}
