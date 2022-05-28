import { Field, InputType } from "type-graphql";

@InputType()
/**
 * Represents graphql input type for sendNewConfirmationCode mutation.
 */
export class SendNewConfirmationCodeInput {
  @Field()
  userId!: string;

  @Field()
  userEmail!: string;
}
