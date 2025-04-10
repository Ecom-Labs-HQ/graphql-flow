/**
 * Convert a GraphQL type to a typescript type by correctly updating the array and non-null
 * modifiers
 */

import { isEnumType, isInputType, isListType, isNonNullType, isScalarType } from "graphql";
import type { GraphQLInputType, GraphQLOutputType } from "graphql";

export function convertGraphQLType(graphqlType: GraphQLOutputType | GraphQLInputType) {
    let isArrayType = false;
    let arrayIsNullable = true;
    let itemsAreNullable = true;

    let baseType = graphqlType;

    if (isNonNullType(baseType)) {
        arrayIsNullable = false;
        baseType = baseType.ofType;
    }

    if (isListType(baseType)) {
        isArrayType = true;
        baseType = baseType.ofType;

        if (isNonNullType(baseType)) {
            itemsAreNullable = false;
            baseType = baseType.ofType;
        }
    }

    if (isNonNullType(baseType) || isListType(baseType)) {
        throw new Error("Failed to correctly strip type of modifiers in previous step");
    }

    let typescriptType = baseType.toString();
    typescriptType =
        isScalarType(baseType) || isEnumType(baseType)
            ? `BaseTypes.${typescriptType}`
            : isInputType(baseType)
              ? `InputTypes.${typescriptType}`
              : typescriptType;

    if (isArrayType) {
        typescriptType = `Array<${typescriptType}${itemsAreNullable ? " | null" : ""}>`;
    }

    if (arrayIsNullable) {
        typescriptType = `${typescriptType} | null`;
    }

    return {
        baseType:
            isScalarType(baseType) || isEnumType(baseType) ? `BaseTypes.${baseType}` : baseType,
        typescriptType,
    };
}
