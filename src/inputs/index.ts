/**
 * Generate the inputs for the mutations. The input is the data passed to the mutation which will
 * usually be used to peform a C/U/D operation.
 *
 * Similar to the query arguments, all fields that are nullable are also optional, so only the that
 * typescript doesn't complain about missing (not required) values.
 */

import { isNonNullType } from "graphql";
import { capitalize } from "../utils/capitalize.js";
import { generateFieldType } from "../types/field-types.js";
import { generateTypeComment } from "../utils/generate-comment.js";
import type { GraphQLSchema } from "graphql";

export function generateMutationInputs(schema: GraphQLSchema) {
    const mutationType = schema.getMutationType();

    if (!mutationType) {
        return "";
    }

    const allMutations = mutationType.getFields();
    const mutationInputTypes: string[] = [];

    for (const mutation of Object.values(allMutations)) {
        const mutationName = capitalize(mutation.name);
        const mutationInput = mutation.args;

        if (mutationInput.length === 0) {
            const inlineType = `export type ${mutationName}Input = Record<string, never>;`;

            mutationInputTypes.push(inlineType);
            continue;
        }

        const fieldDefinitions = mutationInput.map((input) => {
            const fieldType = input.type;
            const tsType = generateFieldType(fieldType, "Types");

            const isRequired = isNonNullType(fieldType);
            const fieldName = isRequired ? input.name : `${input.name}?`;

            const fieldComment = generateTypeComment(input.description);
            const fieldDefinition = `${fieldName}: ${tsType}`;

            return `${fieldComment}\n    ${fieldDefinition}`;
        });

        const generatedType = `export type ${mutationName}Input = {\n${fieldDefinitions.join("\n\n")}\n};`;

        mutationInputTypes.push(generatedType);
    }

    const fileHeaders = [
        "/* File auto-generated using [graphql-flow](https://github.com/ecom-labs-hq/graphql-flow) */",
        "/* eslint-disable @typescript-eslint/no-explicit-any */",
        'import * as Types from "./types.js"',
    ];

    return [...fileHeaders, ...mutationInputTypes].join("\n\n");
}
