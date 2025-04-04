#!/usr/bin/env node

import fs from "node:fs";
import { buildSchema } from "graphql";
import { program } from "commander";
import { generateSchemaTypes } from "./types/index.js";
import { generateQueryArguments } from "./arguments/index.js";

program
    .version("1.0.0")
    .description("GraphQL Flow - Generate a simple GraphQL client from a schema")
    .requiredOption("-s, --schema <path>", "Path to the GraphQL schema file")
    .requiredOption("-o, --output <path>", "Output path for the generated client")
    .action((options) => {
        /* Read the schema from the path and create the AST node */
        const schemaContent = fs.readFileSync(options.schema, {
            encoding: "utf-8",
        });

        const schema = buildSchema(schemaContent);

        /* Generate the types */
        const generatedTypes = generateSchemaTypes(schema);
        fs.writeFileSync(options.output + "types.ts", generatedTypes);

        /* Generate the query argument types */
        const generatedQueryArguments = generateQueryArguments(schema);
        fs.writeFileSync(options.output + "query-arguments.ts", generatedQueryArguments);
    });

program.parse(process.argv);
