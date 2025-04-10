/**
 * Format the arguments of a field
 */

import { convertGraphQLType } from "./convert-type.js";
import { isRequiredArgument, type GraphQLArgument } from "graphql";

export function formatArguments(fieldArguments: readonly GraphQLArgument[]): string {
    const formattedArguments: string[] = [];

    for (const argument of fieldArguments) {
        const convertedType = convertGraphQLType(argument.type);
        const isRequiredType = isRequiredArgument(argument);

        formattedArguments.push(
            `${argument.name}${isRequiredType ? "" : "?"}: ${convertedType.inputType}`
        );
    }

    if (formattedArguments.length) {
        return `{ ${formattedArguments.join("; ")} }`;
    }

    return "never";
}
