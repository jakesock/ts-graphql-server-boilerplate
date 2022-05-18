import { ExecutionResult, graphql, GraphQLSchema } from "graphql";
import Redis from "ioredis";
import { Maybe } from "type-graphql";
import { buildSchema } from "../../lib/utils";

interface IGQLCallOptions {
  source: string;
  variableValues?: Maybe<{
    [key: string]: unknown;
  }>;
  userId?: string;
}

type GQLCallReturn = Promise<
  ExecutionResult<{ [key: string]: unknown }, { [key: string]: unknown }>
>;

let schema: GraphQLSchema;
export const redisTestClient = new Redis();

/**
 * Allows us to call GraphQL queries from our tests.
 * @param {IGQLCallOptions} options - Options for the GraphQL query.
 * @return {GQLCallReturn} Promise that resolves to the result of the GraphQL query.
 */
export async function gqlCall({ source, variableValues, userId }: IGQLCallOptions): GQLCallReturn {
  if (!schema) {
    schema = await buildSchema();
  }
  return graphql({
    schema,
    source,
    variableValues,
    contextValue: {
      req: {
        session: {
          userId,
        },
      },
      res: {
        clearCookie: jest.fn(),
      },
      redis: redisTestClient,
    },
  });
}
