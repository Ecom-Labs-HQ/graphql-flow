/**
 * When generating an object key type, we need to check if it is nullable or an array. If so, we
 * need to return the type along with the correct modifiers.
 */

import { generateScalarType } from "./scalars.js";
import { isListType, isNonNullType, isScalarType } from "graphql";
import type { GraphQLInputType, GraphQLOutputType } from "graphql";

export function generateFieldType(type: GraphQLInputType | GraphQLOutputType, typePrefix?: string) {
    /* Strip the type of any modifiers and store them in variables */

    let isArrayType = false;
    let arrayIsNullable = true;
    let itemsAreNullable = true;

    let currentType = type;

    if (isNonNullType(currentType)) {
        arrayIsNullable = false;
        currentType = currentType.ofType;
    }

    if (isListType(currentType)) {
        isArrayType = true;
        currentType = currentType.ofType;

        if (isNonNullType(currentType)) {
            itemsAreNullable = false;
            currentType = currentType.ofType;
        }
    }

    /* Convert the GraphQL type to a typescript type */

    let typescriptType = "";

    if (isNonNullType(currentType) || isListType(currentType)) {
        throw new Error("Failed to correctly strip type of modifiers in previous step");
    } else if (isScalarType(currentType)) {
        typescriptType = generateScalarType(currentType);
    } else {
        typescriptType = typePrefix ? `${typePrefix}.${currentType.name}` : currentType.name;
    }

    /* Apply the modifiers to the type, if any */

    if (isArrayType) {
        typescriptType = `Array<${typescriptType}${itemsAreNullable ? " | null" : ""}>`;
    }

    if (arrayIsNullable) {
        typescriptType = `${typescriptType} | null`;
    }

    return typescriptType;
}
