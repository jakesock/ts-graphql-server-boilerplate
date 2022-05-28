import {
  changeUserPasswordSchema,
  loginUserSchema,
  resetPasswordSchema,
} from "@monorepo/yup-schemas";
import { SendMailOptions } from "nodemailer";
import { Service } from "typedi";
import { v4 as uuidV4 } from "uuid";
import { User } from "../../entity";
import {
  CONFIRM_USER_PREFIX,
  COOKIE_NAME,
  FORGOT_PASSWORD_PREFIX,
  FRONTEND_URL,
} from "../../lib/constants";
import {
  createConfirmationCode,
  PasswordManager,
  sendEmail,
  validateFormInput,
} from "../../lib/utils";
import { AuthFormResponse, MyContext } from "../../types";
import {
  invalidExpiredConfirmationCodeErrorMessage,
  invalidLoginInputErrorMessage,
  userNotFoundByCodeErrorMessage,
} from "./error-messages";
import {
  ChangeUserPasswordInput,
  LoginUserInput,
  RegisterUserInput,
  ResetUserPasswordInput,
  SendNewConfirmationCodeInput,
} from "./inputs";
import { validateRegister } from "./utils/validate-register";

@Service()
/**
 * Represents UserService, a service providing business logic
 * for the User GraphQL Resolver.
 */
export class UserService {
  /**
   * Get current user.
   *
   * Retrieves the currently logged in user. If no userId found in session,
   * returns null.
   * @param {MyContext} ctx - Our GraphQL context.
   * @return {Promise<User | null>} Promise that resolves to a user or null.
   */
  getCurrentUser = async ({ req }: MyContext): Promise<User | null> => {
    if (!req.session.userId) return null; // User is not logged in
    const user = await User.findOne({ where: { id: req.session.userId } }); // Find User by ID
    if (!user) return null; // Could not find user by ID
    return user;
  };

  /**
   * Register a new user.
   *
   * Validates input, hashes password, creates a new
   * user entity, and sends a confirmation email to user.
   * @param {RegisterUserInput} registerUserInput - Object of type RegisterUserInput.
   * @param {MyContext} ctx - Our GraphQL context.
   * @return {Promise<AuthFormResponse>} Promise that resolves to an AuthFormResponse.
   */
  register = async (
    registerUserInput: RegisterUserInput,
    ctx: MyContext
  ): Promise<AuthFormResponse> => {
    // Validate input, return errors (if any)
    const errors = await validateRegister(registerUserInput);
    if (errors.length > 0) {
      return { errors };
    }

    // Hash password
    const passwordManager = new PasswordManager();
    const hashedPassword = await passwordManager.toHash(registerUserInput.password);

    // Create new user and save to database
    const newUser = await User.create({
      username: registerUserInput.username,
      email: registerUserInput.email,
      password: hashedPassword,
    }).save();

    // Add userId to session (Log them in)
    ctx.req.session.userId = newUser.id;

    // Send confirmation email
    // TODO: Update this to use the production email service in the future
    // TODO: Update this to user a different email template in the future
    const confirmationCode = await createConfirmationCode(newUser.id, ctx);
    const mailOptions: SendMailOptions = {
      from: '"Fred Foo 👻" <foo@example.com>',
      to: newUser.email,
      subject: "Confirmation Code ✔",
      text: `CODE: ${confirmationCode}`,
      html: `<div><span>CODE: <b>${confirmationCode}</b></span></div>`,
    };
    await sendEmail(mailOptions);

    // Return user data
    return { user: newUser };
  };

