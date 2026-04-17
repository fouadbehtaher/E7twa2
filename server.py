#!/usr/bin/env python3
"""Lightweight local server for the Ehtewaa static site."""

from __future__ import annotations

import os
import sys
from http.server import SimpleHTTPRequestHandler
from pathlib import Path
from socketserver import TCPServer


ROOT_DIR = Path(__file__).resolve().parent
HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "3000"))


class ReusableTCPServer(TCPServer):
    allow_reuse_address = True


class AppRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT_DIR), **kwargs)

    def do_GET(self):
        if self.path == "/":
            self.path = "/index.html"
        return super().do_GET()

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")

    os.chdir(ROOT_DIR)

    with ReusableTCPServer((HOST, PORT), AppRequestHandler) as httpd:
        print("=" * 50)
        print("Ehtewaa local server is running")
        print("=" * 50)
        print(f"Home:      http://{HOST}:{PORT}/index.html")
        print(f"Login:     http://{HOST}:{PORT}/login.html")
        print(f"Signup:    http://{HOST}:{PORT}/signup.html")
        print(f"Dashboard: http://{HOST}:{PORT}/dashboard.html")
        print("=" * 50)
        print("Press Ctrl+C to stop")
        print("=" * 50)
        httpd.serve_forever()


if __name__ == "__main__":
    main()
