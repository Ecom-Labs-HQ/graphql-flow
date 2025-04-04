/**
 * Generate the union types.
 *
 * This function is fairly simple, since we can just reference each object by name. Is is
 * basically the same thing as generating the enum types.
 */

import { generateTypeComment } from "../utils/generate-comment.js";
import type { GraphQLUnionType } from "graphql";

export function generateUnionType(unionType: GraphQLUnionType): string {
    const unionName = unionType.name;
    const memberTypes = unionType.getTypes();

    const typeReferences = memberTypes.map((type) => type.name);
    const unionDefinition = typeReferences.join(" | ");

    const description = generateTypeComment(unionType.description);

    return `${description}\nexport type ${unionName} = ${unionDefinition}`;
}
