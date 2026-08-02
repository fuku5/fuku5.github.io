import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  splitBibTeXEntries,
  parseBibTeXEntry
} from "../docs/static/bibtex/parser.js";

import {
  author,
  toText
} from "../docs/static/bibtex/formatter.js";

const siteDirectory = path.resolve(process.argv[2] ?? "_site");
const bibPath = path.join(
  siteDirectory,
  "files",
  "publications.bib"
);

function escapeHtmlAttribute(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;");
}

async function listFiles(directory) {
  const entries = await readdir(directory, {
    withFileTypes: true
  });

  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await listFiles(entryPath));
    } else {
      files.push(entryPath);
    }
  }

  return files;
}

const bibText = await readFile(bibPath, "utf8");

const parsedEntries = splitBibTeXEntries(bibText)
  .map(parseBibTeXEntry)
  .filter((entry) => entry !== null);

const bibliography = new Map();

for (const entry of parsedEntries) {
  if (!entry.id) {
    throw new Error(
      "A BibTeX entry has no citation key."
    );
  }

  if (!entry.author) {
    throw new Error(
      `BibTeX entry "${entry.id}" has no author.`
    );
  }

  if (!entry.title) {
    throw new Error(
      `BibTeX entry "${entry.id}" has no title.`
    );
  }

  if (!entry.year) {
    throw new Error(
      `BibTeX entry "${entry.id}" has no year.`
    );
  }

  if (bibliography.has(entry.id)) {
    throw new Error(
      `Duplicate BibTeX citation key: ${entry.id}`
    );
  }

  bibliography.set(
    entry.id,
    toText(author(entry))
  );
}

const htmlFiles = (await listFiles(siteDirectory))
  .filter((filePath) => filePath.endsWith(".html"));

let renderedCitationCount = 0;
let changedFileCount = 0;

for (const htmlPath of htmlFiles) {
  const originalHtml = await readFile(
    htmlPath,
    "utf8"
  );

  let html = originalHtml;

  html = html.replace(
    /\\cite{([^}]+)}(?:{([^}]+)})?/g,
    (match, citationId, keywords) => {
      const citation = bibliography.get(citationId);

      if (citation === undefined) {
        throw new Error(
          `Citation "${citationId}" in ${htmlPath} ` +
          "was not found in publications.bib."
        );
      }

      renderedCitationCount += 1;

      const keywordsAttribute =
        keywords === undefined
          ? ""
          : ` data-keywords="${escapeHtmlAttribute(keywords)}"`;

      return (
        `<div class="publication_element"` +
        `${keywordsAttribute}>` +
        `${citation}</div>`
      );
    }
  );

  html = html.replace(
    /(<div class="bibtex-citation-block")\s+style="visibility:\s*hidden;?"/g,
    "$1"
  );

  if (html.includes("\\cite{")) {
    throw new Error(
      `An unresolved citation remains in ${htmlPath}.`
    );
  }

  if (html !== originalHtml) {
    await writeFile(htmlPath, html, "utf8");
    changedFileCount += 1;
  }
}

if (renderedCitationCount === 0) {
  throw new Error(
    "No BibTeX citations were found in the generated HTML."
  );
}

console.log(
  `Rendered ${renderedCitationCount} citations ` +
  `in ${changedFileCount} HTML file(s).`
);
