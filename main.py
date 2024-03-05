import re
import json
import requests

import decoder

manga_url = 'https://www.scan-manga.com/lecture-en-ligne/Tensei-Shitara-Slime-Datta-Ken-Chapitre-1-FR_285197.html'

root = 'https://www.scan-manga.com/'

re_sm_tuples = re.compile(r'\(\"(.*?)\",(\d+),\"(.*?)\",(\d+),(\d+),(\d+)\)', re.DOTALL) # Catch SML & SMI tuples
re_sm_data   = re.compile(r'e\(\"(.+?)\".*?e\(\"(.+?)\".*?nent\(\"(.*?)\"\);', re.DOTALL) # Extract SMX encrypt keys 
re_url_id    = re.compile(r'_(\d+)\.html') # Extract data id from URL
re_manga_id  = re.compile(r'const idm = (\d+);') # Extract manga id

session = requests.Session()
session.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0'

def fetch(url, method = 'GET', data = None, headers = None) -> requests.Response:
  '''Request wrapper'''

  res = session.request(method, url, data = data, headers = headers)
  res.raise_for_status()
  return res


# >>=>> Fetch manga page & chapters
manga_page = fetch(manga_url).text
manga_id = re_manga_id.findall(manga_page)[0]

# >>=>> Fetch manga chapters data
chapters = fetch(root + f'api/chapter/{manga_id}.json').json()

# >>=>> Select a chapter
chapter = chapters['c'][0] # chapter 0
chapter_title = chapter['t']
chapter_idc = chapter['i']
chapter_url = f'api/lel/{chapter_idc}.json'

# >>=>> Get encryption keys
script = re_sm_tuples.findall(manga_page)[0]
raw = decoder.decode(script)
sme_key, sm_iv, sm_data = re_sm_data.findall(raw)[0]

sml, sme = decoder.encrypt_sm(sm_data, sme_key, sm_iv)

# >>=>> Fetch chapter data
payload = json.dumps({'a': sme, 'b': sml})

encrypted = fetch(
  url = root + chapter_url,
  method = 'POST',
  data = payload,
  headers = {
    'Origin': 'https://www.scan-manga.com',
    'source': manga_url,
    'Token': 'sm'
  }
).text

# >>=>> Decrypt chapter data
chapter_data = decoder.decode_chapter(encrypted, chapter_idc)

# >>=>> Download data
domain = chapter_data['dN']
manga_slug = chapter_data['s']

domain = 'data2.scan-manga.com'

base_url = f'https://{domain}/{manga_slug}/{chapter_data["v"]}/{chapter_data["c"]}/'

images = [ base_url + page['f'] + '.' + page['e'] for page in chapter_data['p'].values() ]

subject = images[0]

req = fetch(subject, headers = {
  'Origin': 'https://www.scan-manga.com',
  'Referer': 'https://www.scan-manga.com/lecture-en-ligne/Tensei-Shitara-Slime-Datta-Ken-Chapitre-102-FR_285197.html'
})

with open('temp.png', 'wb') as file:
  file.write(req.content)

# EOF