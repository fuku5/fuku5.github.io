import re
from pathlib import Path

import mybib

publications = mybib.load()
#print(publications)

paths = Path('templates').glob('*.md')

for path in paths:
    data = path.open().read()
    data = '<!- DON\'T EDIT THIS FILE -->\n' \
            + '<!- EDIT templates/index.md and run make.py -->\n' \
            + data
    for tag in re.findall(r'\\cite{.*}', data):
        bib_id = re.search(r'cite{(.*)}', data).group(1)
        data = data.replace(tag, publications[bib_id])

    with open('./{}'.format(path.name), 'w') as f:
        f.write(data)
    print('dump: {}'.format(path.name))
