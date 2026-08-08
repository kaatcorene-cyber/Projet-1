import urllib.request
import re
req = urllib.request.Request('https://imgur.com/a/4vcZalt', headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    matches = re.findall(r'https://i\.imgur\.com/[a-zA-Z0-9]+\.(?:jpg|png|jpeg)', html)
    print("4vcZalt", set(matches))
except Exception as e:
    print(e)
