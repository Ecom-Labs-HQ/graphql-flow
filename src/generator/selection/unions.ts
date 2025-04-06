/**
 * Generate the selection types for unions.
 *
 * Unline interfaces, on unions you always have to select the fields on the member using a fragment
 * spread. Selecting shared fields at the root is not possible.
 */

import { generateTypeComment } from "../utils/generate-comment.js";
import type { GraphQLSchema, GraphQLUnionType } from "graphql";

export function generateUnionSelection(schema: GraphQLSchema, unionType: GraphQLUnionType) {
    const unionName = unionType.name;
    const memberTypes = unionType.getTypes();

    /* Generate the member-specific selections using the already created types */
    const memberSelectionTypes = memberTypes.map((memberType) => {
        return `"... on ${memberType.name}"?: ${memberType.name}Selection`;
    });

    const typenameField = `__typename?: true`;

    const typeComment = generateTypeComment(unionType.description);
    const allDefinitions = [typenameField, ...memberSelectionTypes];

    return `${typeComment}\nexport type ${unionName}Selection = {\n${allDefinitions.join("\n\n")}\n}`;
}
