// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */

import "dotenv/config";
import path from "node:path";
import { DataSource, DataSourceOptions } from "typeorm";

/**
 * Setup a connection to the test database.
 * @param {boolean} dropDatabase - Whether to drop the database before setting up the connection or not.
 * @return {Promise<DataSource>} Promise that resolves to a DataSource instance.
 */
export function testConnection(dropDatabase = false): Promise<DataSource> {
  const testDataSourceOptions: DataSourceOptions = {
    name: "default",
    type: "postgres",
    host: "localhost",
    port: 5432,
    database: process.env.TEST_DB,
    username: process.env.TEST_DB_USER,
    password: process.env.TEST_DB_PASSWORD,
    synchronize: dropDatabase,
    dropSchema: dropDatabase,
    entities: [path.join(__dirname, "../../**/*.entity{.ts,.js}")],
  };

  const TestDataSource = new DataSource(testDataSourceOptions);
  return TestDataSource.initialize();
}
