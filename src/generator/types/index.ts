/**
 * Generate the types for the schema
 */

import { generateObjectType } from "./objects.js";
import { generateInterfaceType } from "./interfaces.js";
import { generateUnionType } from "./unions.js";

import { isInterfaceType, isObjectType, isUnionType } from "graphql";
import type { GraphQLSchema } from "graphql";

export function generateSchemaTypes(schema: GraphQLSchema) {
    const typeMap = schema.getTypeMap();
    const generatedTypes: string[] = [];

    for (const graphqlType of Object.values(typeMap)) {
        const typeName = graphqlType.name;

        /* Skip built-in GraphQL types that start with __ */
        if (typeName.startsWith("__")) {
            continue;
        }

        if (isObjectType(graphqlType)) {
            const generatedObjectType = generateObjectType(schema, graphqlType);
            generatedTypes.push(generatedObjectType);

            continue;
        }

        if (isInterfaceType(graphqlType)) {
            const generatedInterfaceType = generateInterfaceType(schema, graphqlType);
            generatedTypes.push(generatedInterfaceType);

            continue;
        }

        if (isUnionType(graphqlType)) {
            const generatedUnionType = generateUnionType(graphqlType);
            generatedTypes.push(generatedUnionType);

            continue;
        }
    }

    const fileHeaders = [
        "/* File auto-generated using [graphql-flow](https://github.com/ecom-labs-hq/graphql-flow) */",
        'import type * as BaseTypes from "./base-types.js";',
        'import type * as InputTypes from "./input-types.js";',
    ];

    return [...fileHeaders, ...generatedTypes].join("\n\n");
}
