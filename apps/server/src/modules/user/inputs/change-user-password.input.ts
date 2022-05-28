import { Field, InputType } from "type-graphql";
import { User } from "../../../entity";
import { PasswordInput } from "./shared";

@InputType()
/**
 * Represents Change User Password input type.
 */
export class ChangeUserPasswordInput extends PasswordInput implements Partial<User> {
  [key: string]: unknown;

  @Field()
  oldPassword!: string;
}
