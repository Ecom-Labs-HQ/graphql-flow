/**
 * Extract all fields inside an interface.
 *
 * The issue is that interfaces and implement other interfaces, which can go on indefinitely. So we
 * need to go through each interface recursively, until we find an interface that doesn't implement
 * any other interfaces. If we find that, we can add those to all the other fields and we are done.
 */

import type { GraphQLInterfaceType, GraphQLFieldMap } from "graphql";

export function extractInterfaceFields(
    interfaceType: GraphQLInterfaceType
): GraphQLFieldMap<unknown, unknown> {
    const collectedFields: GraphQLFieldMap<unknown, unknown> = {};
    const processedInterfaces = new Set<string>();

    const collectFieldsRecursively = (currentInterface: GraphQLInterfaceType) => {
        const currentInterfaceName = currentInterface.name;

        if (processedInterfaces.has(currentInterfaceName)) {
            return;
        }

        processedInterfaces.add(currentInterfaceName);

        const currentFields = currentInterface.getFields();
        Object.assign(collectedFields, currentFields);

        const implementedInterfaces = currentInterface.getInterfaces();

        implementedInterfaces.forEach((nestedInterface) => {
            collectFieldsRecursively(nestedInterface);
        });
    };

    collectFieldsRecursively(interfaceType);

    return collectedFields;
}
