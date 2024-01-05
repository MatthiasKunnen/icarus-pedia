interface ParseResult {
    functionName: string;
    arguments: Array<string>;
}

function parseFunction(text: string): ParseResult | null {
    const openParenIndex = text.indexOf('(');
    if (openParenIndex === -1) {
        return null;
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
                            case '\'':
                                i++;
                                break;
                            default:
                                console.error(`Unknown escaped char: ${text[i + 1]} in ${text}`);
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

                        return {
                            functionName,
                            arguments: args,
                        };
                    default:
                        argument += char;
                }
        }
    }

    console.error(`Failed to parse function "${text}"`);

    return null;
}

export function extractTranslation(fn: string | undefined): string | undefined {
    if (fn === undefined) {
        return undefined;
    }

    const parsed = parseFunction(fn);

    if (parsed === null) {
        return undefined;
    }

    switch (parsed.functionName) {
        case 'NSLOCTEXT':
            return parsed.arguments[2];
        default:
            return undefined;
    }
}
