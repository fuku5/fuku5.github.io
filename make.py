import datetime
import re
from pathlib import Path

import mybib

publications = mybib.load()

paths = Path().glob('*.md')

for path in paths:
    if path.name == 'README.md':
        print('skipped {}'.format(path.name))
        continue
    data = path.open().read()
    data = '<!-- DON\'T EDIT THIS FILE -->\n' \
            + '<!-- EDIT index.md and run make.py -->\n' \
            + data
    data = data.replace('{{  today  }}', datetime.date.today().strftime('%Y/%m/%d'))
    for tag in re.findall(r'\\cite{.*}', data):
        bib_id = re.search(r'\\cite{(.*)}', tag).group(1)
        data = data.replace(tag, publications[bib_id])

    print('load {}'.format(path))
    with open('./docs/{}'.format(path.name), 'w') as f:
        f.write(data)
    print('dump: {}'.format(path.name))
