/**
 * Generate the query client, with all its methods
 */

import { capitalize } from "../utils/capitalize.js";
import { getTypeName } from "../utils/type-name.js";
import { generateTypeComment } from "../utils/generate-comment.js";
import type { GraphQLSchema } from "graphql";

const wrapperCode = `
import { sendRequest } from "./send-request.js";
import type { GraphQLApiResponse, GraphQLFlowClientConfig, QueryArgs, OperationReturnType } from "./types.js";

import type * as SelectionTypes from "../selection-types.js";
import type * as QueryArguments from "../query-arguments.js";
import type * as Types from "../types.js";

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
        const queryName = capitalize(query.name);
        const queryDescription = generateTypeComment(query.description);

        const querySelectionType = getTypeName(query.type, "SelectionTypes");
        const queryReturnType = getTypeName(query.type, "Types");

        const generatedType = `${queryDescription}\npublic async ${query.name}<TSelection extends ${querySelectionType}Selection>(queryArgs: QueryArgs<QueryArguments.${queryName}Arguments, TSelection>): Promise<GraphQLApiResponse<OperationReturnType<${queryReturnType}, TSelection>>> {\nreturn await sendRequest<OperationReturnType<${queryReturnType}, TSelection>>(this.config, queryArgs);\n};`;

        generatedQueryMethods.push(generatedType);
    }

    const joinedQueryMethods = generatedQueryMethods.join("\n\n");

    return wrapperCode.replace("-----", joinedQueryMethods);
}
