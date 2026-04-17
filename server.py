#!/usr/bin/env python3
"""Lightweight local server for the Ehtewaa static site."""

from __future__ import annotations

import os
import socket
import sys
from http.server import SimpleHTTPRequestHandler
from pathlib import Path
from socketserver import TCPServer, ThreadingMixIn


ROOT_DIR = Path(__file__).resolve().parent
HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", "3000"))


def get_local_ipv4_addresses() -> list[str]:
    addresses: list[str] = []
    seen: set[str] = set()

    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
            sock.connect(("8.8.8.8", 80))
            primary_ip = sock.getsockname()[0]
            if not primary_ip.startswith(("127.", "169.254.")):
                seen.add(primary_ip)
                addresses.append(primary_ip)
    except OSError:
        pass

    try:
        hostname = socket.gethostname()
        for result in socket.getaddrinfo(hostname, None, family=socket.AF_INET):
            ip = result[4][0]
            if ip.startswith(("127.", "169.254.")) or ip in seen:
                continue
            seen.add(ip)
            addresses.append(ip)
    except socket.gaierror:
        pass

    return addresses


class ReusableThreadingTCPServer(ThreadingMixIn, TCPServer):
    allow_reuse_address = True
    daemon_threads = True


class AppRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT_DIR), **kwargs)

    def do_GET(self):
        if self.path == "/":
            self.path = "/index.html"
        return super().do_GET()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()


def print_access_urls() -> None:
    print("=" * 60)
    print("Ehtewaa local server is running")
    print("=" * 60)
    print(f"Local device: http://localhost:{PORT}/index.html")

    if HOST in {"0.0.0.0", "::", ""}:
        network_urls = [f"http://{ip}:{PORT}/index.html" for ip in get_local_ipv4_addresses()]
        if network_urls:
            print(f"Recommended for other devices: {network_urls[0]}")
            if len(network_urls) > 1:
                print("Additional network adapters:")
                for url in network_urls[1:]:
                    print(f"  {url}")
        else:
            print("Other devices can open the app using this computer IP and port.")
    elif HOST not in {"127.0.0.1", "localhost"}:
        print("Other devices can open:")
        print(f"  http://{HOST}:{PORT}/index.html")
    else:
        print("LAN access is disabled. Set HOST=0.0.0.0 to allow other devices.")

    print(f"Host binding: {HOST}:{PORT}")
    print("=" * 60)
    print("Press Ctrl+C to stop")
    print("=" * 60)


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")

    os.chdir(ROOT_DIR)

    with ReusableThreadingTCPServer((HOST, PORT), AppRequestHandler) as httpd:
        print_access_urls()
        httpd.serve_forever()


if __name__ == "__main__":
    main()
