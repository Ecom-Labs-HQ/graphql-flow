/**
 * Format the variables passed in-line
 */

export function formatArguments(queryArguments: object): string {
    const formattedArguments: string[] = [];

    for (const [name, value] of Object.entries(queryArguments)) {
        if (typeof value === "string") {
            formattedArguments.push(`${name}: "${value}"`);
        } else {
            formattedArguments.push(`${name}: ${value}`);
        }
    }

    return formattedArguments.join(", ");
}
