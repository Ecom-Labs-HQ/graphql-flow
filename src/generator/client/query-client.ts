/**
 * Generate the query client, with all its methods
 */

import { capitalize } from "../../utils/capitalize.js";
import { generateTypeComment } from "../utils/generate-comment.js";
import { getSelectionTypeName } from "../utils/selection-type-name.js";
import { generateFieldType } from "../types/field-types.js";
import type { GraphQLSchema } from "graphql";

const wrapperCode = `
import { sendRequest } from "../runtime/send-request.js";
import { buildGraphQLQuery } from "../runtime/build-query.js";
import type { GraphQLApiResponse, GraphQLFlowClientConfig, QueryArgs, OperationReturnType } from "../runtime/types.js";

import * as ArgumentMaps from "../type-maps/argument-maps.js";
import type * as SelectionTypes from "../types/selection-types.js";
import type * as QueryArguments from "../types/query-arguments.js";
import type * as BaseTypes from "../types/base-types.js";

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

        const querySelectionType = getSelectionTypeName(query.type);
        const queryReturnType = generateFieldType(query.type, "BaseTypes");

        const generatedType = `${queryDescription}\npublic async ${query.name}<TSelection extends ${querySelectionType}>(queryArgs: QueryArgs<QueryArguments.${queryName}Arguments, TSelection>): Promise<GraphQLApiResponse<OperationReturnType<${queryReturnType}, TSelection>>> {\nconst generatedQuery = buildGraphQLQuery("${query.name}", ArgumentMaps.${query.name}ArgumentMap, queryArgs);\nreturn await sendRequest<OperationReturnType<${queryReturnType}, TSelection>>(this.config, generatedQuery);\n};`;

        generatedQueryMethods.push(generatedType);
    }

    const joinedQueryMethods = generatedQueryMethods.join("\n\n");

    return wrapperCode.replace("-----", joinedQueryMethods);
}
