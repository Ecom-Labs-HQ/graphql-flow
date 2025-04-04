/**
 * Strip the type of all modifiers and check whether it is a GraphQL scalar or any other type. For
 * scalars we replace it with true, for all other types we reference it by name (+ "Selection")
 */

import { isListType, isNonNullType, isScalarType } from "graphql";
import type { GraphQLField } from "graphql";

export function generateFieldSelection(field: GraphQLField<unknown, unknown>) {
    /* Strip the type of any modifiers and store them in variables */
    let currentType = field.type;

    if (isNonNullType(currentType)) {
        currentType = currentType.ofType;
    }

    if (isListType(currentType)) {
        currentType = currentType.ofType;

        if (isNonNullType(currentType)) {
            currentType = currentType.ofType;
        }
    }

    /* Check what kind of type it is */
    if (isScalarType(currentType)) {
        return `${field.name}?: true`;
    } else {
        return `${field.name}?: ${currentType}Selection`;
    }
}
