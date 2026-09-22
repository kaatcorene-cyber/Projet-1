import urllib.request
import re
import sys

req = urllib.request.Request('https://imgur.com/a/DW8MY2u', headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')
match = re.search(r'https://i.imgur.com/([a-zA-Z0-9]+)\.(jpg|png|jpeg)', html)
if match:
    url = match.group(0)
    print(f"Found URL: {url}")
    urllib.request.urlretrieve(url, 'public/olam_custom_logo.jpg')
    print("Downloaded to public/olam_custom_logo.jpg")
else:
    print("No image found")
