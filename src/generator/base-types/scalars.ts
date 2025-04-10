/**
 * Turn a GraphQL scalar type into the appropriate typescript type.
 *
 * This is the only function that actually needs to map any types.
 *
 * In the future it would make sense to allow to override these settings, but for now we'll just
 * stick with the defaults created by `graphql-codegen`
 */

import { generateTypeComment } from "../utils/generate-comment.js";
import type { GraphQLScalarType } from "graphql";

export function generateScalarType(scalarType: GraphQLScalarType): string {
    const scalarTypeName = scalarType.name;
    const scalarDescription = generateTypeComment(scalarType.description);

    const determineTypescriptType = (name: string): string => {
        switch (name) {
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
                return "unknown";
        }
    };

    const typescriptTypeDefinition = determineTypescriptType(scalarTypeName);

    return `${scalarDescription}\nexport type ${scalarTypeName} = ${typescriptTypeDefinition}`;
}
