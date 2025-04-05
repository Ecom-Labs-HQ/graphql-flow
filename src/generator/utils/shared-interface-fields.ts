/**
 * Return all fields that are shared across all objects implementing an interface.
 */

import { extractInterfaceFields } from "./extract-interface-fields.js";
import type { GraphQLObjectType, GraphQLFieldMap } from "graphql";

export function getSharedInterfaceFields(implementingTypes: readonly GraphQLObjectType[]) {
    if (implementingTypes.length === 0) {
        return {};
    }

    const allFieldsPerType: GraphQLFieldMap<unknown, unknown>[] = implementingTypes.map((type) => {
        const typeInterfaces = type.getInterfaces();
        const typeFields = type.getFields();

        const inheritedFields = typeInterfaces
            .map((iface) => extractInterfaceFields(iface))
            .reduce((acc, fields) => ({ ...acc, ...fields }), {});

        return {
            ...inheritedFields,
            ...typeFields,
        };
    });

    const firstTypeFields = allFieldsPerType[0];

    if (!firstTypeFields) {
        return {};
    }

    const sharedFields: GraphQLFieldMap<unknown, unknown> = {};

    for (const field of Object.values(firstTypeFields)) {
        const isShared = allFieldsPerType.every((typeFields) => {
            const matchingField = typeFields[field.name];

            return matchingField && matchingField.type.toString() === field.type.toString();
        });

        if (isShared) {
            sharedFields[field.name] = field;
        }
    }

    return sharedFields;
}
