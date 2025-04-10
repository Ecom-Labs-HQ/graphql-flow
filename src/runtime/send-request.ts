/**
 * Send the GraphQL request using the global `fetch` API
 */

import type { GraphQLFlowClientConfig } from "./types.js";
import type { CreatedGraphQLOperation } from "./build-operation.js";

export async function sendRequest(
    config: GraphQLFlowClientConfig,
    operation: CreatedGraphQLOperation
) {
    const response = await fetch(config.endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(config.headers ? config.headers : {}),
        },
        body: JSON.stringify(operation),
    });

    const data = await response.json();
    return data;
}
