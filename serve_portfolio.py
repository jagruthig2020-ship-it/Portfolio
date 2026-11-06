"""Serve this extracted portfolio with fresh assets on each request."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Timer
import socket
import webbrowser
import os

root = Path(__file__).resolve().parent
os.chdir(root)

class FreshFiles(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, max-age=0')
        super().end_headers()

port = 8020
for candidate in range(8020, 8031):
    try:
        server = ThreadingHTTPServer(('127.0.0.1', candidate), FreshFiles)
        port = candidate
        break
    except OSError:
        continue
else:
    raise SystemExit('Ports 8020–8030 are busy. Stop the previous preview and try again.')
url = f'http://localhost:{port}/'
print(f'Jagruthi Portfolio — Red Thread Edit 10\nFolder: {root}\nOpen: {url}\nKeep this terminal open. Press Ctrl+C to stop.', flush=True)
Timer(0.7, lambda: webbrowser.open(url)).start()
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
