import { Field, InputType } from "type-graphql";
import { User } from "../../../entity";
import { PasswordInput } from "./shared";

@InputType()
/**
 * Represents Reset User Password input type.
 */
export class ResetUserPasswordInput extends PasswordInput implements Partial<User> {
  [key: string]: unknown;

  // Reset password token
  @Field()
  token!: string;
}
