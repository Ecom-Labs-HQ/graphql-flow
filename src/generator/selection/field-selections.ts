/**
 * Strip the type of all modifiers and check whether it is a GraphQL scalar or any other type. For
 * scalars we replace it with true, for all other types we reference it by name (+ "Selection").
 *
 * If a field takes arguments, it is wrapped in QueryArgs with the appropriate argument type
 * based on the return type.
 */

import { capitalize } from "../../utils/capitalize.js";
import { isInterfaceType, isListType, isNonNullType, isObjectType, isScalarType } from "graphql";
import type { GraphQLField, GraphQLSchema, GraphQLNamedType } from "graphql";

export function generateFieldSelection(
    schema: GraphQLSchema,
    typeName: string,
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

    /* After stripping, currentType should be a named type (scalar, object, interface, or union) */
    const namedType = currentType as GraphQLNamedType;

    /* Determine the base selection type */
    let fieldSelectionType: string;

    if (isScalarType(namedType)) {
        fieldSelectionType = "true";
    } else if (isInterfaceType(namedType)) {
        const allObjects = Object.values(schema.getTypeMap()).filter((type) => isObjectType(type));

        const implementingTypes = allObjects.filter((type) =>
            type.getInterfaces().includes(namedType)
        );

        const fragmentSpreads = implementingTypes.map((type) => {
            return `"... on ${type.name}"?: ${type.name}Selection`;
        });

        const baseSelection = `${namedType.name}Selection`;

        if (fragmentSpreads.length === 0) {
            fieldSelectionType = baseSelection;
        } else {
            fieldSelectionType = `${baseSelection} & {\n${fragmentSpreads.join("\n        ")}\n    }`;
        }
    } else {
        fieldSelectionType = `${namedType.name}Selection`;
    }

    /* Check if the field has arguments and wrap with QueryArgs if needed */
    const hasArguments = field.args && field.args.length > 0;

    if (hasArguments) {
        const capitalizedFieldName = capitalize(field.name);
        const wrappedFieldType = `QueryArgs<FieldArguments.${typeName}${capitalizedFieldName}Arguments, ${fieldSelectionType}>`;

        return `${field.name}?: ${wrappedFieldType}`;
    } else {
        return `${field.name}?: ${fieldSelectionType}`;
    }
}
