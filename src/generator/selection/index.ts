/**
 * Generate the selection types.
 *
 * These are used for both the queries and mutations and specify what data should be returned by
 * the GraphQL API.
 *
 * The data selected here is then also used to infer the return type. A selection type has the
 * exact same keys as the actual type, but every value is replaced with `true` and marked as
 * optional.
 *
 * We can omit the input objects, as they can never be return in GraphQL
 */

import { generateObjectSelection } from "./objects.js";
import { generateInterfaceSelection } from "./interfaces.js";
import { generateUnionSelection } from "./unions.js";

import { isEnumType, isInterfaceType, isObjectType, isScalarType, isUnionType } from "graphql";
import type { GraphQLSchema } from "graphql";

export function generateSelectionTypes(schema: GraphQLSchema) {
    const typeMap = schema.getTypeMap();
    const generatedTypes: string[] = [];

    for (const graphqlType of Object.values(typeMap)) {
        const typeName = graphqlType.name;

        /* Skip built-in GraphQL types that start with __ */
        if (typeName.startsWith("__")) {
            continue;
        }

        if (isInterfaceType(graphqlType)) {
            const generatedInterfaceType = generateInterfaceSelection(schema, graphqlType);
            generatedTypes.push(generatedInterfaceType);
        } else if (isObjectType(graphqlType)) {
            const generatedObjectType = generateObjectSelection(schema, graphqlType);
            generatedTypes.push(generatedObjectType);
        } else if (isUnionType(graphqlType)) {
            const generatedUnionType = generateUnionSelection(schema, graphqlType);
            generatedTypes.push(generatedUnionType);
        } else if (isEnumType(graphqlType)) {
            const inlineType = `export type ${typeName}Selection = true`;
            generatedTypes.push(inlineType);
        } else if (isScalarType(graphqlType)) {
            const inlineType = `export type ${typeName}Selection = true`;
            generatedTypes.push(inlineType);
        }
    }

    const fileHeaders = [
        "/* File auto-generated using [graphql-flow](https://github.com/ecom-labs-hq/graphql-flow) */",
        "/* eslint-disable @typescript-eslint/no-explicit-any */",
        'import type { QueryArgs } from "../runtime/types.js";',
        'import type * as FieldArguments from "./field-arguments.js";',
    ];

    return [...fileHeaders, ...generatedTypes].join("\n\n");
}
