// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-console */

import { PROD, SERVER_PORT } from "./lib/constants";
import { initializeDatabase } from "./lib/utils";
import { createApolloExpressServer } from "./server";

/**
 * Main application function. Bootstraps the server application.
 *
 * Initializes database connection, starts apollo server, applies Apollo Server middleware and starts Express server.
 */
export async function bootstrap(): Promise<void> {
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
      console.log(`Server started on port ${SERVER_PORT}.`);
    } else {
      console.log(
        `Server started on port ${SERVER_PORT}! Playground available at http://localhost:${SERVER_PORT}${apolloServer.graphqlPath}`
      );
    }
  });
}
