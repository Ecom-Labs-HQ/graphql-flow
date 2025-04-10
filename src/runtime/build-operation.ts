/**
 * Build a complete GraphQL operation from a name and selection
 */

import { formatArguments } from "./format-arguments.js";

export type CreatedGraphQLOperation = {
    query: string;
};

export function buildGraphQLOperation(
    operationType: "query" | "mutation",
    operationName: string,
    selection: object
): CreatedGraphQLOperation {
    const buildFields = (fieldsObject: object | true): string => {
        if (fieldsObject === true) {
            return "";
        }

        const selectedFields: string[] = [];

        for (const [fieldName, fieldValue] of Object.entries(fieldsObject)) {
            if (fieldValue === true) {
                selectedFields.push(fieldName);
                continue;
            }

            if (fieldValue && typeof fieldValue === "object") {
                const hasArguments =
                    "args" in fieldValue &&
                    fieldValue.args &&
                    Object.keys(fieldValue.args).length > 0;

                const hasSelection = "select" in fieldValue;
                const nestedFieldsObject = hasSelection ? fieldValue.select : fieldValue;
                const nestedFields = buildFields(nestedFieldsObject);

                if (hasArguments) {
                    const argumentsString = formatArguments(fieldValue.args);
                    if (nestedFields) {
                        selectedFields.push(`${fieldName}(${argumentsString}) { ${nestedFields} }`);
                    } else {
                        selectedFields.push(`${fieldName}(${argumentsString})`);
                    }
                } else if (nestedFields) {
                    selectedFields.push(`${fieldName} { ${nestedFields} }`);
                } else {
                    selectedFields.push(fieldName);
                }
            }
        }

        return selectedFields.join(" ");
    };

    const hasTopLevelArguments =
        "args" in selection && selection.args && Object.keys(selection.args).length > 0;

    const hasTopLevelSelection = "select" in selection;

    const fieldsObject = hasTopLevelSelection ? selection.select : selection;
    const fieldSelection = buildFields(fieldsObject as object | true);

    if (!hasTopLevelArguments) {
        return {
            query: `${operationType} ${operationName} { ${operationName} { ${fieldSelection} } }`,
        };
    }

    const argumentString = formatArguments(selection.args as object);

    return {
        query: `${operationType} ${operationName} { ${operationName}(${argumentString}) { ${fieldSelection} } }`,
    };
}
