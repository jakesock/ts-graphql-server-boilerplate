import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Service } from "typedi";
import { User } from "../../entity";
import { AuthFormResponse, MyContext } from "../../types";
import { RegisterUserInput } from "./inputs";
import { UserService } from "./user.service";

@Service()
@Resolver(() => User)
/**
 * Represents User GraphQL Resolver.
 */
export class UserResolver {
  /**
   * Init user service.
   * @param {UserService} userService - Service that provides methods which perform business logic for the user resolver.
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
   * @return {Promise<UserResponse>} Promise that resolves to a UserResponse.
   */
  @Mutation(() => AuthFormResponse)
  async registerUser(
    @Arg("registerUserInput") registerUserInput: RegisterUserInput,
    @Ctx() ctx: MyContext
  ): Promise<AuthFormResponse> {
    return this.userService.register(registerUserInput, ctx);
  }
}
