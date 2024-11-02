import { fetchText } from './fetch.js';
import { splitBibTeXEntries, parseBibTeXEntry } from './bibtex/parser.js';
import { author, toText } from './bibtex/formatter.js';

async function parseBibTeXFromURL(url) {
    const bibtexText = await fetchText(url);
    if (!bibtexText) return {};

    const entries = splitBibTeXEntries(bibtexText);
    return entries
        .map(parseBibTeXEntry)
        .filter(entry => entry !== null)
        .reduce((acc, entry) => {
            entry = author(entry);
            acc[entry.id] = toText(entry);
            return acc;
        }, {});
}

function replaceCitationTag(content, bibData) {
  return content.replace(/\\cite{([^}]+)}(?:{([^}]+)})?/g, (match, id, keywords) => {
      const keywordsAttr = keywords ? ` data-keywords="${keywords}"` : '';
      return `<div class="publication_element"${keywordsAttr}>${bibData[id]}</div>` || `[Citation for ${id} not found]`;
  });
}

async function replaceCitations(bibtexUrl) {
    // BibTeXデータを取得
    const bibData = await parseBibTeXFromURL(bibtexUrl);

    const bibtexBlocks = document.querySelectorAll(".bibtex-citation-block");
    bibtexBlocks.forEach(element => {
        element.innerHTML = replaceCitationTag(element.innerHTML, bibData);
    });


};
export { replaceCitations };

