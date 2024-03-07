import uuid
import json
import time
import sqlite3
from cli import init, fetch
from bs4 import BeautifulSoup as Soup
from concurrent.futures import ThreadPoolExecutor, as_completed

# Config
max_workers = 4
base_path = 'base.db'

def get_manga(project: Soup, index: int, project_uuid: str) -> None:
    '''Scrape a single manga.'''
    
    global total_fetches
    
    project_id = project.get('rel')[0]
    project_url = project.get('href')
    
    retries = 0
    
    while 1:
        try:
            project_data = fetch(f'https://www.scan-manga.com/popmanga_{project_id}.json').json()
            break
        
        except:
            retries += 1
            time.sleep(3)
    
    base.execute('insert or replace into main values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', (
        project_uuid,
        project_url,
        project_id,
        *project_data[0:6],
        json.dumps(project_data[7].split(', '))
    ))
    
    retries_repr = f'\x1b[91m[{retries} retries]\x1b[0m' if retries else ''
    print(f'\t[{index: >3}] \x1b[94m{project_uuid}\x1b[0m', retries_repr)
    total_fetches += 1

total_fetches = 0
base = sqlite3.connect(base_path, check_same_thread = False)
base.execute('create table if not exists main (uuid UNIQUE, url, id, title, author, editor, genre, desc, thumb, tags)')

init()
start = time.time()

print('Fetching page...')
page = fetch('https://www.scan-manga.com/Teams.html')

print('Preparing soup...')
soup = Soup(page.text, 'html.parser')
teams = soup.find_all('div', {'class': 'liens_externes folder_corner'})

for team_index, team in enumerate(teams):
    team: Soup
    
    team_name = team.find('h3').text    
    projects = team.find('div', {'class': 'hidden_projet'}).find_all('a')
    
    print(f'[{team_index: >3}] Team \x1b[95m"{team_name}"\x1b[0m ({len(projects)} projects)')
    
    with ThreadPoolExecutor(max_workers = 4) as executor:
        
        future_to_uuid = {executor.submit(get_manga, p, pi, puuid := uuid.uuid4().hex): puuid
                          for pi, p in enumerate(projects)}
        
        for future in as_completed(future_to_uuid):
            project_uuid = future_to_uuid[future]
            future.result()

process_duration = int(time.time() - start)
print(f'\nFetched {total_fetches} projects among {len(teams)} teams in {process_duration}s.')
print(f'Writing {base.total_changes} changes to database.')
base.commit()
base.close()

# EOF