import { loginUserSchema } from "@monorepo/yup-schemas";
import { SendMailOptions } from "nodemailer";
import { Service } from "typedi";
import { User } from "../../entity";
import { COOKIE_NAME } from "../../lib/constants";
import {
  createConfirmationCode,
  PasswordManager,
  sendEmail,
  validateFormInput,
} from "../../lib/utils";
import { AuthFormResponse, MyContext } from "../../types";
import { invalidLoginInputErrorMessage } from "./error-messages";
import { LoginUserInput, RegisterUserInput } from "./inputs";
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
    const confirmationCode = await createConfirmationCode(newUser.id, ctx);
    const mailOptions: SendMailOptions = {
      from: '"Fred Foo 👻" <foo@example.com>',
      to: newUser.email,
      subject: "Hello ✔",
      text: "Hello world?",
      html: `<b>${confirmationCode}</b>`,
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
}
