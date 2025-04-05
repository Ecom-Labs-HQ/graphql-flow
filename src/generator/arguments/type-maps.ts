/**
 * Generate a mapping for each argument to its GraphQL type.
 *
 * This is different from the typescript types, because this code will be needed at **runtime**,
 * when creating the query variables.
 */

import { generateTypeComment } from "../utils/generate-comment.js";
import type { GraphQLSchema } from "graphql";

export function generateArgumentMaps(schema: GraphQLSchema) {
    const queryType = schema.getQueryType();

    if (!queryType) {
        return "";
    }

    const allQueries = queryType.getFields();
    const queryArgumentTypes: string[] = [];

    for (const query of Object.values(allQueries)) {
        const queryArguments = query.args;

        if (queryArguments.length === 0) {
            const inlineType = `export const ${query.name}ArgumentMap = {};`;

            queryArgumentTypes.push(inlineType);
            continue;
        }

        const fieldDefinitions = queryArguments.map((field) => {
            const fieldName = field.name;
            const fieldType = field.type;

            const fieldComment = generateTypeComment(field.description);
            const fieldDefinition = `${fieldName}: "${fieldType}",`;

            return `${fieldComment}\n    ${fieldDefinition}`;
        });

        const generatedType = `export const ${query.name}ArgumentMap = {\n${fieldDefinitions.join("\n\n")}\n};`;

        queryArgumentTypes.push(generatedType);
    }

    const fileHeaders = [
        "/* File auto-generated using [graphql-flow](https://github.com/ecom-labs-hq/graphql-flow) */",
    ];

    return [...fileHeaders, ...queryArgumentTypes].join("\n\n");
}
