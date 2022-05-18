import { Field, InputType } from "type-graphql";
import { User } from "../../../../entity";

@InputType()
/**
 * Represents Password input type.
 */
export class PasswordInput implements Partial<User> {
  [key: string]: unknown;

  @Field()
  password!: string;

  @Field()
  confirmPassword!: string;
}
