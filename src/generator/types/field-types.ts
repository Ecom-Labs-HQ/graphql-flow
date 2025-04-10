/**
 * When generating an object key type, we need to check if it is nullable or an array. If so, we
 * need to return the type along with the correct modifiers.
 */

import { convertGraphQLType } from "../utils/convert-type.js";
import { formatArguments } from "../utils/format-arguments.js";
import { isInterfaceType, isObjectType, isUnionType } from "graphql";
import type { GraphQLField, GraphQLInterfaceType, GraphQLSchema } from "graphql";

export function generateFieldType(schema: GraphQLSchema, field: GraphQLField<unknown, unknown>) {
    const { strippedType, typescriptType } = convertGraphQLType(field.type);
    const formattedArguments = formatArguments(field.args);

    /* Generate the metadata */

    if (isUnionType(field.type)) {
        const unionMembers = field.type.getTypes();

        const generatedMemberTypes: string[] = unionMembers.map(
            (member) => `${member.name}: ${member.name}`
        );

        const generatedMembers = `{ ${generatedMemberTypes.join("; ")} }`;

        return `{ members: ${generatedMembers}, arguments: ${formattedArguments} }`;
    }

    if (isInterfaceType(field.type)) {
        const allObjects = Object.values(schema.getTypeMap()).filter((type) => isObjectType(type));

        const implementingTypes = allObjects.filter((type) =>
            type.getInterfaces().includes(field.type as GraphQLInterfaceType)
        );

        const sharedInterfaceFields = field.type.getFields();

        const generatedFieldTypes: string[] = Object.values(sharedInterfaceFields).map(
            (field) => `${field.name}: ${generateFieldType(schema, field)}`
        );

        const generatedMemberTypes: string[] = implementingTypes.map(
            (type) => `${type.name}: ${type.name}`
        );

        const generatedMembers = `{ ${generatedMemberTypes.join("; ")} }`;
        const generatedFields = `{ ${generatedFieldTypes.join("; ")} }`;

        return `{ members: ${generatedMembers}, fields: ${generatedFields}, arguments: ${formattedArguments} }`;
    }

    return `{ strippedType: ${strippedType}, returnType: ${typescriptType}, arguments: ${formattedArguments} }`;
}
