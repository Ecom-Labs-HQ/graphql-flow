/**
 * Format the variables passed in-line
 */

export function formatArguments(queryArguments: object): string {
    const formattedArguments: string[] = [];

    function formatValue(value: unknown, depth: number = 0): string {
        if (typeof value === "string") {
            return `"${value}"`;
        }

        if (typeof value === "object" && value !== null) {
            const nestedEntries = Object.entries(value);
            if (nestedEntries.length === 0) {
                return "{}";
            }

            const formattedNested = nestedEntries.map(([nestedName, nestedValue]) => {
                const formattedNestedValue = formatValue(nestedValue, depth + 1);
                return `${nestedName}: ${formattedNestedValue}`;
            });

            return `{ ${formattedNested.join(", ")} }`;
        }

        if (value === null || value === undefined) {
            return "null";
        }

        return String(value);
    }

    for (const [name, value] of Object.entries(queryArguments)) {
        const formattedValue = formatValue(value);
        formattedArguments.push(`${name}: ${formattedValue}`);
    }

    return formattedArguments.join(", ");
}
