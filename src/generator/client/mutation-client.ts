/**
 * Generate the mutation client, with all its methods
 */

import { generateTypeComment } from "../utils/generate-comment.js";
import type { GraphQLSchema } from "graphql";

const wrapperCode = `
import { sendRequest } from "../runtime/send-request.js";
import { buildGraphQLOperation } from "../runtime/build-operation.js";

import type { GraphQLApiResponse, GraphQLFlowClientConfig, InferSelectType, InferSelectedReturnType } from "../runtime/types.js";
import type { MUTATION_TYPE_NAME } from "../types/types.js";

export class GraphQLFlowMutationClient {
    private readonly config;

    public constructor(config: GraphQLFlowClientConfig) {
        this.config = config;
    }

-----
}
`;

export function generateMutationClient(schema: GraphQLSchema) {
    const mutationType = schema.getMutationType();
    const generatedMutationMethods: string[] = [];

    if (!mutationType) {
        return "";
    }

    const allMutations = mutationType.getFields();

    for (const mutation of Object.values(allMutations)) {
        const mutationDescription = generateTypeComment(mutation.description);

        const mutationSelectType = `InferSelectType<${mutationType.name}["${mutation.name}"]>`;
        const mutationReturnType = `${mutationType.name}["${mutation.name}"]`;

        const generatedType = `${mutationDescription}\npublic async ${mutation.name}<TSelection extends ${mutationSelectType}>(mutationArgs: TSelection): Promise<GraphQLApiResponse<InferSelectedReturnType<${mutationReturnType}, TSelection>>> {\nconst generatedMutation = buildGraphQLOperation("mutation", "${mutation.name}", mutationArgs);\nreturn await sendRequest(this.config, generatedMutation);\n};`;
        generatedMutationMethods.push(generatedType);
    }

    const joinedMutationMethods = generatedMutationMethods.join("\n\n");

    return wrapperCode
        .replace("-----", joinedMutationMethods)
        .replace("MUTATION_TYPE_NAME", mutationType.name);
}
