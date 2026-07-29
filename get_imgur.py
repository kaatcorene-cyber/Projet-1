import urllib.request
import re

req = urllib.request.Request('https://imgur.com/a/DW8MY2u', headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')
matches = re.findall(r'https://i\.imgur\.com/([a-zA-Z0-9]+)\.(jpg|png|jpeg)', html)
print(set(matches))
