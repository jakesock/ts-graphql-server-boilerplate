# @monorepo/server

An Express GraphQL server boilerplate that contains boilerplate logic for authentication/authorization.

## Installation and Usage

Visit the root README.md file for installation and usage instructions.

## Notes

The server uses yarn workspaces to manage local package dependencies. In the package.json file under dependencies and dev depencencies, you can see the packages that are used by the server. To install new packages, add the name given to them in their respective package.json files along with their version using workspaces:VERSION_NUMBER(\* for latest).
