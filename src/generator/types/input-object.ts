/**
 * Generate the input object types.
 *
 * This function is the same as generating the objects, with two distinctions:
 *   1. Input objects cannot implement interfaces
 *   2. If a value is not required, it should also be optional
 *
 * Apart from those differences, we can do the same thing as we would for the objects.
 */

import { isNonNullType } from "graphql";
import { generateFieldType } from "./field-types.js";
import { generateTypeComment } from "../utils/generate-comment.js";
import type { GraphQLInputObjectType } from "graphql";

export function generateInputObjectType(inputObjectType: GraphQLInputObjectType) {
    const typeName = inputObjectType.name;
    const fields = inputObjectType.getFields();

    const fieldDefinitions = Object.values(fields).map((field) => {
        const fieldType = field.type;
        const tsType = generateFieldType(fieldType);

        const isRequired = isNonNullType(fieldType);
        const fieldName = isRequired ? field.name : `${field.name}?`;

        const fieldComment = generateTypeComment(field.description);
        const fieldDefinition = `${fieldName}: ${tsType}`;

        return `${fieldComment}\n        ${fieldDefinition}`;
    });

    const typeComment = generateTypeComment(inputObjectType.description);

    return `${typeComment}\nexport type ${typeName} = {\n${fieldDefinitions.join("\n\n")}\n}`;
}
