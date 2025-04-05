/**
 * Turn a GraphQL scalar type into the appropriate typescript type.
 *
 * This is the only function that actually needs to map any types, and it is also called to turn
 * object key types into their typescript types.
 *
 * In the future it would make sense to allow to override these settings, but for now we'll just
 * stick with the defaults created by `graphql-codegen`
 */

import type { GraphQLScalarType } from "graphql";

export function generateScalarType(scalarType: GraphQLScalarType): string {
    const scalarName = scalarType.name;

    switch (scalarName) {
        case "Int":
            return "number";

        case "Float":
            return "number";

        case "String":
            return "string";

        case "Boolean":
            return "boolean";

        case "ID":
            return "string";

        default:
            return "any";
    }
}
