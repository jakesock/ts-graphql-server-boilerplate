import { GraphQLSchema } from "graphql";
import { buildSchema as buildTypeGraphQLSchema } from "type-graphql";
import Container from "typedi";
import { HelloResolver } from "../../modules/hello/hello.resolver";

/**
 * Utility function that builds our GraphQL schema.
 * @return {Promise<GraphQLSchema>} A promise that resolves to the GraphQL schema.
 */
export const buildSchema = (): Promise<GraphQLSchema> =>
  buildTypeGraphQLSchema({
    resolvers: [HelloResolver],
    container: Container,
    emitSchemaFile: true,
  });
