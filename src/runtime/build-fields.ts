/**
 * Turn the selected fields into a GraphQL object selection
 */

export function buildGraphqlFields(selection: object | true): string {
    if (selection === true) {
        return "";
    }

    const selectedFields: string[] = [];

    for (const [field, value] of Object.entries(selection)) {
        if (value === true) {
            selectedFields.push(field);
        } else if (typeof value === "object") {
            const nestedFields = buildGraphqlFields(value);
            selectedFields.push(`${field} { ${nestedFields} }`);
        }
    }

    return `{ ${selectedFields.join(" ")} }`;
}
