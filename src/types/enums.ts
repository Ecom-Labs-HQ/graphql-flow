/**
 * Generate the enum types.
 *
 * While we could turn the GraphQL enums into typescript enums, this would add a large amount of
 * runtime code and would require the user to import the enum.
 *
 * It is much easier to turn the enums into union types of string literals, which will have the
 * exact same result when querying the API.
 */

import { generateTypeComment } from "../utils/generate-comment.js";
import type { GraphQLEnumType } from "graphql";

export function generateEnumType(enumType: GraphQLEnumType): string {
    const enumName = enumType.name;
    const enumValues = enumType.getValues();

    const valueLiterals = enumValues.map((value) => `"${value.name}"`);
    const unionType = valueLiterals.join(" | ");

    const description = generateTypeComment(enumType.description);

    return `${description}\nexport type ${enumName} = \n${unionType}`;
}
