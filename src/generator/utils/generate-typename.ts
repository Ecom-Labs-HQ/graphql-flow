/**
 * Generate the __typename field
 */

export function generateTypename(fieldName: string): string {
    return `{ strippedType: "${fieldName}", returnType: "${fieldName}", arguments: never }`;
}
