import { GraphQLSchema } from "graphql";
import { AuthChecker, buildSchema as buildTypeGraphQLSchema, ResolverData } from "type-graphql";
import Container from "typedi";
import { UserResolver } from "../../modules/user/user.resolver";
import { MyContext } from "../../types";

/**
 * Custom AuthChecker to provide to our GraphQL Schema.
 * Determines whether a user ID is stored in a requests session info or not.
 * @param {ResolverData<MyContext>} resolverData - Object that contains GraphQL context, resolve info, args dictionary and root.
 * @return {boolean} True if userId is stored in session, false otherwise;
 */
const customAuthChecker: AuthChecker<MyContext> = ({
  context: { req },
}: ResolverData<MyContext>): boolean => {
  if (req.session.userId) return true;
  return false;
};

/**
 * Utility function that builds our GraphQL schema.
 * @return {Promise<GraphQLSchema>} A promise that resolves to the GraphQL schema.
 */
export const buildSchema = (): Promise<GraphQLSchema> =>
  buildTypeGraphQLSchema({
    resolvers: [UserResolver],
    container: Container,
    emitSchemaFile: true,
    authChecker: customAuthChecker,
  });
