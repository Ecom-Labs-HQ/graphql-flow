/**
 * Create the scalars and enums
 */

import { generateScalarType } from "./scalars.js";
import { generateEnumType } from "./enums.js";
import { isEnumType, isScalarType } from "graphql";
import type { GraphQLSchema } from "graphql";

export function generateBaseTypes(schema: GraphQLSchema) {
    const typeMap = schema.getTypeMap();
    const typeArray = Object.values(typeMap);

    const filteredTypeArray = typeArray.filter((type) => !type.name.startsWith("__"));

    const scalarTypes = filteredTypeArray.filter(isScalarType).map(generateScalarType);
    const enumTypes = filteredTypeArray.filter(isEnumType).map(generateEnumType);

    return [...scalarTypes, ...enumTypes].join("\n\n");
}
