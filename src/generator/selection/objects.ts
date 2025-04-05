/**
 * Generate the selection schema for an object.
 *
 * We can go through the object normally, generating each key. The type of the key doesn't matter,
 * since the generated code will always be `true`.
 *
 * Interfaces need to be added just like when generating the types, so that the selecion type
 * includes all relevant fields.
 */

import { generateFieldSelection } from "./field-selections.js";
import { generateTypeComment } from "../utils/generate-comment.js";
import type { GraphQLObjectType, GraphQLSchema } from "graphql";

export function generateObjectSelection(
    schema: GraphQLSchema,
    objectType: GraphQLObjectType
): string {
    const typeName = objectType.name;
    const implementedInterfaces = objectType.getInterfaces();
    const fields = objectType.getFields();

    const fieldDefinitions = Object.values(fields).map((field) => {
        const fieldComment = generateTypeComment(field.description);
        const fieldSelection = generateFieldSelection(schema, field);

        return `${fieldComment}\n${fieldSelection}`;
    });

    const typenameField = ` __typename?: true`;
    fieldDefinitions.unshift(typenameField);

    const interfaceExtensions =
        implementedInterfaces.length > 0
            ? " & " + implementedInterfaces.map((i) => i.name + "Selection").join(" & ")
            : "";

    const typeComment = generateTypeComment(objectType.description);

    return `${typeComment}\nexport type ${typeName}Selection = {\n${fieldDefinitions.join("\n\n")}\n}${interfaceExtensions}`;
}
