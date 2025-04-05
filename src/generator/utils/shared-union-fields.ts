/**
 * Return all fields that are shared across all members of a union type
 */

import { extractInterfaceFields } from "./extract-interface-fields.js";
import type { GraphQLUnionType, GraphQLFieldMap } from "graphql";

export function getSharedUnionFields(unionType: GraphQLUnionType) {
    const unionMembers = unionType.getTypes();

    if (unionMembers.length === 0) {
        return {};
    }

    const allFieldsPerMember: GraphQLFieldMap<unknown, unknown>[] = unionMembers.map((member) => {
        const memberInterfaces = member.getInterfaces();
        const memberFields = member.getFields();

        const interfaceFields = memberInterfaces
            .map((interfaceType) => extractInterfaceFields(interfaceType))
            .reduce((acc, fields) => ({ ...acc, ...fields }), {});

        return {
            ...interfaceFields,
            ...memberFields,
        };
    });

    const firstMemberFields = allFieldsPerMember[0];

    if (!firstMemberFields) {
        return {};
    }

    const sharedFields: GraphQLFieldMap<unknown, unknown> = {};

    for (const firstMemberField of Object.values(firstMemberFields)) {
        const isShared = allFieldsPerMember.every((memberFields) => {
            const memberField = memberFields[firstMemberField.name];

            if (!memberField) {
                return false;
            }

            return memberField.type.toString() === firstMemberField.type.toString();
        });

        if (isShared) {
            sharedFields[firstMemberField.name] = firstMemberField;
        }
    }

    return sharedFields;
}
