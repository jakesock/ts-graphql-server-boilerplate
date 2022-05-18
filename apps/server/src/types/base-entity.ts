import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity as TypeORMBaseEntity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@ObjectType()
/**
 * Represents our own base entity.
 *
 * Extends TypeORM's BaseEntity and adds id,
 * createdAt, and updatedAt columns. All entities
 * should extend from BaseEntity unless explicitly
 * unnecessary.
 */
export class BaseEntity extends TypeORMBaseEntity {
  @Field(() => String)
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Field(() => String)
  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @Field(() => String)
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
