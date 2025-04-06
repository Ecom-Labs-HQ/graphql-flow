#!/usr/bin/env node

import fs from "node:fs";
import { buildSchema } from "graphql";
import { program } from "commander";

import { generateSchemaTypes } from "./generator/types/index.js";
import { generateQueryArguments } from "./generator/arguments/index.js";
import { generateFieldArguments } from "./generator/arguments/field-arguments.js";
import { generateMutationInputs } from "./generator/inputs/index.js";
import { generateSelectionTypes } from "./generator/selection/index.js";

import { generateArgumentMaps } from "./generator/arguments/type-maps.js";
import { generateFieldArgumentMaps } from "./generator/arguments/field-type-maps.js";
import { generateInputMaps } from "./generator/inputs/type-maps.js";

import { generateQueryClient } from "./generator/client/query-client.js";
import { generateMutationClient } from "./generator/client/mutation-client.js";
import { generateFullClient } from "./generator/client/full-client.js";

program
    .version("1.0.0")
    .description("GraphQL Flow - Generate a simple GraphQL client from a schema")
    .requiredOption("-s, --schema <path>", "Path to the GraphQL schema file")
    .requiredOption("-o, --output <path>", "Output path for the generated client")
    .action((options) => {
        fs.mkdirSync(options.output, { recursive: true });

        /* Read the schema from the path and create the AST node */
        const schemaContent = fs.readFileSync(options.schema, {
            encoding: "utf-8",
        });

        const schema = buildSchema(schemaContent);

        /* Generate the types */

        fs.mkdirSync(options.output + "/types", { recursive: true });

        const generatedTypes = generateSchemaTypes(schema);
        fs.writeFileSync(options.output + "/types/base-types.ts", generatedTypes);

        const generatedQueryArguments = generateQueryArguments(schema);
        fs.writeFileSync(options.output + "/types/query-arguments.ts", generatedQueryArguments);

        const generatedFieldArguments = generateFieldArguments(schema);
        fs.writeFileSync(options.output + "/types/field-arguments.ts", generatedFieldArguments);

        const generatedMutationInputs = generateMutationInputs(schema);
        fs.writeFileSync(options.output + "/types/mutation-inputs.ts", generatedMutationInputs);

        const generatedSelectionTypes = generateSelectionTypes(schema);
        fs.writeFileSync(options.output + "/types/selection-types.ts", generatedSelectionTypes);

        /* Generate the argument and input type maps */

        fs.mkdirSync(options.output + "/type-maps", { recursive: true });

        const generatedArgumentMaps = generateArgumentMaps(schema);
        fs.writeFileSync(options.output + "/type-maps/argument-maps.ts", generatedArgumentMaps);

        const generatedFieldArgumentMaps = generateFieldArgumentMaps(schema);
        fs.writeFileSync(
            options.output + "/type-maps/field-argument-maps.ts",
            generatedFieldArgumentMaps
        );

        const generatedInputMaps = generateInputMaps(schema);
        fs.writeFileSync(options.output + "/type-maps/input-maps.ts", generatedInputMaps);

        /* Generate the clients */

        fs.mkdirSync(options.output + "/client", { recursive: true });

        const generatedQueries = generateQueryClient(schema);
        fs.writeFileSync(options.output + "/client/query-client.ts", generatedQueries);

        const generatedMutations = generateMutationClient(schema);
        fs.writeFileSync(options.output + "/client/mutation-client.ts", generatedMutations);

        const generatedClient = generateFullClient();
        fs.writeFileSync(options.output + "/client/full-client.ts", generatedClient);

        /* Copy the runtime directory to include all required functions */
        fs.cpSync(import.meta.dirname + "/runtime", options.output + "/runtime", {
            recursive: true,
        });
    });

program.parse(process.argv);
