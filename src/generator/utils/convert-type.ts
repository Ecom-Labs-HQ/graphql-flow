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

    let strippedType = graphqlType;

    if (isNonNullType(strippedType)) {
        arrayIsNullable = false;
        strippedType = strippedType.ofType;
    }

    if (isListType(strippedType)) {
        isArrayType = true;
        strippedType = strippedType.ofType;

        if (isNonNullType(strippedType)) {
            itemsAreNullable = false;
            strippedType = strippedType.ofType;
        }
    }

    if (isNonNullType(strippedType) || isListType(strippedType)) {
        throw new Error("Failed to correctly strip type of modifiers in previous step");
    }

    let baseType = strippedType.toString();

    if (isScalarType(strippedType) || isEnumType(strippedType)) {
        baseType = `BaseTypes.${baseType}`;
    } else if (isInputType(strippedType)) {
        baseType = `InputTypes.${baseType}`;
    }

    let inputType = baseType;

    if (isArrayType) {
        inputType = `Array<${inputType}${itemsAreNullable ? " | null" : ""}>`;
    }

    if (arrayIsNullable) {
        inputType = `${inputType} | null`;
    }

    return {
        baseType: baseType,
        strippedType: strippedType,
        inputType: inputType,
        isArray: isArrayType,
        itemsAreNullable: itemsAreNullable,
        isNullable: arrayIsNullable,
    };
}
