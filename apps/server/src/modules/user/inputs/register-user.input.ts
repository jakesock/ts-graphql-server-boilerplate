import { Field, InputType } from "type-graphql";
import { User } from "../../../entity";
import { PasswordInput } from "./shared";

@InputType()
/**
 * Represents Register User input type.
 */
export class RegisterUserInput extends PasswordInput implements Partial<User> {
  [key: string]: unknown;

  // Username
  @Field()
  username!: string;

  // Email
  @Field()
  email!: string;

  // Confirm Email
  @Field()
  confirmEmail!: string;
}
