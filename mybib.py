import bibtexparser
from bibtexparser.bparser import BibTexParser
from bibtexparser.customization import *
import textwrap
import re


def author(record):
    """
    Split author field into a list of "Name, Surname".

    :param record: the record.
    :type record: dict
    :returns: dict -- the modified record.

    """
    def reverse_name(name):
        m = re.match(r'(.*), (.*)', name)
        if m:
            family_name, given_name = m.groups()
            return '{} {}'.format(given_name, family_name)
        else:
            return name

    if "author" in record:
        if record["author"]:
            record["author"] = getnames([i.strip() for i in record["author"].replace('\n', ' ').split(" and ")])
            record["author"] = [reverse_name(name) for name in record['author']]
        else:
            del record["author"]
    return record

# Let's define a function to customize our entries.
# It takes a record and return this record.
def customizations(record):
    """Use some functions delivered by the library

    :param record: a record
    :returns: -- customized record
    """
    record = type(record)
    record = author(record)
    record = journal(record)
    record = link(record)
    record = page_double_hyphen(record)
    record = doi(record)

    if 'abstract' in record:
        del record['abstract']
    return record

def to_text(record):
    author = ', '.join(record['author'])
    commas = re.findall(r'(, [a-zA-Z]+ [a-zA-Z]+)', author)
    assert commas[-1] not in commas[:-1]
    author = author.replace(
            commas[-1],
            commas[-1].replace(', ', ', and ')
            )
    title = record['title']
    assert 'booktitle' in record or 'journal' in record
    booktitle = \
            record['booktitle'] if 'booktitle' in record else record['journal']['name']

    rtn = textwrap.dedent('''\
    {author}, 
    "{title}", 
    {booktitle}
    ''').replace('\n', ' ').format(
        author=author,
        title=title,
        booktitle=booktitle,
        )
    if 'volume' in record:
        rtn += ', vol. {}'.format(record['volume'])
    if 'pages' in record:
        rtn += ', p. {}'.format(record['pages'])
    if 'publisher' in record:
        rtn += ', {}'.format(record['publisher'])
    rtn += ' {}.'.format(record['year'])
    if 'url' in record:
        #assert len(record['link']) == 1
        assert 'doi' in record
        rtn += ' doi: <a href="{url}">{doi}</a>'.format(url=record['url'], doi=record['doi'])
    return rtn

def load(bib_path='publications.bib'):
    with open(bib_path) as f:
        parser = BibTexParser()
        parser.customization = customizations
        bib_database = bibtexparser.load(f, parser=parser)

    publications = {entry['ID']: to_text(entry) for entry in bib_database.entries}
    for entry in bib_database.entries:
        del entry['author']
        del entry['title']
        if 'link' in entry:
            del entry['link']
            del entry['url']
            del entry['doi']
        if 'booktitle' in entry:
            del entry['booktitle']
        if 'journal' in entry:
            del entry['journal']
        del entry['ID']
        if 'keywords' in entry:
            del entry['keywords']
        del entry['year']

    return publications
