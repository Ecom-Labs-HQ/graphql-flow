/**
 * Generate a multi-line comment for the types using the description field
 */

export function generateTypeComment(graphqlDescription?: string | null): string {
    if (!graphqlDescription) {
        return "";
    }

    const trimmedDescription = graphqlDescription.trim();
    if (!trimmedDescription) {
        return "";
    }

    const descriptionLines = trimmedDescription.split("\n");

    const formattedLines = descriptionLines.map((line) => {
        const trimmedLine = line.trim();
        return trimmedLine ? ` * ${trimmedLine}` : " *";
    });

    return ["/**", ...formattedLines, " */"].join("\n");
}
