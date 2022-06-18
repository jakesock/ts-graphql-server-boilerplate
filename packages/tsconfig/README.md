# @abb/tsconfig

These are base tsconfig.json files from which all other tsconfig.json files inherit from.

## Usage

To use one of these tsconfigs, create a tsconfig.json file within a package or app and extend the desired tsconfig within this package like so:

```json
{
  "extends": "@monorepo/tsconfig/node.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

To create a new shared tsconfig, make a json file and add the $schema field to your json object, give it a name in the display field, and extend the base.json file like this:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Next.js",
  "extends": "./base.json",
  ...tsconfig,
}
```
