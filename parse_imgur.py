import urllib.request
import re

req = urllib.request.Request('https://imgur.com/a/EVYFGKj', headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    with open("imgur.html", "w") as f:
        f.write(html)
    print("Saved to imgur.html")
except Exception as e:
    print(e)
