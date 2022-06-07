import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { Service } from "typedi";
import { User } from "../../entity";
import { IsAuthenticated, RateLimit } from "../../lib/middleware";
import { AuthFormResponse, MyContext } from "../../types";
import {
  ChangeUserPasswordInput,
  LoginUserInput,
  RegisterUserInput,
  ResetUserPasswordInput,
  SendNewConfirmationCodeInput,
} from "./inputs";
import { UserService } from "./user.service";

@Service()
@Resolver(() => User)
/**
 * Represents User GraphQL Resolver.
 */
export class UserResolver {
  /**
   * Init user service.
   * @param {UserService} userService - Service that provides methods which performs business logic for the user resolver.
   */
  constructor(private readonly userService: UserService) {}

  /**
   * User: Email field resolver.
   * Resolves user email field only if user is authenticated and is
   * requesting own email.
   * @param {User} user - User entity (roor object from which to derive the field).
   * @param {MyContext} ctx - Our GraphQL context.
   * @return {string} - User email, if authenticated. Otherwise, an empty string.
   */
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext): string {
    // This is the current user, it's okay to them their own email.
    if (req.session.userId === user.id) return user.email;
    return ""; // Current user wants to see someone else's email.
  }

  /**
   * Get Current User Query.
   * @param {MyContext} ctx - Our GraphQL context.
   * @return {Promise<User | null>} Promise that resolves to a user or null.
   */
  @Query(() => User, { nullable: true })
  async getCurrentUser(@Ctx() ctx: MyContext): Promise<User | null> {
    return this.userService.getCurrentUser(ctx);
  }

  /**
   * Register User Mutation.
   * @param {RegisterUserInput} registerUserInput - Object of type RegisterUserInput.
   * @param {MyContext} ctx - Our GraphQL context.
   * @return {Promise<AuthFormResponse>} Promise that resolves to an AuthFormResponse.
   */
  @Mutation(() => AuthFormResponse)
  @RateLimit({
    max: 5, // 5 requests
    window: 60 * 1, // 1 minute
    limitByVariables: true, // Only limit if the user is using the same input over and over.
    errorMessage:
      "Seems like you're trying to register to often! Please try again later or with different values.",
  })
  async registerUser(
    @Arg("registerUserInput") registerUserInput: RegisterUserInput,
    @Ctx() ctx: MyContext
  ): Promise<AuthFormResponse> {
    return this.userService.register(registerUserInput, ctx);
  }

  /**
   * Login User Mutation.
   * @param {LoginUserInput} loginUserInput - Object of type LoginUserInput.
   * @param {MyContext} ctx - Our GraphQL context.
   * @return {Promise<AuthFormResponse>} Promise that resolves to an AuthFormResponse .
   */
  @Mutation(() => AuthFormResponse)
  async loginUser(
    @Arg("loginUserInput") loginUserInput: LoginUserInput,
    @Ctx() ctx: MyContext
  ): Promise<AuthFormResponse> {
    return this.userService.login(loginUserInput, ctx);
  }

  /**
   * Logout User Mutation.
   * @param {MyContext} ctx - Our GraphQL context.
   * @return {Promise<boolean>} Promise that resolves to true if cookie successfully destroyed.
   */
  @Mutation(() => Boolean)
  async logoutUser(@Ctx() ctx: MyContext): Promise<boolean> {
    return this.userService.logout(ctx);
  }

  /**
   * Send New Confirmation Code Mutation.
   * @param {SendNewConfirmationCodeInput} sendNewConfirmationCodeInput - Object of type SendNewConfirmationCodeInput.
   * @param {MyContext} ctx - Our GraphQL context.
   * @return {Promise<boolean>} Promise that resolves to true if email successfully sent, false otherwise.
   */
  @Mutation(() => Boolean)
  async sendNewConfirmationCode(
    @Arg("sendNewConfirmationCodeInput") sendNewConfirmationCodeInput: SendNewConfirmationCodeInput,
    @Ctx() ctx: MyContext
  ): Promise<boolean> {
    return this.userService.sendNewConfirmationEmail(sendNewConfirmationCodeInput, ctx);
  }

  /**
   * Confirm User Email Mutation.
   * @param {string} code - Confirmation code sent to user email upon register.
   * @param {MyContext} ctx - Our GraphQL context.
   * @return {Promise<AuthFormResponse>}
   */
  @Mutation(() => AuthFormResponse)
  async confirmUserEmail(
    @Arg("code") code: string,
    @Ctx() ctx: MyContext
  ): Promise<AuthFormResponse> {
    return this.userService.confirmUserEmail(code, ctx);
  }

  /**
   * Send Password Reset Email Mutation.
   * @param {string} email - User email to send reset link to.
   * @param {MyContext} ctx - Our GraphQL context.
   * @return {Promise<boolean>} Promise that resolves to true if email successfully sent, false otherwise.
   */
  @Mutation(() => Boolean)
  async sendPasswordResetEmail(
    @Arg("email") email: string,
    @Ctx() ctx: MyContext
  ): Promise<boolean> {
    return this.userService.sendPasswordResetEmail(email, ctx);
  }

  /**
   * Reset User Password Mutation.
   * @param {ResetUserPasswordInput} resetUserPasswordInput - Object of type ResetUserPasswordInput.
   * @param {MyContext} ctx - Our GraphQL context.
   * @return {Promise<AuthFormResponse>} Promise that resolves to an AuthFormResponse.
   */
  @Mutation(() => AuthFormResponse)
  async resetUserPassword(
    @Arg("resetPasswordInput") resetUserPasswordInput: ResetUserPasswordInput,
    @Ctx() ctx: MyContext
  ): Promise<AuthFormResponse> {
    return this.userService.resetPassword(resetUserPasswordInput, ctx);
  }

  /**
   * Change User Password Mutation.
   * @param {ChangeUserPasswordInput} changeUserPasswordInput - Object of type ChangeUserPasswordInput.
   * @param {MyContext} ctx - Our GraphQL context.
   * @return {Promise<AuthFormResponse>} Promise that resolves to an AuthFormResponse.
   */
  @Mutation(() => AuthFormResponse)
  @UseMiddleware(IsAuthenticated)
  async changeUserPassword(
    @Arg("changeUserPasswordInput") changeUserPasswordInput: ChangeUserPasswordInput,
    @Ctx() ctx: MyContext
  ): Promise<AuthFormResponse> {
    return this.userService.changeUserPassword(changeUserPasswordInput, ctx);
  }
}
