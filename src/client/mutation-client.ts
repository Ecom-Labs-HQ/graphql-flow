/**
 * Generate the mutation client, with all its methods
 */

import { capitalize } from "../utils/capitalize.js";
import { getTypeName } from "../utils/type-name.js";
import { generateTypeComment } from "../utils/generate-comment.js";
import type { GraphQLSchema } from "graphql";

const wrapperCode = `
import { sendRequest } from "./send-request.js";
import type { GraphQLApiResponse, GraphQLFlowClientConfig, MutationArgs, OperationReturnType } from "./types.js";

import type * as SelectionTypes from "../selection-types.js";
import type * as MutationInputs from "../mutation-inputs.js";
import type * as Types from "../types.js";

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
        const mutationName = capitalize(mutation.name);
        const mutationDescription = generateTypeComment(mutation.description);

        const mutationSelectionType = getTypeName(mutation.type, "SelectionTypes");
        const mutationReturnType = getTypeName(mutation.type, "Types");

        const generatedType = `${mutationDescription}\npublic async ${mutation.name}<TSelection extends ${mutationSelectionType}Selection>(mutationArgs: MutationArgs<MutationInputs.${mutationName}Input, TSelection>): Promise<GraphQLApiResponse<OperationReturnType<${mutationReturnType}, TSelection>>> {\nreturn await sendRequest<OperationReturnType<${mutationReturnType}, TSelection>>(this.config, mutationArgs);\n};`;

        generatedMutationMethods.push(generatedType);
    }

    const joinedMutationMethods = generatedMutationMethods.join("\n\n");

    return wrapperCode.replace("-----", joinedMutationMethods);
}
