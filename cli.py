'''
    scan-manga.com downloader
    
    https://github.com/Egsagon/scan-manga-downloader
'''

import os
import re
import tqdm
import json
import decoder
import requests

root = 'https://www.scan-manga.com/'

re_reader    = re.compile(r'href=\"(.*?\/lecture-en-ligne\/.*?)\"') # Extract reader URL
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


manga_url = input('[~] Enter URL > ').strip()
assert manga_url

if not 'lecture-en-ligne/' in manga_url:
  # Fetch Reader
  
  # raise NotImplementedError('Please use reader URL instead.')
  
  print('[~] Fetching reader')
  page = fetch(manga_url).text
  readers = re_reader.findall(page)
  
  assert readers, 'No reader URL found. Make sure this manga is available or directly provide a reader URL.'
  manga_url = readers[0]

# Fetch manga page
manga_page = fetch(manga_url).text
manga_id = re_manga_id.findall(manga_page)[0]

# Fetch manga chapters data
manga_data = fetch(root + f'api/chapter/{manga_id}.json').json()
manga_dir = manga_data['m']

print('[~] Following chapters are available:')
min_chapter = float('inf')
max_chapter = 0
for chapter in manga_data['c']:
  index = int(chapter['n'])

  if min_chapter > index:
    min_chapter = index  
  if max_chapter < index:
    max_chapter = index
  
  print('    -', chapter['nt'])

# Select a chapter range
start = int(input(f'[~] Select range start [included] (default={min_chapter}) > ') or min_chapter)
stop  = int(input(f'[~] Select range stop [included] (default={max_chapter}) > ') or max_chapter)

assert min_chapter <= start <= stop
assert min_chapter <= stop <= stop

chapters = [c for c in manga_data['c'] if start <= int(c['n']) <= stop][::-1]
print(f'[~] Downloading chapters:', ', '.join(map(lambda c: c['n'], chapters)))
input('[~] Press enter to confirm > ')

# Get scan tokens
print('[~] Calculating tokens')
script = re_sm_tuples.findall(manga_page)[0]
raw = decoder.decode(script)
sme_key, sm_iv, sm_data = re_sm_data.findall(raw)[0]

sml, sme = decoder.encrypt_sm(sm_data, sme_key, sm_iv)
payload = json.dumps({'a': sme, 'b': sml})

os.makedirs(f'./{manga_dir}', exist_ok = True)

# Download
for chapter in tqdm.tqdm(chapters, desc = 'Total'):
  
  chapter_idc = chapter['i']
  chapter_url = root + f'api/lel/{chapter_idc}.json'
  chapter_html_url = root + 'lecture-en-ligne/' + chapter['u']
  
  chapter_page = fetch(
    url = chapter_url,
    method = 'POST',
    data = payload,
    headers = {
      'Origin': 'https://www.scan-manga.com',
      'source': chapter_html_url,
      'Token': 'sm'
    }
  ).text
  
  chapter_data = decoder.decode_chapter(chapter_page, chapter_idc)
  manga_slug = chapter_data['s']
  domain = 'data2.scan-manga.com'
  
  base_url = f'https://{domain}/{manga_slug}/{chapter_data["v"]}/{chapter_data["c"]}/'
  
  images = chapter_data['p'].items()
  
  for page_number, image in tqdm.tqdm(images, desc = chapter['n'], leave = True):
  
    image_url = base_url + image['f'] + '.' + image['e']
  
    req = fetch(image_url, headers = {
      'Origin': 'https://www.scan-manga.com',
      'Referer': chapter_html_url
    })
    
    image_name = f'./{manga_dir}/{manga_slug}_ch{chapter["n"]}_{page_number}.{image["e"]}'

    with open(image_name, 'wb') as file:
      file.write(req.content)

print(f'Success. Downloaded at `{manga_dir}`.')

# EOF