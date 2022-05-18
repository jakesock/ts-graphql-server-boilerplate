import { Field, ObjectType } from "type-graphql";

@ObjectType()
/**
 * Represents FieldError, a GraphQL object type for form errors.
 */
export class FieldError {
  @Field()
  message!: string;

  @Field()
  field!: string;
}
