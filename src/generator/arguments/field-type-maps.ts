/**
 * Generate a mapping for each argument on fields of object and interface types to its GraphQL type.
 *
 * This is different from the TypeScript types, because this code will be needed at **runtime**,
 * when creating the query variables for fields within GraphQL types.
 */

import { capitalize } from "../../utils/capitalize.js";
import { generateTypeComment } from "../utils/generate-comment.js";
import { isObjectType, isInterfaceType } from "graphql";
import type { GraphQLSchema } from "graphql";

export function generateFieldArgumentMaps(schema: GraphQLSchema) {
    const allTypes = schema.getTypeMap();
    const fieldArgumentMaps: string[] = [];

    for (const type of Object.values(allTypes)) {
        if (!isObjectType(type) && !isInterfaceType(type)) {
            continue;
        }

        const typeFields = type.getFields();

        for (const field of Object.values(typeFields)) {
            const fieldArguments = field.args;
            const hasArguments = fieldArguments && fieldArguments.length > 0;

            if (!hasArguments) {
                continue;
            }

            const typeName = type.name;
            const capitalizedFieldName = capitalize(field.name);

            const fieldDefinitions = fieldArguments.map((field) => {
                const fieldName = field.name;
                const fieldType = field.type;

                const fieldComment = generateTypeComment(field.description);
                const fieldDefinition = `${fieldName}: "${fieldType}",`;

                return `${fieldComment}\n${fieldDefinition}`;
            });

            const generatedMap = `export const ${typeName}${capitalizedFieldName}ArgumentMap = {\n${fieldDefinitions.join("\n\n")}\n};`;
            fieldArgumentMaps.push(generatedMap);
        }
    }

    const fileHeaders = [
        "/* File auto-generated using [graphql-flow](https://github.com/ecom-labs-hq/graphql-flow) */",
    ];

    return [...fileHeaders, ...fieldArgumentMaps].join("\n\n");
}
