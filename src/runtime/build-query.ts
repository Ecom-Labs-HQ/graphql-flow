/**
 * Build a complete GraphQL query string from a query name, argument map, and selection
 */

import { formatArguments } from "./format-arguments.js";
import type { QueryArgs } from "./types.js";

export type CreatedGraphQLQuery = {
    query: string;
    variables?: object;
};

export function buildGraphQLQuery(
    queryName: string,
    argumentMap: Record<string, string>,
    { args, select }: QueryArgs<object, object | true>
): CreatedGraphQLQuery {
    const buildFields = (selection: object | true): string => {
        if (selection === true) {
            return "";
        }

        const selectedFields: string[] = [];

        for (const [field, value] of Object.entries(selection)) {
            if (value && typeof value === "object" && "select" in value) {
                const nestedQuery = value as { args?: object; select: object | true };
                const nestedFields = buildFields(nestedQuery.select);

                if (nestedQuery.args && Object.keys(nestedQuery.args).length > 0) {
                    const argsString = formatArguments(nestedQuery.args);
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
    };

    const fieldSelection = buildFields(select);

    /* If there are no args, send the query without */

    if (!args || Object.values(args).length === 0) {
        return {
            query: `query ${queryName} { ${queryName} ${fieldSelection} }`,
        };
    }

    /* Otherwise format them and add them to the string */

    const argumentString = formatArguments(args);

    return {
        query: `query ${queryName} { ${queryName}(${argumentString}) { ${fieldSelection} } }`,
        variables: {},
    };
}
