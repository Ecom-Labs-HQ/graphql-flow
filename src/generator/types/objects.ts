/**
 * Generate the types for an object.
 *
 * For each field of the object we can generate the field metadata using the shared function.
 *
 * Objects can implement interfaces, which we can just reference by name and join with the object
 * using the typescript "&" symbol.
 */

import { generateFieldType } from "./field-types.js";
import { generateTypeComment } from "../utils/generate-comment.js";
import { generateTypename } from "../utils/generate-typename.js";
import type { GraphQLObjectType, GraphQLSchema } from "graphql";

export function generateObjectType(schema: GraphQLSchema, objectType: GraphQLObjectType): string {
    const typeName = objectType.name;

    const implementedInterfaces = objectType.getInterfaces();
    const fields = objectType.getFields();

    const fieldDefinitions = Object.values(fields).map((field) => {
        const tsType = generateFieldType(schema, field);

        const fieldComment = generateTypeComment(field.description);
        const fieldDefinition = `${field.name}: ${tsType}`;

        return `${fieldComment}\n${fieldDefinition}`;
    });

    fieldDefinitions.push(`__typename: ${generateTypename(objectType.name)}`);

    const interfaceExtensions =
        implementedInterfaces.length > 0
            ? " & " + implementedInterfaces.map((i) => i.name).join(" & ")
            : "";

    const typeComment = generateTypeComment(objectType.description);

    return `${typeComment}\nexport type ${typeName} = {\n${fieldDefinitions.join("\n\n")}\n}${interfaceExtensions}`;
}
