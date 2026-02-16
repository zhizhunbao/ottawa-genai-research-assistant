"""
Ottawa GenAI — Local Tunnel to Public Internet

Deploy locally and access from public internet via Cloudflare Tunnel or ngrok.

Usage:
    python scripts/tunnel.py                          # Cloudflare (default)
    python scripts/tunnel.py --provider ngrok         # ngrok
    python scripts/tunnel.py --backend-port 8000      # custom port
    python scripts/tunnel.py --frontend-only          # only expose frontend
"""

import argparse
import os
import shutil
import signal
import subprocess
import sys
import threading
import time
import re


# ── ANSI Colors ──────────────────────────────────────────────────────
class C:
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    MAGENTA = "\033[95m"
    DIM = "\033[90m"
    BOLD = "\033[1m"
    RESET = "\033[0m"


def banner(provider: str) -> None:
    print(f"""
{C.CYAN}{'=' * 48}
  Ottawa GenAI — Public Tunnel Setup
  Provider: {C.BOLD}{provider}{C.RESET}{C.CYAN}
{'=' * 48}{C.RESET}
""")


def check_command(cmd: str) -> bool:
    """Check if a command is available in PATH."""
    return shutil.which(cmd) is not None


def stream_output(proc: subprocess.Popen, label: str, color: str, url_holder: dict) -> None:
    """Stream subprocess output and detect tunnel URLs."""
    assert proc.stderr is not None
    for raw_line in proc.stderr:
        line = raw_line.decode("utf-8", errors="replace").strip()
        if not line:
            continue

        # Detect Cloudflare tunnel URL
        match = re.search(r"(https://[a-z0-9-]+\.trycloudflare\.com)", line)
        if match:
            url = match.group(1)
            url_holder["url"] = url
            print(f"\n{color}{C.BOLD}  ✓ {label} URL: {url}{C.RESET}\n")
            continue

        # Detect ngrok URL
        match = re.search(r"url=(https?://[^\s]+)", line)
        if match:
            url = match.group(1)
            url_holder["url"] = url
            print(f"\n{color}{C.BOLD}  ✓ {label} URL: {url}{C.RESET}\n")
            continue

        # Print other output dimmed
        print(f"  {C.DIM}[{label}] {line}{C.RESET}")


def start_cloudflare_tunnel(port: int, label: str, color: str) -> tuple[subprocess.Popen, dict]:
    """Start a Cloudflare Tunnel for the given port."""
    url_holder: dict[str, str] = {}
    proc = subprocess.Popen(
        ["cloudflared", "tunnel", "--url", f"http://localhost:{port}"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    thread = threading.Thread(
        target=stream_output, args=(proc, label, color, url_holder), daemon=True
    )
    thread.start()
    return proc, url_holder


def start_ngrok_tunnel(port: int, label: str, color: str) -> tuple[subprocess.Popen, dict]:
    """Start an ngrok tunnel for the given port."""
    url_holder: dict[str, str] = {}
    proc = subprocess.Popen(
        ["ngrok", "http", str(port), "--log", "stdout", "--log-format", "term"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    thread = threading.Thread(
        target=stream_output, args=(proc, label, color, url_holder), daemon=True
    )
    thread.start()
    return proc, url_holder


def install_hint(provider: str) -> None:
    """Show installation instructions."""
    if provider == "cloudflare":
        print(f"{C.RED}✗ 'cloudflared' not found.{C.RESET}")
        print(f"  Install: {C.YELLOW}winget install cloudflare.cloudflared{C.RESET}")
        print(f"  Or:      {C.YELLOW}scoop install cloudflared{C.RESET}")
        print(f"  Or:      {C.YELLOW}brew install cloudflared{C.RESET}")
        print(f"  GitHub:  https://github.com/cloudflare/cloudflared")
    else:
        print(f"{C.RED}✗ 'ngrok' not found.{C.RESET}")
        print(f"  Install: {C.YELLOW}winget install ngrok.ngrok{C.RESET}")
        print(f"  Or:      {C.YELLOW}scoop install ngrok{C.RESET}")
        print(f"  Sign up: https://dashboard.ngrok.com/signup")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Expose local Ottawa GenAI services to the public internet"
    )
    parser.add_argument(
        "--provider", "-p",
        choices=["cloudflare", "ngrok"],
        default="cloudflare",
        help="Tunnel provider (default: cloudflare)",
    )
    parser.add_argument("--backend-port", type=int, default=8000, help="Backend port (default: 8000)")
    parser.add_argument("--frontend-port", type=int, default=3000, help="Frontend port (default: 3000)")
    parser.add_argument("--backend-only", action="store_true", help="Only expose backend")
    parser.add_argument("--frontend-only", action="store_true", help="Only expose frontend")
    args = parser.parse_args()

    banner(args.provider)

    # Check tool installed
    cmd = "cloudflared" if args.provider == "cloudflare" else "ngrok"
    if not check_command(cmd):
        install_hint(args.provider)
        sys.exit(1)

    start_fn = start_cloudflare_tunnel if args.provider == "cloudflare" else start_ngrok_tunnel
    processes: list[subprocess.Popen] = []

    try:
        # Start backend tunnel
        if not args.frontend_only:
            print(f"{C.GREEN}[1] Starting backend tunnel (port {args.backend_port})...{C.RESET}")
            backend_proc, backend_url = start_fn(args.backend_port, "Backend", C.GREEN)
            processes.append(backend_proc)
            time.sleep(3)

        # Start frontend tunnel
        if not args.backend_only:
            print(f"{C.MAGENTA}[2] Starting frontend tunnel (port {args.frontend_port})...{C.RESET}")
            frontend_proc, frontend_url = start_fn(args.frontend_port, "Frontend", C.MAGENTA)
            processes.append(frontend_proc)
            time.sleep(3)

        print(f"\n{C.YELLOW}Tunnels are running. Waiting for URLs...{C.RESET}")
        print(f"{C.DIM}Press Ctrl+C to stop all tunnels.{C.RESET}\n")

        if args.provider == "ngrok":
            print(f"{C.YELLOW}ngrok dashboard: http://127.0.0.1:4040{C.RESET}\n")

        # Wait for all processes
        for proc in processes:
            proc.wait()

    except KeyboardInterrupt:
        print(f"\n{C.RED}Shutting down tunnels...{C.RESET}")
    finally:
        for proc in processes:
            try:
                proc.terminate()
                proc.wait(timeout=5)
            except Exception:
                proc.kill()
        print(f"{C.RED}All tunnels stopped.{C.RESET}")


if __name__ == "__main__":
    # Enable ANSI colors on Windows
    if sys.platform == "win32":
        os.system("")  # Enables ANSI escape sequences in Windows terminal
    
    # Handle Ctrl+C gracefully
    signal.signal(signal.SIGINT, lambda *_: None)
    
    main()
