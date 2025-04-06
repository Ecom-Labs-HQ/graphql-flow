/**
 * In GraphQL, fields on objects and interfaces can also take arguments. Problem is that the
 * `generateQueryArguments()` function only checks for the queries defined in the `Query` type, not
 * on all objects.
 *
 * This function fetches all objects and interfaces and generates the argument types for any
 * argument inputs found in them.
 */

import { capitalize } from "../../utils/capitalize.js";
import { generateFieldType } from "../types/field-types.js";
import { generateTypeComment } from "../utils/generate-comment.js";
import { isInterfaceType, isNonNullType, isObjectType } from "graphql";
import type { GraphQLSchema } from "graphql";

export function generateFieldArguments(schema: GraphQLSchema) {
    const allTypes = schema.getTypeMap();
    const fieldArgumentTypes: string[] = [];

    for (const type of Object.values(allTypes)) {
        if (!isObjectType(type) && !isInterfaceType(type)) {
            continue;
        }

        const typeFields = type.getFields();

        for (const field of Object.values(typeFields)) {
            const fieldArguments = field.args;
            const hasArguments = fieldArguments && fieldArguments.length > 0;

            if (!hasArguments) {
                continue;
            }

            const typeName = type.name;
            const capitalizedFieldName = capitalize(field.name);

            const fieldDefinitions = fieldArguments.map((argument) => {
                const fieldType = argument.type;
                const tsType = generateFieldType(fieldType, "BaseTypes");

                const isRequired = isNonNullType(fieldType);
                const fieldName = isRequired ? argument.name : `${argument.name}?`;

                const fieldComment = generateTypeComment(argument.description);
                const fieldDefinition = `${fieldName}: ${tsType}`;

                return `${fieldComment}\n${fieldDefinition}`;
            });

            const generatedType = `export type ${typeName}${capitalizedFieldName}Arguments = {\n${fieldDefinitions.join("\n\n")}\n};`;
            fieldArgumentTypes.push(generatedType);
        }
    }

    const fileHeaders = [
        "/* File auto-generated using [graphql-flow](https://github.com/ecom-labs-hq/graphql-flow) */",
        "/* eslint-disable @typescript-eslint/no-explicit-any */",
        'import * as BaseTypes from "./base-types.js"',
    ];

    return [...fileHeaders, ...fieldArgumentTypes].join("\n\n");
}
