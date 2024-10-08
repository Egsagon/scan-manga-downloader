'''
    scan-manga.com downloader
    
    https://github.com/Egsagon/scan-manga-downloader
'''

import os
import re
import tqdm
import json
import decoder
import zipfile
import traceback
from curl_cffi import requests

ROOT = 'https://www.scan-manga.com/'

HEADERS = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'en-US,en;q=0.5',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Host': 'www.scan-manga.com',
    'Priority': 'u=0, i',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
}

ps1 = '\x1b[1m[~]\x1b[0m'

re_reader    = re.compile(r'href=\"(.*?\/lecture-en-ligne\/.*?)\"'                       ) # Extract reader URL
re_sm_tuples = re.compile(r'\(\"(.*?)\",(\d+),\"(.*?)\",(\d+),(\d+),(\d+)\)',  re.DOTALL ) # Catch SML & SMI tuples
re_sm_data   = re.compile(r'e\(\"(.+?)\".*?e\(\"(.+?)\".*?nent\(\"(.*?)\"\);', re.DOTALL ) # Extract SMX encrypt keys 
re_url_id    = re.compile(r'_(\d+)\.html'                                                ) # Extract data id from URL
re_manga_id  = re.compile(r'const idm = (\d+);'                                          ) # Extract manga id

session: requests.Session = None

def init() -> None:
    '''Initialise a new session.'''
    
    global session
    session = requests.Session()
    session.headers = HEADERS

def fetch(url, method = 'GET', data = None, headers = None) -> requests.Response:
    '''Request wrapper'''
    
    res = session.request(method, url, data = data, headers = headers, impersonate = 'chrome')
    res.raise_for_status()
    return res

def main() -> None:
    '''Main script.'''
    
    print('\x1b[96m>>> scan-manga.com downloader\n\x1b[0m')
    init()
    
    manga_url = input(ps1 + ' Enter URL > ').strip()
    assert manga_url, 'Invalid URL'
    assert 'https://' in manga_url, 'Invalid URL'
    
    if not 'lecture-en-ligne/' in manga_url:
        # Fetch Reader
        
        print(ps1, 'Fetching reader')
        page = fetch(manga_url).text
        readers = re_reader.findall(page)
        
        assert readers, 'No reader URL found. Make sure this manga is available or provide a direct reader URL.'
        manga_url = readers[-1] # Presumably oldest chapter
        
        # Reset session. No idea why this fixes non-reader URLs.
        init()
    
    # Fetch manga page
    manga_page = fetch(manga_url).text
    manga_id = re_manga_id.findall(manga_page)[0]

    # Fetch manga chapters data
    manga_data = fetch(ROOT + f'api/chapter/{manga_id}.json').json()
    manga_dir = manga_data['m']

    print(ps1, 'Following chapters are available:')
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
    start = int(input(ps1 + f' Select range start [included] (default={min_chapter}) > ') or min_chapter)
    stop  = int(input(ps1 + f' Select range stop [included] (default={max_chapter}) > ') or max_chapter)

    assert min_chapter <= start <= stop, 'Range out of limits'
    assert min_chapter <= stop <= stop, 'Range out of limits'

    chapters = [c for c in manga_data['c'] if start <= int(c['n']) <= stop][::-1]
    print(ps1, f'Downloading chapters:', ', '.join(map(lambda c: c['n'], chapters)))
    input(ps1 + ' Press enter to confirm > ')

    # Get scan tokens
    print(ps1, 'Calculating tokens')
    script = re_sm_tuples.findall(manga_page)[0]
    raw = decoder.decode(script)
    sme_key, sm_iv, sm_data = re_sm_data.findall(raw)[0]

    sml, sme = decoder.encrypt_sm(sm_data, sme_key, sm_iv)
    payload = json.dumps({'a': sme, 'b': sml})

    os.makedirs(f'./{manga_dir}', exist_ok = True)

    # Download
    for chapter in tqdm.tqdm(chapters, desc = 'Total'):

        chapter_idc = chapter['i']
        chapter_url = ROOT + f'api/lel/{chapter_idc}.json'
        chapter_html_url = ROOT + 'lecture-en-ligne/' + chapter['u']

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
        domain = 'lel.scan-manga.com:8443'

        base_url = f'https://{domain}/{manga_slug}/{chapter_data["v"]}/{chapter_data["c"]}/'

        images = chapter_data['p'].items()
        
        with zipfile.ZipFile(f'./{manga_dir}/chapter-{chapter["n"]}.cbz', 'w') as archive:

            for page_number, image in tqdm.tqdm(images, desc = chapter['n'].zfill(5), leave = False):

                image_url = base_url + image['f'] + '.' + image['e']

                req = fetch(image_url, headers = {
                    'Origin': 'https://www.scan-manga.com',
                    'Referer': chapter_html_url
                })
                
                image_name = f'ch{chapter["n"]}_p{page_number}.{image["e"]}'
                archive.writestr(image_name, req.content)
    
    print(ps1, f'Success. Downloaded at `{manga_dir}`.')

if __name__ == '__main__':
    
    try:
        main()
    
    except KeyboardInterrupt:
        print('\n\x1b[91mAborted.\x1b[0m')
    
    except AssertionError as err:
        print(f'\x1b[91mInvalid:', err, '\x1b[0m')
    
    except Exception as err:
        print('\x1b[91mUnhandled error:')
        traceback.print_tb(err.__traceback__)
        print(err)
        print('\x1b[0m')
    
    input('\n\n\x1b[2mProcess terminated. Press Enter to close window.\x1b[0m')

# EOF