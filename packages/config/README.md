# @monorepo/config

This package contains eslint configuration files to be used in other packages and apps.

## Usage

Within another package or app, create a .eslintrc.js file in its root directory. Import the config file and use object spread syntax to merge it into the eslint config object. See [apps/server/eslintrc.js](https://github.com/jakesock/ts-graphql-server-boilerplate/blob/main/apps/server/.eslintrc.js) for an example.
