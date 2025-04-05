/**
 * Turn a query into a string
 */

import { buildGraphqlFields } from "./build-fields.js";
import type { QueryArgs } from "./types.js";

export type CreatedGraphQLQuery = {
    query: string;
    variables?: object;
};

export function buildGraphQLQuery(
    queryName: string,
    argumentMap: Record<string, string>,
    { args, select }: QueryArgs
): CreatedGraphQLQuery {
    const fieldSelection = buildGraphqlFields(select);

    if (!args || Object.values(args).length === 0) {
        return {
            query: `query ${queryName} { ${queryName} { ${fieldSelection} } } `,
        };
    }

    const variableDefinitions = Object.entries(args)
        .map(([argName]) => `$${argName}: ${argumentMap[argName]}`)
        .join(", ");

    const argumentString = Object.keys(args)
        .map((argName) => `${argName}: $${argName}`)
        .join(", ");

    return {
        query: `query ${queryName}(${variableDefinitions}) { ${queryName}(${argumentString}) { ${fieldSelection} } }`,
        variables: args,
    };
}
