/**
 * Strip the type of all modifiers and check whether it is a GraphQL scalar or any other type. For
 * scalars we replace it with true, for all other types we reference it by name (+ "Selection")
 */

import { isInterfaceType, isListType, isNonNullType, isObjectType, isScalarType } from "graphql";
import type { GraphQLField, GraphQLSchema } from "graphql";

export function generateFieldSelection(
    schema: GraphQLSchema,
    field: GraphQLField<unknown, unknown>
) {
    /* Strip the type of any modifiers and store them in variables */
    let currentType = field.type;

    if (isNonNullType(currentType)) {
        currentType = currentType.ofType;
    }

    if (isListType(currentType)) {
        currentType = currentType.ofType;

        if (isNonNullType(currentType)) {
            currentType = currentType.ofType;
        }
    }

    /* Check what kind of type it is */
    if (isInterfaceType(currentType)) {
        const allObjects = Object.values(schema.getTypeMap()).filter((type) => isObjectType(type));

        const implementingTypes = allObjects.filter((type) =>
            type.getInterfaces().includes(currentType)
        );

        const fragmentSpreads = implementingTypes.map((type) => {
            return `"... on ${type.name}"?: ${type.name}Selection`;
        });

        const baseSelection = `${field.name}?: ${currentType.name}Selection`;

        if (fragmentSpreads.length === 0) {
            return baseSelection;
        }

        return `${baseSelection} & {\n        ${fragmentSpreads.join("\n        ")}\n    }`;
    } else if (isScalarType(currentType)) {
        return `${field.name}?: true`;
    } else {
        return `${field.name}?: ${currentType}Selection`;
    }
}
