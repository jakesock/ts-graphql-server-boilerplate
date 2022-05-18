import {
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core";
import { ApolloServer, ExpressContext } from "apollo-server-express";
import cors from "cors";
import express, { Express } from "express";
import { fieldExtensionsEstimator, simpleEstimator } from "graphql-query-complexity";
import { createComplexityPlugin } from "graphql-query-complexity-apollo-plugin";
import { corsConfig } from "./lib/config";
import { PROD } from "./lib/constants";
import { buildSchema } from "./lib/utils";

type CreateApolloExpressServerReturnType = Promise<{
  app: Express;
  apolloServer: ApolloServer<ExpressContext>;
}>;

/**
 * Creates and returns a new Apollo Server and Express App.
 *
 * Defines Express App and Apollo Server, applies express middleware,
 * creates our GraphQL schema, and returns the Apollo Server and Express App.
 * @return {CreateApolloExpressServerReturnType} Promise that resolves to an object containing the Apollo Server and Express App.
 */
export async function createApolloExpressServer(): CreateApolloExpressServerReturnType {
  // Define Express App
  const app = express();

  // Apply express middlewares
  app.use(cors(corsConfig));

  // Define Apollo Server and GraphQL Schema
  const schema = await buildSchema();
  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }) => ({
      req,
      res,
    }),
    plugins: [
      // Allow query complexity limiting
      // TODO: After creating front-end queries/mutations, come back and change max complexity to reflect said queries/mutations
      createComplexityPlugin({
        schema,
        estimators: [fieldExtensionsEstimator(), simpleEstimator({ defaultComplexity: 1 })],
        maximumComplexity: 1000,
        onComplete: (complexity) => {
          // eslint-disable-next-line no-console
          console.log("Query Complexity:", complexity);
        },
      }),
      PROD
        ? ApolloServerPluginLandingPageDisabled()
        : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
  });

  return {
    app,
    apolloServer,
  };
}
