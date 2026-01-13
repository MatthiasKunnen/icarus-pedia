const toHtmlIdRegex = /[^a-zA-Z0-9\-_]/gu;

export function toHtmlId(input: string): string {
    return input.replace(toHtmlIdRegex, '_');
}
