import requests
import time
from requests.exceptions import RequestException

api_url = "http://localhost:5000/api/images"
filename = "metmuseum_images.txt"

def populate(url, max_attempts=3, backoff_seconds=2):
    body = {"origin": url}
    for attempt in range(1, max_attempts + 1):
        try:
            resp = requests.post(api_url, json=body, timeout=10)
            if resp.ok:
                print(f"Added image URL to DB: {url}")
                return True
            else:
                print(f"Attempt {attempt}: Failed to add image URL to DB (status {resp.status_code}): {url}")
        except RequestException as exc:
            print(f"Attempt {attempt}: Request error adding {url}: {exc}")
        if attempt < max_attempts:
            time.sleep(backoff_seconds)
            print(f"Retrying ({attempt + 1}/{max_attempts})...")
    print(f"Skipping URL after {max_attempts} attempts: {url}")
    return False

print("Populating DB with Metmuseum image urls...")

with open(filename, 'r') as file:
    for line in file:
        populate(line.strip())