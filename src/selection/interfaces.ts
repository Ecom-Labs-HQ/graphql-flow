/**
 * Generate the selections for interfaces.
 *
 * Interfaces might seem like objects at first, but for generating the selection types they are
 * very different. In GraphQL, if a field has an interface as the type, that field can return any
 * object that implements that interface.
 *
 * For example, a schema with this structure:
 * ```graphql
 * interface Character {
 *     id: ID!
 *     name: String!
 * }
 *
 * type Human implements Character {
 *     id: ID!
 *     name: String!
 *     homePlanet: String
 * }
 *
 * type Droid implements Character {
 *     id: ID!
 *     name: String!
 *     primaryFunction: String
 * }
 *
 * type Query {
 *     character: Character!
 * }
 * ```
 * has a single query that returns the type `Character`. `Character` is an interface, which means
 * that it can return either a `Human` or a `Droid`.
 *
 * For that reason, this query right here is not only valid but also common:
 * ```graphql
 * query {
 *     character {
 *         id
 *         name
 *         ... on Human {
 *             homePlanet
 *         }
 *         ... on Droid {
 *             primaryFunction
 *         }
 *     }
 * }
 * ```
 *
 * If we want to support all GraphQL features, we **must** also support this. This means that if we
 * find a field that returns an interface, we have to find every object that implements that
 * interface and type the return type as a union of all those interfaces.
 */

import { isObjectType } from "graphql";
import { generateFieldSelection } from "./field-selections.js";
import { generateTypeComment } from "../utils/generate-comment.js";
import { getSharedInterfaceFields } from "../utils/shared-interface-fields.js";
import type { GraphQLInterfaceType, GraphQLSchema } from "graphql";

export function generateInterfaceSelection(
    schema: GraphQLSchema,
    interfaceType: GraphQLInterfaceType
): string {
    const typeName = interfaceType.name;
    const implementedInterfaces = interfaceType.getInterfaces();

    /* Find all object types that implement this interface */
    const allObjects = Object.values(schema.getTypeMap()).filter((type) => isObjectType(type));

    const implementingTypes = allObjects.filter((type) =>
        type.getInterfaces().includes(interfaceType)
    );

    /* Generate the selection type for the shared fields */
    const sharedFieldsMap = getSharedInterfaceFields(implementingTypes);

    const sharedFieldDefinitions = Object.values(sharedFieldsMap).map((field) => {
        const fieldComment = generateTypeComment(field.description);
        const fieldSelection = generateFieldSelection(field);

        return `${fieldComment}\n        ${fieldSelection}`;
    });

    /* Generate the member-specific selections using the already created types */
    const memberSelectionTypes = implementingTypes.map((memberType) => {
        return `"... on ${memberType.name}"?: ${memberType.name}Selection`;
    });

    /* Handle inherited interfaces */
    const interfaceExtensions =
        implementedInterfaces.length > 0
            ? " & " + implementedInterfaces.map((i) => i.name + "Selection").join(" & ")
            : "";

    const typeComment = generateTypeComment(interfaceType.description);
    const allDefinitions = [...sharedFieldDefinitions, ...memberSelectionTypes];

    return `${typeComment}\nexport type ${typeName}Selection = {\n${allDefinitions.join("\n\n")}\n}${interfaceExtensions}`;
}
