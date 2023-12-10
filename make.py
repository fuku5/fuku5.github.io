import datetime
import re
import json
from pathlib import Path

import mybib

publications, keywords = mybib.load()

paths = Path().glob('templates/*.md')
DOCS_DIR = Path('./docs')

for path in paths:
    if path.name == 'README.md':
        print('skipped {}'.format(path.name))
        continue
    data = path.open().read()
    data = '<!-- DON\'T EDIT THIS FILE -->\n' \
            + '<!-- EDIT index.md and run make.py -->\n' \
            + data
    data = data.replace('{{  today  }}', datetime.date.today().strftime('%Y/%m/%d'))
    for tag, argument_str, additional in re.findall(r'(\\cite{.*?})({.*})?(.*)', data):
        bib_id = re.search(r'\\cite{(.*)}', tag).group(1)

        part = '<div class="publication_element" ' 
        print(tag, argument_str, additional)
        if argument_str:
            assert argument_str[0] == '{' and argument_str[-1] == '}'
            argument = json.loads(argument_str[1:-1])
            for key, value in argument.items():
                part += f'data-{key}="{value}" '

        part += '>'
        part += publications[bib_id]
        part += ' ' + additional + '</div>'
        data = data.replace(tag+argument_str+additional, part)

    print('load {}'.format(path))
    with (DOCS_DIR / path.name).open('w') as f:
        f.write(data)
    print('dump: {}'.format(DOCS_DIR / path.name))
