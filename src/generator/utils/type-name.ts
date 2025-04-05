/**
 * Get the name of the typescript type from the GraphQL type. This can either me a primitive or a
 * custom type generated earlier.
 */

import { generateScalarType } from "../types/scalars.js";
import { isListType, isNonNullType, isScalarType } from "graphql";
import type { GraphQLInputType, GraphQLOutputType } from "graphql";

export function getTypeName(type: GraphQLInputType | GraphQLOutputType, prefix?: string): string {
    let currentType = type;

    if (isNonNullType(currentType)) {
        currentType = currentType.ofType;
    }

    if (isListType(currentType)) {
        currentType = currentType.ofType;

        if (isNonNullType(currentType)) {
            currentType = currentType.ofType;
        }
    }

    /* Convert the GraphQL type to a typescript type */

    let typeName = "";

    if (isNonNullType(currentType) || isListType(currentType)) {
        throw new Error("Failed to correctly strip type of modifiers in previous step");
    } else if (isScalarType(currentType)) {
        typeName = generateScalarType(currentType);
    } else {
        typeName = prefix ? `${prefix}.${currentType.name}` : currentType.name;
    }

    return typeName;
}
