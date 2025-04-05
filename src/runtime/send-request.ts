/**
 * Send the GraphQL request using the global `fetch` API
 */

import type { CreatedGraphQLMutation } from "./build-mutation.js";
import type { CreatedGraphQLQuery } from "./build-query.js";
import type { GraphQLApiResponse, GraphQLFlowClientConfig } from "./types.js";

export async function sendRequest<TReturnType extends object>(
    config: GraphQLFlowClientConfig,
    queryOrMutation: CreatedGraphQLQuery | CreatedGraphQLMutation
) {
    const response = await fetch(config.endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(config.headers ? config.headers : {}),
        },
        body: JSON.stringify(queryOrMutation),
    });

    const data = await response.json();

    return data as GraphQLApiResponse<TReturnType>;
}
