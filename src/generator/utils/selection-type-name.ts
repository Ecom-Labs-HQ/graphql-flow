/**
 * Get the selection type from the GraphQL type. For scalars we simply return true
 */

import { isListType, isNonNullType, isScalarType } from "graphql";
import type { GraphQLInputType, GraphQLOutputType } from "graphql";

export function getSelectionTypeName(type: GraphQLInputType | GraphQLOutputType): string {
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
        return "true";
    } else {
        typeName = `SelectionTypes.${currentType.name}Selection`;
    }

    return typeName;
}
