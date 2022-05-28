import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Service } from "typedi";
import { User } from "../../entity";
import { AuthFormResponse, MyContext } from "../../types";
import { LoginUserInput, RegisterUserInput } from "./inputs";
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
}
