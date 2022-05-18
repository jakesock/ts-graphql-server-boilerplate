import { Field, ObjectType } from "type-graphql";
import { User } from "../../entity";
import { FieldError } from "./field-error";

@ObjectType()
/**
 * Represents AuthFormResponse, a GraphQL object type for form responses related to
 * user auth actions (register, login, etc).
 */
export class AuthFormResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}
