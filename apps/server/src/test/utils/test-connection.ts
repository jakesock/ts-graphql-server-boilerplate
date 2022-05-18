// TODO: Implement actual test connection

/**
 * Setup a connection to the test database.
 * @param {boolean} dropDatabase - Whether to drop the database before setting up the connection or not.
 */
export function testConnection(dropDatabase = false) {
  // eslint-disable-next-line no-console
  console.log(
    "Setting up tests by initializing test database connection. Drop Databse:",
    dropDatabase
  );
}
