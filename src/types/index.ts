/**
 * Generate the types for the schema
 */

import { generateObjectType } from "./objects.js";
import { generateInputObjectType } from "./input-object.js";
import { generateInterfaceType } from "./interfaces.js";
import { generateUnionType } from "./unions.js";
import { generateEnumType } from "./enums.js";
import { generateScalarType } from "./scalars.js";

import {
    isEnumType,
    isInputObjectType,
    isInterfaceType,
    isObjectType,
    isScalarType,
    isUnionType,
} from "graphql";
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
            const generatedObjectType = generateObjectType(graphqlType);
            generatedTypes.push(generatedObjectType);
        } else if (isInputObjectType(graphqlType)) {
            const generatedInputObjectType = generateInputObjectType(graphqlType);
            generatedTypes.push(generatedInputObjectType);
        } else if (isInterfaceType(graphqlType)) {
            const generatedInterfaceType = generateInterfaceType(graphqlType);
            generatedTypes.push(generatedInterfaceType);
        } else if (isUnionType(graphqlType)) {
            const generatedUnionType = generateUnionType(graphqlType);
            generatedTypes.push(generatedUnionType);
        } else if (isEnumType(graphqlType)) {
            const generatedEnumType = generateEnumType(graphqlType);
            generatedTypes.push(generatedEnumType);
        } else if (isScalarType(graphqlType)) {
            const inlineType = `export type ${typeName} = ${generateScalarType(graphqlType)}`;
            generatedTypes.push(inlineType);
        }
    }

    const fileHeaders = [
        "/* File auto-generated using [graphql-flow](https://github.com/ecom-labs.hq/graphql-flow) */",
        "/* eslint-disable @typescript-eslint/no-explicit-any */",
        "",
    ];

    return [...fileHeaders, ...generatedTypes].join("\n\n");
}
