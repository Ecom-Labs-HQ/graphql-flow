/**
 * Format the arguments of a field
 */

import { convertGraphQLType } from "./convert-type.js";
import type { GraphQLArgument } from "graphql";

export function formatArguments(fieldArguments: readonly GraphQLArgument[]): string {
    const formattedArguments: string[] = [];

    for (const argument of fieldArguments) {
        const convertedType = convertGraphQLType(argument.type);
        formattedArguments.push(`${argument.name}: ${convertedType.typescriptType}`);
    }

    if (formattedArguments.length) {
        return `{ ${formattedArguments.join("; ")} }`;
    }

    return "never";
}
