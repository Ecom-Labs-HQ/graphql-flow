/**
 * Generate the client that contains all queries and mutations
 */

const clientCode = `
import { GraphQLFlowQueryClient } from "./query-client.js";
import { GraphQLFlowMutationClient } from "./mutation-client.js";
import type { GraphQLFlowClientConfig } from "./types.js";

export class GraphQLFlowClient {
    private readonly queryClient;
    private readonly mutationClient;

    public constructor(config: GraphQLFlowClientConfig) {
        this.queryClient = new GraphQLFlowQueryClient(config)
        this.mutationClient = new GraphQLFlowMutationClient(config)
    }

    /* Queries */
    get queries() {
        return this.queryClient
    }

    /* Mutations */
    get mutations() {
        return this.mutationClient
    }
}
`;

export function generateFullClient() {
    return clientCode;
}
