import { InternalServerError } from "@monorepo/errors";
import { PROD, SERVER_PORT } from "./lib/constants";
import { initializeDatabase, logger } from "./lib/utils";
import { createApolloExpressServer } from "./server";

/**
 * Main application function. Bootstraps the server application.
 *
 * Initializes database connection, starts apollo server, applies Apollo Server middleware and starts Express server.
 */
export async function bootstrap(): Promise<void> {
  try {
    const { apolloServer, app } = await createApolloExpressServer();

    // Initialize database connection
    await initializeDatabase();

    // Start Apollo Server. Without this, Apollo will throw an error.
    await apolloServer.start();

    // Apply Apollo Server middlewares
    apolloServer.applyMiddleware({
      app,
      cors: false,
    });

    // Start Express Server on port "SERVER_PORT"
    app.listen(SERVER_PORT, () => {
      if (PROD) {
        logger.info(`Server started on port ${SERVER_PORT}.`);
      } else {
        logger.info(
          `Server started on port ${SERVER_PORT}! Playground available at http://localhost:${SERVER_PORT}${apolloServer.graphqlPath}`
        );
      }
    });
  } catch (error) {
    logger.error("Server failed to start: %s", error);
    throw new InternalServerError("Error bootstrapping server");
  }
}
