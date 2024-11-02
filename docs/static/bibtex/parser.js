export function splitBibTeXEntries(bibtexText) {
    return bibtexText.split(/(?=@)/).filter(entry => entry.trim() !== "");
}

export function parseBibTeXEntry(entry) {
    const result = {};

    const typeMatch = entry.match(/^@\w+/);
    const idMatch = entry.match(/{(.+?),/);

    if (typeMatch && idMatch) {
        result.type = typeMatch[0].slice(1);
        result.id = idMatch[1].trim();
    } else {
        return null;
    }

    const fieldRegex = /(\w+)\s*=\s*{([^}]+)}/g;
    let fieldMatch;
    while ((fieldMatch = fieldRegex.exec(entry)) !== null) {
        result[fieldMatch[1].trim().toLowerCase()] = fieldMatch[2].trim();
    }

    return result;
}

