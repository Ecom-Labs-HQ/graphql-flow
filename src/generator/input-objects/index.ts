/**
 * Generate the inputs for the mutations. The input is the data passed to the mutation which will
 * usually be used to peform a C/U/D operation.
 *
 * Similar to the query arguments, all fields that are nullable are also optional, so only the that
 * typescript doesn't complain about missing (not required) values.
 */

import { generateFieldType } from "./field-type.js";
import { generateTypeComment } from "../utils/generate-comment.js";
import { isInputObjectType, isNonNullType } from "graphql";
import type { GraphQLSchema } from "graphql";

export function generateInputTypes(schema: GraphQLSchema) {
    const typeMap = schema.getTypeMap();
    const typeArray = Object.values(typeMap);

    const inputObjectTypes = typeArray.filter(isInputObjectType);
    const generatedTypes: string[] = [];

    for (const inputObjectType of inputObjectTypes) {
        const inputObjectName = inputObjectType.name;
        const fields = inputObjectType.getFields();

        const fieldDefinitions = Object.values(fields).map((field) => {
            const fieldType = field.type;
            const tsType = generateFieldType(fieldType, "BaseTypes");

            const isRequired = isNonNullType(fieldType);
            const fieldName = isRequired ? field.name : `${field.name}?`;

            const fieldComment = generateTypeComment(field.description);
            const fieldDefinition = `${fieldName}: ${tsType}`;

            return `${fieldComment}\n${fieldDefinition}`;
        });

        const generatedType = `export type ${inputObjectName} = {\n${fieldDefinitions.join("\n\n")}\n};`;
        generatedTypes.push(generatedType);
    }

    const fileHeaders = [
        "/* File auto-generated using [graphql-flow](https://github.com/ecom-labs-hq/graphql-flow) */",
        "/* eslint-disable @typescript-eslint/no-explicit-any */",
        'import * as BaseTypes from "./base-types.js"',
    ];

    return [...fileHeaders, ...generatedTypes].join("\n\n");
}
