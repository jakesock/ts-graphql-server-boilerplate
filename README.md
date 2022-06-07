# Typescript/GraphQL Auth Server Boilerplate

## TODO:

- [x] Add logging capabilities (winston, no need to print logs into files or a db for now as this is just a boilerplate)
- [ ] Update docs
  - [ ] @monorepo/server docs
  - [ ] @monorepo/config docs
  - [ ] @monorepo/tsconfig docs
  - [ ] @monorepo/yup-schemas docs
  - [ ] @monorepo/errors docs
  - [ ] update root README.md
- [ ] Update CI process
  - [x] Add a test script to run all tests
  - [x] create build pipeline to build apps and their package dependencies
  - [x] add verbose pre-push hook (messages to console, check lint, check format, check types, run tests, check build)
  - [x] add messages to console on pre-commit
  - [x] commitlint
  - [ ] check branch name on pre-push
  - [ ] MAYBE?: circleci
  - [ ] github actions
