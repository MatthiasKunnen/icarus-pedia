interface ParseResult {
    functionName: string;
    arguments: Array<string>;
}

function parseFunction(
    text: string,
): [parsed: null, error: Error] | [parsed: ParseResult, error: null] {
    const openParenIndex = text.indexOf('(');
    if (openParenIndex === -1) {
        return [null, new Error('No opening parenthese')];
    }

    const functionName = text.substring(0, openParenIndex);
    const args: Array<string> = [];

    let state: 'LFEndOfArgument' | 'LFEndOfString' | 'LFStartOfArgument' = 'LFStartOfArgument';
    let argument = '';
    for (let i = openParenIndex + 1; i < text.length; i++) {
        const char = text[i];
        switch (state) {
            case 'LFStartOfArgument':
                switch (char) {
                    case ' ':
                        break;
                    case '"':
                        state = 'LFEndOfString';
                        break;
                    default:
                        state = 'LFEndOfArgument';
                }
                break;
            case 'LFEndOfString':
                switch (char) {
                    case '\\':
                        switch (text[i + 1]) {
                            case '"':
                            case 'r':
                            case 'n':
                            case '\'':
                                i++;
                                break;
                            default:
                                return [null, new Error(
                                    `Unknown escaped char: ${text[i + 1]} in ${text}`,
                                )];
                        }
                        break;
                    case '"':
                        if (text[i + 1] === '"') {
                            i++;
                        } else {
                            state = 'LFEndOfArgument';
                        }
                        break;
                    default:
                        argument += char;
                }
                break;
            case 'LFEndOfArgument':
                switch (char) {
                    case ',':
                        args.push(argument);
                        argument = '';
                        state = 'LFStartOfArgument';
                        break;
                    case ')':
                        if (argument.length > 0) {
                            args.push(argument);
                        }

                        return [
                            {
                                functionName,
                                arguments: args,
                            },
                            null,
                        ];
                    default:
                        argument += char;
                }
        }
    }

    return [null, new Error(`Failed to parse function "${text}"`)];
}

export function extractTranslation(
    fn: string | undefined,
): [string | undefined, null] | [undefined, Error] {
    if (fn === undefined) {
        return [undefined, null];
    }

    const [parsed, err] = parseFunction(fn);
    if (err !== null) {
        return [undefined, err];
    }

    switch (parsed.functionName) {
        case 'NSLOCTEXT':
            if (parsed.arguments[2] === undefined) {
                return [undefined, new Error('No third argument in NSLOCTEXT')];
            }
            return [parsed.arguments[2], null];
        default:
            return [undefined, null];
    }
}
