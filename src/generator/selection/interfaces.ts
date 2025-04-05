/**
 * Generate the selections for interfaces.
 *
 * Interfaces in GraphQL can appear in two contexts:
 * 1. As a return type for a field (allowing fragment spreads for implementing types)
 * 2. As a contract implemented by an object (where only the interface's fields are available)
 *
 * For selection types, we generate only the interface's own fields plus inherited interfaces. But
 * for interfaces used as return types, we need to generate the `... on TypeName` selection option,
 * to allow correct querying of the API.
 */

import { generateFieldSelection } from "./field-selections.js";
import { generateTypeComment } from "../utils/generate-comment.js";
import type { GraphQLInterfaceType, GraphQLSchema } from "graphql";

export function generateInterfaceSelection(
    schema: GraphQLSchema,
    interfaceType: GraphQLInterfaceType
): string {
    const typeName = interfaceType.name;
    const implementedInterfaces = interfaceType.getInterfaces();
    const fields = interfaceType.getFields();

    const fieldDefinitions = Object.values(fields).map((field) => {
        const fieldComment = generateTypeComment(field.description);
        const fieldSelection = generateFieldSelection(schema, field);

        return `${fieldComment}\n        ${fieldSelection}`;
    });

    // Handle inherited interfaces
    const interfaceExtensions =
        implementedInterfaces.length > 0
            ? " & " + implementedInterfaces.map((i) => i.name + "Selection").join(" & ")
            : "";

    const typeComment = generateTypeComment(interfaceType.description);

    return `${typeComment}\nexport type ${typeName}Selection = {\n${fieldDefinitions.join("\n\n")}\n}${interfaceExtensions}`;
}
