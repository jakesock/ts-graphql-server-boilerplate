import { Field, InputType } from "type-graphql";
import { User } from "../../../entity";

@InputType()
/**
 * Represents User Login input type.
 */
export class LoginUserInput implements Partial<User> {
  [key: string]: unknown;

  // Username or Email
  @Field()
  usernameOrEmail!: string;

  // Password
  @Field()
  password!: string;
}
