/**
 * Capitalize the first letter of a string
 */

export function capitalize(input: string): string {
    if (!input) {
        return input;
    }

    return input.charAt(0).toUpperCase() + input.slice(1);
}
