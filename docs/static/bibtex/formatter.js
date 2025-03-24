function reverseName(name, isJa = false) {
    const match = name.match(/(.*), (.*)/);
    if (match) {
        const [_, familyName, givenName] = match;
        return isJa ? `${givenName} ${familyName}` : `${givenName} ${familyName}`;
    }
    return name;
}

function parseAuthorNames(authors, isJa = false) {
    const authorList = authors.replace(/\n/g, ' ').split(" and ").map(name => name.trim());
    return authorList.map(name => reverseName(name, isJa));
}

export function author(record) {
    const isJa = record.author && record.author.includes('福地');
    record.author = parseAuthorNames(record.author || '', isJa);
    return record;
}

export function toText(record) {
    let author;
    if (record.author.length > 1) {
        // author = record.author.slice(0, -1).join(', ') + ', and ' + record.author[record.author.length - 1];
        author = record.author.join(', ');
    } else {
        author = record.author[0];
    }

    const title = record.title;
    const booktitle = record.booktitle || record.journal || '';


    let rtn = `
    ${author}, 
    "${title}", 
    ${booktitle}, `.replace(/\n/g, ' ');

    const myNamePattern = /(Yosuke Fukuchi|Fukuchi, Yosuke|福地庸介|福地 庸介)/g;
    rtn = rtn.replace(myNamePattern, '<span class="underdot">$1</span>');

    if (record.volume) {
        rtn += `, vol. ${record.volume}`;
    }
    if (record.pages) {
        rtn += `, p. ${record.pages.replace('--', '-')}`;
    }
    if (record.publisher) {
        rtn += `, ${record.publisher}`;
    }
    rtn += `, ${record.year || ''}.`;

    if (record.url) {
        if (record.doi) {
            rtn += ` doi: <a href="${record.url}">${record.doi}</a>`;
        } else {
            rtn += ` <a href="${record.url}">URL</a>`;
        }
    } else if (record.doi) {
        rtn += ` doi: <a href="https://doi.org/${record.doi}">${record.doi}</a>`;
    }

    rtn = rtn.replace(/(,( )*)+/g, ', ');
    rtn = rtn.replace(/{(.*?)}/g, '$1');
    return rtn;
}

