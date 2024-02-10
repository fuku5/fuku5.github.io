import bibtexparser
from bibtexparser.bparser import BibTexParser
from bibtexparser.customization import *
import textwrap
import re
import json


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
    def reverse_name_ja(name):
        m = re.match(r'(.*), (.*)', name)
        if m:
            family_name, given_name = m.groups()
            return '{} {}'.format(given_name, family_name)
        else:
            return name

    if record["author"]:
        if '福地' in record['author']:
            ja = True
        else:
            ja = False
        record["author"] = getnames([i.strip() for i in record["author"].replace('\n', ' ').split(" and ")])
        if ja:
            record["author"] = [reverse_name_ja(name) for name in record['author']]
        else:
            record["author"] = [reverse_name(name) for name in record['author']]
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
    if len(record['author']) > 1:
        author = ', '.join(record['author'][:-1]) + ', and ' + record['author'][-1]
    else:
        author = record['author'][0]
    title = record['title']
    if 'booktitle' in record:
        booktitle = record['booktitle']
    elif 'journal' in record:
        booktitle = record['journal']['name']
    else:
        booktitle = ''

    rtn = textwrap.dedent('''\
    {author}, 
    "{title}", 
    {booktitle}, ''').replace('\n', ' ').format(
        author=author,
        title=title,
        booktitle=booktitle,
        )
    my_name_pattern = re.compile('(Yosuke Fukuchi|Fukuchi, Yosuke|福地庸介|福地 庸介)')
    rtn = my_name_pattern.sub('<span class="underdot">\\1</span>', rtn)

    if 'volume' in record and record['volume']:
        rtn += ', vol. {}'.format(record['volume'])
    if 'pages' in record:
        rtn += ', p. {}'.format(record['pages'])
    if 'publisher' in record:
        rtn += ', {}'.format(record['publisher'])
    rtn += ' {}.'.format(record['year'])
    if 'url' in record:
        #assert len(record['link']) == 1
        if 'doi' in record:
            rtn += ' doi: <a href="{url}">{doi}</a>'.format(url=record['url'], doi=record['doi'])
        else:
            rtn += ' <a href="{url}">URL</a>'.format(url=record['url'])
    elif 'doi' in record:
        rtn += ' doi: <a href="https://doi.org/{doi}">{doi}</a>'.format(doi=record['doi'])

    rtn = re.sub(r'(,( )*)+', ', ', rtn)
    rtn = re.sub(r'{(.*?)}', '\\1', rtn)
    return rtn

def load(bib_path='publications.bib'):
    with open(bib_path) as f:
        parser = BibTexParser()
        parser.customization = customizations
        bib_database = bibtexparser.load(f, parser=parser)

    publications = {entry['ID']: to_text(entry) for entry in bib_database.entries}
    keywords = {entry['ID']: json.dumps(entry['keywords'].split(', ')) for entry in bib_database.entries if 'keywords' in entry.keys() and entry['keywords'] != ''}

    return publications, keywords

