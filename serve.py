#!/usr/bin/env python3
"""Local preview that behaves like Vercel with cleanUrls enabled.

The site links to /about rather than /about.html, which python -m http.server
cannot resolve. This serves the same folder, but for a path with no extension
it looks for <path>.html first, and falls back to 404.html the way Vercel does.

    ./serve.sh          →  http://localhost:8080
"""

import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
ROOT = os.path.dirname(os.path.abspath(__file__))


class CleanURLHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def translate_path(self, path):
        local = super().translate_path(path)

        # A real file or a directory with an index: nothing to do.
        if os.path.isfile(local):
            return local
        if os.path.isdir(local) and os.path.isfile(os.path.join(local, "index.html")):
            return local

        # Extensionless request: try the matching .html file.
        if not os.path.splitext(local)[1]:
            candidate = local.rstrip("/") + ".html"
            if os.path.isfile(candidate):
                return candidate

        return local

    def end_headers(self):
        # SimpleHTTPRequestHandler sends Last-Modified and nothing else, which
        # lets a browser cache heuristically and serve a stale stylesheet or a
        # stale ES module while you debug the fresh one. That has cost real time
        # more than once. Nothing here is worth caching: the whole point of this
        # server is to show what is on disk right now.
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def send_error(self, code, message=None, explain=None):
        # Serve the branded 404 page, keeping the 404 status.
        page = os.path.join(ROOT, "404.html")
        if code == 404 and os.path.isfile(page):
            body = open(page, "rb").read()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(body)
            return
        super().send_error(code, message, explain)

    def log_message(self, fmt, *args):
        sys.stderr.write("  %s\n" % (fmt % args))


if __name__ == "__main__":
    print("Bottle Builders is at http://localhost:%d  (ctrl-c to stop)" % PORT)
    print("Clean URLs are on: /about serves about.html")
    try:
        HTTPServer(("", PORT), CleanURLHandler).serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")
