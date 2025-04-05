/**
 * Generate the selection types for unions.
 *
 * Unions are the most complicated type to generate. There are two reasons for that:
 *   1. We need to somehow add functionality for selecting fields specific to a member;
 *   2. and the user should be able to select fields which are available on all members at the root,
 *      not on each member individually.
 *
 * The GraphQL syntax for selectign unions is the following:
 * ```graphql
 * query getDataWithUnion {
 *     sharedField1
 *     sharedField2
 *     ... on UnionMember1 {
 *         uniqueField1
 *         uniqueField1
 *     }
 *     ... on UnionMember2 {
 *         uniqueField3
 *         uniqueField4
 *     }
 * }
 * ```
 * Both `sharedField1` and `sharedField2` could be selected inside the union member, but can also
 * be selected at the root. Additionally, selecting at the root and inside the union will throw a
 * **runtime** error, so it would make sense to alert the user using a type error during
 * compilation.
 *
 * To make the API as intuitive as possible, we will copy the syntax for each union member, meaning
 * the way to select fields from a union will look like this:
 * ```ts
 * // For example, fetching payment transactions from the API
 * await client.queries.transactions({
 *     args: {
 *         first: 100,
 *     },
 *     select: {
 *         id: true,
 *         createdAt: true,
 *         "... on WireTransaction": {
 *             iban: true,
 *         },
 *         "... on PayPalTransaction": {
 *             email: true,
 *         },
 *     },
 * });
 * ```
 * While object keys in qutoes might not be the most pleasant, every person that has worked with
 * GraphQL knows immediately what the code does and it is also easy to read.
 */

import { generateFieldSelection } from "./field-selections.js";
import { getSharedUnionFields } from "../utils/shared-union-fields.js";
import { generateTypeComment } from "../utils/generate-comment.js";
import type { GraphQLSchema, GraphQLUnionType } from "graphql";

export function generateUnionSelection(schema: GraphQLSchema, unionType: GraphQLUnionType) {
    const unionName = unionType.name;
    const memberTypes = unionType.getTypes();

    /* Generate the selection type for the shared fields */

    const sharedFieldsMap = getSharedUnionFields(unionType);

    const sharedFieldDefinitions = Object.values(sharedFieldsMap).map((field) => {
        const fieldComment = generateTypeComment(field.description);
        const fieldSelection = generateFieldSelection(schema, field);

        return `${fieldComment}\n${fieldSelection}`;
    });

    const typenameField = `__typename?: true`;
    sharedFieldDefinitions.unshift(typenameField);

    /* Generate the member-specific selections using the already created types */
    const memberSelectionTypes = memberTypes.map((memberType) => {
        return `"... on ${memberType.name}"?: ${memberType.name}Selection`;
    });

    const typeComment = generateTypeComment(unionType.description);
    const allDefinitions = [...sharedFieldDefinitions, ...memberSelectionTypes];

    return `${typeComment}\nexport type ${unionName}Selection = {\n${allDefinitions.join("\n\n")}\n}`;
}
