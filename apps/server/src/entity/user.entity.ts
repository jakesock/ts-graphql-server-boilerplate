import { Field, ObjectType } from "type-graphql";
import { Column, Entity } from "typeorm";
import { BaseEntity, TableName } from "../types";

@ObjectType()
@Entity({ name: TableName.USER })
/**
 * A class that describes the User TypeORM entity and GraphQL Object.
 */
export class User extends BaseEntity {
  @Field(() => String)
  @Column({ unique: true })
  username!: string;

  @Field(() => String)
  @Column({ type: "text", unique: true })
  email!: string;

  @Column()
  password!: string;

  @Field(() => Boolean)
  @Column({ type: "boolean", name: "is_confirmed", default: false })
  isConfirmed!: boolean;
}
