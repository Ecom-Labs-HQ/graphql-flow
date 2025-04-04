/**
 * Generate the types for an object.
 *
 * For each scalar value we can convert it to the appropriate typescript type. For nested objects,
 * we can just reference them by name. This also avoids ininite recursion.
 *
 * Objects can implement interfaces, which we can just reference by name and join with the object
 * using the typescript "&" symbol.
 */

import { generateFieldType } from "./field-types.js";
import { generateTypeComment } from "../utils/generate-comment.js";
import type { GraphQLObjectType } from "graphql";

export function generateObjectType(objectType: GraphQLObjectType): string {
    const typeName = objectType.name;

    const implementedInterfaces = objectType.getInterfaces();
    const fields = objectType.getFields();

    const fieldDefinitions = Object.values(fields).map((field) => {
        const tsType = generateFieldType(field.type);

        const fieldComment = generateTypeComment(field.description);
        const fieldDefinition = `${field.name}: ${tsType}`;

        return `${fieldComment}\n        ${fieldDefinition}`;
    });

    const interfaceExtensions =
        implementedInterfaces.length > 0
            ? " & " + implementedInterfaces.map((i) => i.name).join(" & ")
            : "";

    const typeComment = generateTypeComment(objectType.description);

    return `${typeComment}\ntype ${typeName} = {\n${fieldDefinitions.join("\n\n")}\n}${interfaceExtensions}`;
}
