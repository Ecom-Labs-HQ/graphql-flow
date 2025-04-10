/**
 * Generate the query client, with all its methods
 */

import { generateTypeComment } from "../utils/generate-comment.js";
import type { GraphQLSchema } from "graphql";

const wrapperCode = `
import { sendRequest } from "../runtime/send-request.js";
import { buildGraphQLOperation } from "../runtime/build-operation.js";

import type { GraphQLApiResponse, GraphQLFlowClientConfig, InferSelectType, InferSelectedReturnType } from "../runtime/types.js";
import type { QUERY_TYPE_NAME } from "../types/types.js";

export class GraphQLFlowQueryClient {
    private readonly config;

    public constructor(config: GraphQLFlowClientConfig) {
        this.config = config;
    }

-----
}
`;

export function generateQueryClient(schema: GraphQLSchema) {
    const queryType = schema.getQueryType();
    const generatedQueryMethods: string[] = [];

    if (!queryType) {
        return "";
    }

    const allQueries = queryType.getFields();

    for (const query of Object.values(allQueries)) {
        const queryDescription = generateTypeComment(query.description);

        const querySelectType = `InferSelectType<${queryType.name}["${query.name}"]>`;
        const queryReturnType = `${queryType.name}["${query.name}"]`;

        const generatedType = `${queryDescription}\npublic async ${query.name}<TSelection extends ${querySelectType}>(queryArgs: TSelection): Promise<GraphQLApiResponse<InferSelectedReturnType<${queryReturnType}, TSelection>>> {\nconst generatedQuery = buildGraphQLOperation("query", "${query.name}", queryArgs);\nreturn await sendRequest(this.config, generatedQuery);\n};`;
        generatedQueryMethods.push(generatedType);
    }

    const joinedQueryMethods = generatedQueryMethods.join("\n\n");

    return wrapperCode
        .replace("-----", joinedQueryMethods)
        .replace("QUERY_TYPE_NAME", queryType.name);
}
