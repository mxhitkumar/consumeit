#!/usr/bin/env python3
"""Local preview server for the ConsumeIT static site.

    python3 preview.py            -> http://localhost:8000

Serves no-cache headers so you always see the current files (a normal static
server lets the browser cache CSS/JS, which is the usual reason edits look
like they "didn't apply"). Also resolves extensionless URLs, so both
/about and /about.html work here exactly as they do on Render.
"""
import http.server, socketserver, os, sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
os.chdir(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def translate_path(self, path):
        full = super().translate_path(path)
        if not os.path.exists(full) and not path.endswith("/"):
            if os.path.exists(full + ".html"):
                return full + ".html"
        return full


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
    print("ConsumeIT preview running:  http://localhost:%d" % PORT)
    print("  homepage        http://localhost:%d/" % PORT)
    print("  campaign page   http://localhost:%d/content-creation.html" % PORT)
    print("Press Ctrl+C to stop.")
    httpd.serve_forever()
