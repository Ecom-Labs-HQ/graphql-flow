#!/usr/bin/env node

import fs from "node:fs";
import { buildSchema } from "graphql";
import { program } from "commander";

import { generateBaseTypes } from "./generator/base-types/index.js";
import { generateInputTypes } from "./generator/input-objects/index.js";
import { generateSchemaTypes } from "./generator/types/index.js";

import { generateQueryClient } from "./generator/client/query-client.js";
import { generateMutationClient } from "./generator/client/mutation-client.js";
import { generateFullClient } from "./generator/client/full-client.js";

import packageJson from "../package.json" with { type: "json" };

program
    .version(packageJson.version)
    .description("GraphQL Flow - Generate a simple GraphQL client from a schema")
    .requiredOption("-s, --schema <path>", "Path to the GraphQL schema file")
    .requiredOption("-o, --output <path>", "Output path for the generated client")
    .option("-c, --clean", "Delete the output directory before generating")
    .action((options) => {
        const directoryExists = fs.existsSync(options.output);

        if (options.clean && directoryExists) {
            fs.rmSync(options.output, { recursive: true });
        }

        fs.mkdirSync(options.output, { recursive: true });

        /* Read the schema from the path and create the AST node */
        const schemaContent = fs.readFileSync(options.schema, {
            encoding: "utf-8",
        });

        const schema = buildSchema(schemaContent);

        /* Generate the types */
        fs.mkdirSync(options.output + "/types", { recursive: true });

        const generatedBaseTypes = generateBaseTypes(schema);
        const generatedInputTypes = generateInputTypes(schema);
        const generatedTypes = generateSchemaTypes(schema);

        fs.writeFileSync(options.output + "/types/base-types.ts", generatedBaseTypes);
        fs.writeFileSync(options.output + "/types/input-types.ts", generatedInputTypes);
        fs.writeFileSync(options.output + "/types/types.ts", generatedTypes);

        /* Generate the clients */
        fs.mkdirSync(options.output + "/client", { recursive: true });

        const generatedQueries = generateQueryClient(schema);
        const generatedMutations = generateMutationClient(schema);
        const generatedClient = generateFullClient();

        fs.writeFileSync(options.output + "/client/query-client.ts", generatedQueries);
        fs.writeFileSync(options.output + "/client/mutation-client.ts", generatedMutations);
        fs.writeFileSync(options.output + "/client/full-client.ts", generatedClient);

        /* Copy the runtime directory to include all required functions */
        fs.cpSync(import.meta.dirname + "/runtime", options.output + "/runtime", {
            recursive: true,
        });
    });

program.parse(process.argv);
