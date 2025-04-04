/**
 * Generate the types for the interfaces.
 *
 * GraphQL interfaces will just create types that are then extended in other types, using the "&"
 * symbol in typescript.
 *
 * Interfaces can also implement other interfaces, which we can just reference since they will be
 * generated as well.
 */

import { generateFieldType } from "./field-types.js";
import { generateTypeComment } from "../utils/generate-comment.js";
import type { GraphQLInterfaceType } from "graphql";

export function generateInterfaceType(interfaceType: GraphQLInterfaceType): string {
    const typeName = interfaceType.name;

    const implementedInterfaces = interfaceType.getInterfaces();
    const fields = interfaceType.getFields();

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

    const typeComment = generateTypeComment(interfaceType.description);

    return `${typeComment}\ntype ${typeName} = {\n${fieldDefinitions.join("\n\n")}\n}${interfaceExtensions}`;
}
