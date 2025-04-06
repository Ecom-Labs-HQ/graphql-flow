/**
 * Build a complete GraphQL mutation string from a mutation name, argument map, and selection
 */

import type { MutationArgs } from "./types.js";

export type CreatedGraphQLMutation = {
    query: string;
    variables?: object;
};

export function buildGraphQLMutation(
    mutationName: string,
    argumentMap: Record<string, string>,
    { data, select }: MutationArgs<object, object | true>
): CreatedGraphQLMutation {
    function buildFields(selection: object | true): string {
        if (selection === true) {
            return "";
        }

        const selectedFields: string[] = [];

        for (const [field, value] of Object.entries(selection)) {
            if (value && typeof value === "object" && "select" in value) {
                const nestedQuery = value as { args?: object; select: object | true };
                const nestedFields = buildFields(nestedQuery.select);

                if (nestedQuery.args && Object.keys(nestedQuery.args).length > 0) {
                    const argsString = Object.entries(nestedQuery.args)
                        .map(([argName, argValue]) => `${argName}: ${argValue}`)
                        .join(", ");
                    selectedFields.push(`${field}(${argsString}) { ${nestedFields} }`);
                } else {
                    selectedFields.push(`${field} { ${nestedFields} }`);
                }

                continue;
            }

            if (typeof value === "object") {
                const nestedFields = buildFields(value);
                selectedFields.push(`${field} { ${nestedFields} }`);

                continue;
            }

            if (value === true) {
                selectedFields.push(field);
                continue;
            }
        }

        return selectedFields.join(" ");
    }

    const fieldSelection = buildFields(select);

    if (!data || Object.values(data).length === 0) {
        return {
            query: `mutation ${mutationName} { ${mutationName} ${fieldSelection} }`,
        };
    }

    const variableDefinitions = Object.entries(data)
        .map(([dataName]) => `$${dataName}: ${argumentMap[dataName]}`)
        .join(", ");

    const argumentString = Object.keys(data)
        .map((dataName) => `${dataName}: $${dataName}`)
        .join(", ");

    return {
        query: `mutation ${mutationName}(${variableDefinitions}) { ${mutationName}(${argumentString}) { ${fieldSelection} } }`,
        variables: data,
    };
}
