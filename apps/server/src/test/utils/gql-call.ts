// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-call */

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

type GQLCallReturn<T = unknown> = Promise<
  ExecutionResult<{ [key: string]: T }, { [key: string]: unknown }>
>;

let schema: GraphQLSchema;
export const redisTestClient = new Redis();

/**
 * Allows us to call GraphQL queries from our tests.
 * @param {IGQLCallOptions} options - Options for the GraphQL query.
 * @return {GQLCallReturn} Promise that resolves to the result of the GraphQL query.
 */
export async function gqlCall<T = unknown>({
  source,
  variableValues,
  userId,
}: IGQLCallOptions): GQLCallReturn<T> {
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          destroy: jest.fn().mockImplementation((fn) => fn(false)),
        },
      },
      res: {
        clearCookie: jest.fn(),
      },
      redis: redisTestClient,
    },
  });
}
