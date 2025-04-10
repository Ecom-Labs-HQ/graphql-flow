/**
 * When generating an object key type, we need to check if it is nullable or an array. If so, we
 * need to return the type along with the correct modifiers.
 */

import { convertGraphQLType } from "../utils/convert-type.js";
import { formatArguments } from "../utils/format-arguments.js";
import { isInterfaceType, isObjectType, isUnionType } from "graphql";
import type { GraphQLField, GraphQLSchema } from "graphql";

export function generateFieldType(schema: GraphQLSchema, field: GraphQLField<unknown, unknown>) {
    const { baseType, typescriptType } = convertGraphQLType(field.type);
    const formattedArguments = formatArguments(field.args);

    /* Generate the metadata */

    if (isInterfaceType(baseType)) {
        /* Get the objects that implements the interface */
        const typeArray = Object.values(schema.getTypeMap());
        const allObjects = typeArray.filter(isObjectType);

        const implementingTypes = allObjects.filter((type) =>
            type.getInterfaces().includes(baseType)
        );
        const generatedMemberTypes = implementingTypes.map((type) => `${type.name}: ${type.name}`);

        /* Get the interface fields */
        const sharedInterfaceFields = baseType.getFields();

        const generatedFieldTypes: string[] = Object.values(sharedInterfaceFields).map(
            (field) => `${field.name}: ${generateFieldType(schema, field)}`
        );

        const generatedMembers = `{ ${generatedMemberTypes.join("; ")} }`;
        const generatedFields = `{ ${generatedFieldTypes.join("; ")} }`;

        return `{ members: ${generatedMembers}, fields: ${generatedFields}, arguments: ${formattedArguments} }`;
    }

    if (isUnionType(baseType)) {
        const unionMembers = baseType.getTypes();

        const generatedMemberTypes = unionMembers.map((member) => `${member.name}: ${member.name}`);
        const generatedMembers = `{ ${generatedMemberTypes.join("; ")} }`;

        return `{ members: ${generatedMembers}, arguments: ${formattedArguments} }`;
    }

    return `{ baseType: ${baseType}, returnType: ${typescriptType}, arguments: ${formattedArguments} }`;
}
