import urllib.request
import json

# request json file
url = 'http://student.mit.edu/catalog/m1a.html'
response = urllib.request.urlopen(url).read()
data = response.decode('utf-8')

# write to console
print(data)