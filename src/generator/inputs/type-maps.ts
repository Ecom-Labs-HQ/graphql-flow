/**
 * Generate a mapping for each input to its GraphQL type.
 *
 * This is different from the typescript types, because this code will be needed at **runtime**,
 * when creating the mutation variables.
 */

import { generateTypeComment } from "../utils/generate-comment.js";
import type { GraphQLSchema } from "graphql";

export function generateInputMaps(schema: GraphQLSchema) {
    const mutationType = schema.getMutationType();

    if (!mutationType) {
        return "";
    }

    const allMutations = mutationType.getFields();
    const mutationInputTypes: string[] = [];

    for (const mutation of Object.values(allMutations)) {
        const mutationInput = mutation.args;

        if (mutationInput.length === 0) {
            const inlineType = `export const ${mutation.name}InputMap = {}`;

            mutationInputTypes.push(inlineType);
            continue;
        }

        const fieldDefinitions = mutationInput.map((input) => {
            const fieldName = input.name;
            const fieldType = input.type;

            const fieldComment = generateTypeComment(input.description);
            const fieldDefinition = `${fieldName}: "${fieldType}",`;

            return `${fieldComment}\n${fieldDefinition}`;
        });

        const generatedType = `export const ${mutation.name}InputMap = {\n${fieldDefinitions.join("\n\n")}\n};`;

        mutationInputTypes.push(generatedType);
    }

    const fileHeaders = [
        "/* File auto-generated using [graphql-flow](https://github.com/ecom-labs-hq/graphql-flow) */",
    ];

    return [...fileHeaders, ...mutationInputTypes].join("\n\n");
}
