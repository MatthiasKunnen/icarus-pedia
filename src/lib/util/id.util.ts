const toHtmlIdRegex = /[^a-zA-Z0-9\-_]+/gu;

const textEncoder = new TextEncoder();
const memory = new Map<string, string>();

export function toHtmlId(input: string): string {
    const existingValue = memory.get(input);
    if (existingValue !== undefined) {
        return existingValue;
    }

    const output = input.replace(toHtmlIdRegex, (substring) => {
        return Array.from(
            textEncoder.encode(substring),
            byte => byte.toString(16).padStart(2, '0'),
        ).join('');
    });

    memory.set(input, output);
    return output;
}
