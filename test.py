import urllib.request
import json
req = urllib.request.Request("http://localhost:8000/api/generate/", data=b'{"prompt": "A simple landing page output"}', headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as response:
        print("Success:", response.read().decode())
except Exception as e:
    print("Error:", e.read().decode() if hasattr(e, 'read') else str(e))
