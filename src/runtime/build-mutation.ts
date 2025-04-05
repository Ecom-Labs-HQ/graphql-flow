/**
 * Turn a mutation into a string
 */

import { buildGraphqlFields } from "./build-fields.js";
import type { MutationArgs } from "./types.js";

export type CreatedGraphQLMutation = {
    query: string;
    variables?: object;
};

export function buildGraphQLMutation(
    mutationName: string,
    argumentMap: Record<string, string>,
    { data, select }: MutationArgs
): CreatedGraphQLMutation {
    const fieldSelection = buildGraphqlFields(select);

    if (!data || Object.values(data).length === 0) {
        return {
            query: `mutation ${mutationName} { ${mutationName} { ${fieldSelection} } }`,
        };
    }

    const variableDefinitions = Object.entries(data)
        .map(([dataName]) => `$${dataName}: ${argumentMap[dataName]}`)
        .join(", ");

    const argumentString = Object.keys(data)
        .map((dataName) => `${dataName}: $${dataName}`)
        .join(", ");

    return {
        query: `mutation ${mutationName}(${variableDefinitions}) { ${mutationName}(${argumentString}) { ${fieldSelection} } }`,
        variables: data,
    };
}