  /**
   * Login a user.
   *
   * Validates input and adds userId to session cookie.
   * @param {LoginUserInput} loginUserInput - Object of type LoginUserInput.
   * @param {MyContext} ctx - Our GraphQL context.
   * @return {Promise<UserResponse>} Promise that resolves to a UserResponse.
   */
  login = async (
    { usernameOrEmail, password }: LoginUserInput,
    { req }: MyContext
  ): Promise<AuthFormResponse> => {
    // Validate input, return errors (if any)
    const errors = await validateFormInput({ usernameOrEmail, password }, loginUserSchema);
    if (errors.length > 0) {
      return { errors };
    }

    const invalidInputErrorResponse: AuthFormResponse = {
      errors: [
        {
          message: invalidLoginInputErrorMessage,
          field: "usernameOrEmail",
        },
        {
          message: invalidLoginInputErrorMessage,
          field: "password",
        },
      ],
    };

    // Check if input is username or email, find user
    const user = await (usernameOrEmail.includes("@")
      ? User.findOne({
          where: { email: usernameOrEmail },
        })
      : User.findOne({
          where: { username: usernameOrEmail },
        }));

    if (!user) {
      return invalidInputErrorResponse;
    }

    // Verify password input in relation to found user
    const passwordManager = new PasswordManager();
    const valid = await passwordManager.compare(user.password, password);
    if (!valid) {
      return invalidInputErrorResponse;
    }

    // Add userId to session
    req.session.userId = user.id;
    return { user };
  };

  /**
   * Logout current user.
   *
   * Clears userId from session cookie.
   * @param {MyContext} ctx - Our GraphQL context.
   * @return {Promise<boolean>} Promise that resolves to true if cookie successfully destroyed.
   */
  logout = async ({ req, res }: MyContext): Promise<boolean> =>
    new Promise((resolve, reject) => {
      req.session.destroy((error) => {
        if (error) {
          reject(error);
        } else {
          res.clearCookie(COOKIE_NAME); // Clear cookie if session destroyed successfully
          resolve(true);
        }
      });
    });

  /**
   * Send new confirmation email to user.
   *
   * @param {SendNewConfirmationCodeInput} sendNewConfirmationCodeInput - Object of type SendNewConfirmationCodeInput.
   * @param {MyContext} ctx - Our GraphQL context.
   * @return {Promise<boolean>} Promsie that resolves to true if email sent successfully, false otherwise.
   */
  sendNewConfirmationEmail = async (
    sendNewConfirmationCodeInput: SendNewConfirmationCodeInput,
    ctx: MyContext
  ): Promise<boolean> => {
    const { userEmail, userId } = sendNewConfirmationCodeInput;
    try {
      // Send confirmation email
      // TODO: Update this to use the production email service in the future
      // TODO: Update this to user a different email template in the future
      const confirmationCode = await createConfirmationCode(userId, ctx);
      const mailOptions: SendMailOptions = {
        from: '"Fred Foo 👻" <foo@example.com>',
        to: userEmail,
        subject: "Confirmation Code ✔",
        text: `CODE: ${confirmationCode}`,
        html: `<div><span>CODE: <b>${confirmationCode}</b></span></div>`,
      };
      await sendEmail(mailOptions);
      return true; // Email send successfully
    } catch {
      return false; // Email send failed.
    }
  };

  /**
   * Confirm user email.
   *
   * Validates code, finds user, and confirms user account.
   * Deletes confirmation code from redis database.
   * @param {string} code - Token sent to user email upon register.
   * @param {MyContext} ctx - Our GraphQL context.
   * @return {Promise<AuthFormResponse>} Promise that resolves to an AuthFormResponse.
   */
  confirmUserEmail = async (code: string, { redis }: MyContext): Promise<AuthFormResponse> => {
    const prefixedToken = CONFIRM_USER_PREFIX + code;
    const userId = await redis.get(prefixedToken);
    if (!userId) {
      return {
        errors: [
          {
            field: "code",
            message: invalidExpiredConfirmationCodeErrorMessage,
          },
        ],
      };
    }

    const user = await User.findOneBy({ id: userId });
    if (!user) {
      return {
        errors: [
          {
            field: "code",
            message: userNotFoundByCodeErrorMessage,
          },
        ],
      };
    }

    Object.assign(user, { isConfirmed: true }); // Update user to confirmed
    await redis.del(prefixedToken); // Delete token from redis database
    const updatedUser = await user.save(); // Save updated user to database
    return {
      user: updatedUser, // Confirmation successful, return updated user
    };
  };

