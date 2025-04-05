/**
 * Generate the mutation client, with all its methods
 */

import { capitalize } from "../../utils/capitalize.js";
import { generateTypeComment } from "../utils/generate-comment.js";
import { getSelectionTypeName } from "../utils/selection-type-name.js";
import { generateFieldType } from "../types/field-types.js";
import type { GraphQLSchema } from "graphql";

const wrapperCode = `
import { sendRequest } from "../runtime/send-request.js";
import { buildGraphQLMutation } from "../runtime/build-mutation.js";
import type { GraphQLApiResponse, GraphQLFlowClientConfig, MutationArgs, OperationReturnType } from "../runtime/types.js";

import * as InputMaps from "../type-maps/input-maps.js";
import type * as SelectionTypes from "../types/selection-types.js";
import type * as MutationInputs from "../types/mutation-inputs.js";
import type * as BaseTypes from "../types/base-types.js";

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

        const mutationSelectionType = getSelectionTypeName(mutation.type);
        const mutationReturnType = generateFieldType(mutation.type, "BaseTypes");

        const generatedType = `${mutationDescription}\npublic async ${mutation.name}<TSelection extends ${mutationSelectionType}>(mutationArgs: MutationArgs<MutationInputs.${mutationName}Input, TSelection>): Promise<GraphQLApiResponse<OperationReturnType<${mutationReturnType}, TSelection>>> {\nconst generatedMutation = buildGraphQLMutation("${mutation.name}", InputMaps.${mutation.name}InputMap, mutationArgs);\nreturn await sendRequest<OperationReturnType<${mutationReturnType}, TSelection>>(this.config, generatedMutation);\n};`;

        generatedMutationMethods.push(generatedType);
    }

    const joinedMutationMethods = generatedMutationMethods.join("\n\n");

    return wrapperCode.replace("-----", joinedMutationMethods);
}
