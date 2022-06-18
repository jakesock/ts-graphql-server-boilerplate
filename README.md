# Typescript/GraphQL Auth Server Boilerplate

A boilerplate monorepo containing a GraphQL Auth Server using Typescript, TypeORM, PostgreSQL and Redis.

## Features

- Authentication using session cookies (Register, Login, Logout, Reset/Forgot Password, Change Password)
- Email verification and communication using redis for token storage
- Rate limiting
- GraphQL query complexity limit
- Input validation and regulated error handling/responses
- Logging using winston (barebones implementation logging to console)

## Packages and Apps

- [apps/server](https://github.com/jakesock/ts-graphql-server-boilerplate/tree/main/apps/server#readme): GraphQL Auth Server
- [packages/errors](https://github.com/jakesock/ts-graphql-server-boilerplate/tree/main/packages/errors#readme): Custom error types and responses to be used throughout apps
- [packages/yup-schemas](https://github.com/jakesock/ts-graphql-server-boilerplate/tree/main/packages/yup-schemas#readme): Yup schemas for input validation
- [packages/config](https://github.com/jakesock/ts-graphql-server-boilerplate/tree/main/packages/config#readme): ESLint Configuration files
- [packages/tsconfig](https://github.com/jakesock/ts-graphql-server-boilerplate/tree/main/packages/tsconfig#readme): A collection of tsconfig.json files for different environments

## Installation

This project uses yarn v2 for dependency and workspace (monorepo) management. For more information on installing yarn, visit [their website](https://yarnpkg.com/getting-started/install).

1. Clone the repository

```
git clone https://github.com/jakesock/ts-graphql-server-boilerplate.git
```

2. Change to the root directory of the repository

```
cd ts-graphql-server-boilerplate
```

3. Install package dependencies

```
yarn workspaces focus @monorepo/errors @monorepo/yup-schemas @monorepo/config @monorepo/tsconfig
```

4. Build the packages the server app will use

```
  yarn run errors:build && yarn run yup-schemas:build
```

4. Install rest of dependencies

```
yarn install
```

5. Start the PostgreSQL server on your local machine and create a dev and test database.

```
createdb <YOUR_DATABASE_NAME>
```

8. Install and start the Redis Server on your local machine.

9. Create a .env file in the apps/server folder and copy the contents of .env.example into it. Fill out the port and database connection information.

10. Visit [Ethereal Email](https://ethereal.email) and generate email credentials. Fill out the email variables in the .env file. Finish by filling out the session secreate and frontend url variables.

11. At the root of the project, run this command to build the packages and server:

```
yarn run build
```

## Running the development server

1. In one terminal window, change directories to the apps/server folder and run this command:

```
yarn run build:watch
```

2. In a second terminal window (still in the apps/server folder), run this command to start the development server:

```
  yarn run dev
```

## TODO:

- [x] Add logging capabilities (winston, no need to print logs into files or a db for now as this is just a boilerplate)
- [ ] CI
  - [x] Add a test script to run all tests
  - [x] create build pipeline to build apps and their package dependencies
  - [x] add verbose pre-push hook (messages to console, check lint, check format, check types, run tests, check build)
  - [x] add messages to console on pre-commit
  - [x] commitlint
  - [ ] check branch name on pre-push
  - [ ] MAYBE?: circleci
  - [ ] github actions
- [ ] Update docs
  - [ ] @monorepo/server docs
  - [ ] @monorepo/config docs
  - [ ] @monorepo/tsconfig docs
  - [ ] @monorepo/yup-schemas docs
  - [ ] @monorepo/errors docs
  - [ ] update root README.md