  /**
   * Send password reset email to user.
   *
   * Generates a new token and stores it in cache,
   * sends an email containg a link with the token to reset password.
   * @param {string} email - Email to send password reset email to.
   * @param {MyContext} ctx - Our GraphQL context.
   * @return {Promise<boolean>} Promise that resolves to true if email sent successfully, false otherwise.
   */
  sendPasswordResetEmail = async (email: string, { redis }: MyContext): Promise<boolean> => {
    const user = await User.findOneBy({ email });
    if (!user) {
      return true; // Email not in DB, don't let user know if not
    }

    const token = uuidV4().split("-").join(""); // Generate new token
    await redis.set(
      FORGOT_PASSWORD_PREFIX + token,
      user.id,
      "EX",
      1000 * 60 * 60 * 24 * 1 // 1 day
    );

    // TODO: Update this to use the production email service in the future
    // TODO: Update this to user a different email template in the future
    const resetPasswordHref = `${FRONTEND_URL}/reset-password?token=${token}`;
    const resetPasswordLink = `<a href="${resetPasswordHref}">Reset Password</a>`;
    const mailOptions: SendMailOptions = {
      from: '"Fred Foo 👻" <foo@example.com>',
      to: email,
      subject: "Confirmation Code ✔",
      text: `RESET PASSWORD: ${resetPasswordHref}`,
      html: `<div><span>RESET PASSWORD: ${resetPasswordLink}</span></div>`,
    };
    await sendEmail(mailOptions);

    return true;
  };

  /**
   * Reset user password.
   *
   * Validates input, checks token is valid, updates user password,
   * removes token from cache, and logs in the user.
   * @param {ResetUserPasswordInput} resetUserPasswordInput - Object of type ResetUserPasswordInput.
   * @param {MyContext} ctx - Our GraphQL context.
   * @return {Promise<AuthFormResponse>} Promise that resolves to an AuthFormResponse.
   */
  resetPassword = async (
    resetUserPasswordInput: ResetUserPasswordInput,
    { redis, req }: MyContext
  ): Promise<AuthFormResponse> => {
    const errors = await validateFormInput(resetUserPasswordInput, resetPasswordSchema);
    if (errors.length > 0) {
      return { errors };
    }

    // Get user id from redis cache
    const { token, password } = resetUserPasswordInput;
    const prefixedToken = FORGOT_PASSWORD_PREFIX + token;
    const userId = await redis.get(prefixedToken);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: invalidExpiredConfirmationCodeErrorMessage,
          },
        ],
      };
    }

    // Get user from database
    const user = await User.findOneBy({ id: userId });
    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: userNotFoundByCodeErrorMessage,
          },
        ],
      };
    }

    // Update user password
    const passwordManager = new PasswordManager();
    await User.update({ id: userId }, { password: await passwordManager.toHash(password) });

    // Delete token from redis database
    await redis.del(prefixedToken);

    // Login user after successful password reset
    req.session.userId = user.id;
    return { user };
  };

  /**
   * Change user password
   *
   * Validates input, updates user password.
   * @param {ChangeUserPasswordInput} changeUserPasswordInput - Object of type ChangeUserPasswordInput.
   * @param {MyContext} ctx - Our GraphQL context.
   * @return {Promise<AuthFormResponse>} Promise that resolves to an AuthFormResponse.
   */
  changeUserPassword = async (
    changeUserPasswordInput: ChangeUserPasswordInput,
    { req }: MyContext
  ): Promise<AuthFormResponse> => {
    // Double check that user is logged in
    const { userId } = req.session;
    if (!userId) {
      throw new Error("Authentication failed, authorization denied.");
    }

    // Retrieve user from database
    const user = await User.findOneBy({ id: userId });
    if (!user) {
      throw new Error("User not found.");
    }

    // Validate input
    const { oldPassword, password: newPassword } = changeUserPasswordInput;
    const errors = await validateFormInput(changeUserPasswordInput, changeUserPasswordSchema);
    const passwordManager = new PasswordManager();
    const isValidPassword = await passwordManager.compare(user.password, oldPassword);
    if (!isValidPassword) {
      errors.push({
        field: "oldPassword",
        message: "Password is incorrect.",
      });
    }
    if (oldPassword === newPassword) {
      errors.push({
        field: "password",
        message: "New password must be different from old password.",
      });
    }
    if (errors.length > 0) {
      return { errors };
    }

    // Update user password
    await User.update({ id: userId }, { password: await passwordManager.toHash(newPassword) });

    // Return user
    return { user };
  };
}
