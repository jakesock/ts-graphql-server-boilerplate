// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */

import path from "node:path";
import { DataSource, DataSourceOptions } from "typeorm";
import { PROD } from "../constants";

export const ormConfig: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: PROD ? process.env.PROD_DB : process.env.DEV_DB,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  synchronize: !PROD,
  logging: !PROD,
  entities: [path.join(__dirname, "../../**/*.entity{.ts,.js}")],
  subscribers: [path.join(__dirname, "../../subscriber/**/*.{ts,js}")],
  migrations: [path.join(__dirname, "../../migration/**/*.{ts,js}")],
};

export const AppDataSource = new DataSource(ormConfig);
