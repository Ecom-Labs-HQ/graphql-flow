/**
 * Generate the types for the query arguments. The arguments are the variables that can be passed
 * to a GraphQL query, usually to sort or filter the data.
 *
 * This function generates the types for each query found in the schema, so they can be imported
 * and referenced by name in the client later.
 */

import { isNonNullType } from "graphql";
import { generateFieldType } from "../types/field-types.js";
import { generateTypeComment } from "../utils/generate-comment.js";
import type { GraphQLSchema } from "graphql";

export function generateQueryArguments(schema: GraphQLSchema) {
    const queryType = schema.getQueryType();

    if (!queryType) {
        return "";
    }

    const allQueries = queryType.getFields();
    const queryArgumentTypes: string[] = [];

    for (const query of Object.values(allQueries)) {
        const queryName = query.name;
        const queryArguments = query.args;

        if (queryArguments.length === 0) {
            const inlineType = `export type ${queryName}QueryArguments = Record<string, never>;`;

            queryArgumentTypes.push(inlineType);
            continue;
        }

        const fieldDefinitions = queryArguments.map((argument) => {
            const fieldType = argument.type;
            const tsType = generateFieldType(fieldType, "Types");

            const isRequired = isNonNullType(fieldType);
            const fieldName = isRequired ? argument.name : `${argument.name}?`;

            const fieldComment = generateTypeComment(argument.description);
            const fieldDefinition = `${fieldName}: ${tsType}`;

            return `${fieldComment}\n    ${fieldDefinition}`;
        });

        const generatedType = `export type ${queryName}QueryArguments = {\n${fieldDefinitions.join("\n\n")}\n};`;

        queryArgumentTypes.push(generatedType);
    }

    const fileHeaders = [
        "/* File auto-generated using [graphql-flow](https://github.com/ecom-labs-hq/graphql-flow) */",
        "/* eslint-disable @typescript-eslint/no-explicit-any */",
        'import * as Types from "./types.js"',
    ];

    return [...fileHeaders, ...queryArgumentTypes].join("\n\n");
}
