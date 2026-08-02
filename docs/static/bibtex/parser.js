export function splitBibTeXEntries(bibtexText) {
    return bibtexText.split(/(?=@)/).filter(entry => entry.trim() !== "");
}

function isEscaped(text, index) {
    let backslashCount = 0;

    for (let i = index - 1; i >= 0 && text[i] === '\\'; i--) {
        backslashCount++;
    }

    return backslashCount % 2 === 1;
}

function readBracedValue(text, start) {
    if (text[start] !== '{') {
        throw new Error(`Expected "{" at position ${start}`);
    }

    let depth = 1;
    let index = start + 1;
    const valueStart = index;

    while (index < text.length && depth > 0) {
        if (!isEscaped(text, index)) {
            if (text[index] === '{') {
                depth++;
            } else if (text[index] === '}') {
                depth--;
            }
        }

        index++;
    }

    if (depth !== 0) {
        throw new Error('Unbalanced braces in BibTeX field');
    }

    return {
        value: text.slice(valueStart, index - 1),
        nextIndex: index
    };
}

function readQuotedValue(text, start) {
    if (text[start] !== '"') {
        throw new Error(`Expected '"' at position ${start}`);
    }

    let index = start + 1;
    const valueStart = index;

    while (index < text.length) {
        if (text[index] === '"' && !isEscaped(text, index)) {
            return {
                value: text.slice(valueStart, index),
                nextIndex: index + 1
            };
        }

        index++;
    }

    throw new Error('Unterminated quoted value in BibTeX field');
}

function readBareValue(text, start) {
    let index = start;

    while (
        index < text.length &&
        !/[\s,#})]/.test(text[index])
    ) {
        index++;
    }

    if (index === start) {
        throw new Error(`Expected a BibTeX value at position ${start}`);
    }

    return {
        value: text.slice(start, index),
        nextIndex: index
    };
}

function skipWhitespace(text, start) {
    let index = start;

    while (index < text.length && /\s/.test(text[index])) {
        index++;
    }

    return index;
}

function readFieldValue(text, start) {
    let index = skipWhitespace(text, start);
    const parts = [];

    while (index < text.length) {
        let parsed;

        if (text[index] === '{') {
            parsed = readBracedValue(text, index);
        } else if (text[index] === '"') {
            parsed = readQuotedValue(text, index);
        } else {
            parsed = readBareValue(text, index);
        }

        parts.push(parsed.value);
        index = skipWhitespace(text, parsed.nextIndex);

        if (text[index] !== '#') {
            break;
        }

        index = skipWhitespace(text, index + 1);
    }

    return {
        value: parts.join(''),
        nextIndex: index
    };
}

export function parseBibTeXEntry(entry) {
    const result = {};
    const headerMatch = entry.match(
        /^@\s*([A-Za-z]+)\s*[({]\s*([^,\s]+)\s*,/
    );

    if (!headerMatch) {
        return null;
    }

    result.type = headerMatch[1];
    result.id = headerMatch[2].trim();

    let index = headerMatch[0].length;

    while (index < entry.length) {
        while (index < entry.length && /[\s,]/.test(entry[index])) {
            index++;
        }

        if (entry[index] === '}' || entry[index] === ')') {
            break;
        }

        const nameMatch = entry.slice(index).match(/^([A-Za-z][\w-]*)\s*=/);

        if (!nameMatch) {
            throw new Error(`Invalid BibTeX field near position ${index}`);
        }

        const fieldName = nameMatch[1].toLowerCase();
        index += nameMatch[0].length;

        const parsed = readFieldValue(entry, index);
        result[fieldName] = parsed.value.trim();
        index = parsed.nextIndex;
    }

    return result;
}
