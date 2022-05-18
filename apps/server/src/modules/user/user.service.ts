import { SendMailOptions } from "nodemailer";
import { Service } from "typedi";
import { User } from "../../entity";
import { createConfirmationCode, PasswordManager, sendEmail } from "../../lib/utils";
import { AuthFormResponse, MyContext } from "../../types";
import { RegisterUserInput } from "./inputs";
import { validateRegister } from "./utils/validate-register";

@Service()
/**
 * Represents UserService, a service providing business logic
 * for the User GraphQL Resolver.
 */
export class UserService {
  /**
   * Get current user service.
   * Retrieves the currently logged in user.
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
   * Registers a new user.
   *
   * Validates input, hashes password, creates a new
   * user entity, and sends a confirmation email to user.
   * @param {RegisterUserInput} registerUserInput - Object of type RegisterUserInput.
   * @param {MyContext} ctx - Our GraphQL context.
   * @return {Promise<UserResponse>} Promise that resolves to a UserResponse.
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
}
