#!/usr/bin/env python3
"""Test runner script for backend tests."""

import sys
import subprocess
from pathlib import Path


def main():
    """Run all backend tests using pytest."""
    try:
        # Get the backend directory (parent of tests directory)
        backend_dir = Path(__file__).parent.parent
        
        result = subprocess.run(
            ["pytest", "tests/", "-v"],
            cwd=str(backend_dir),
            capture_output=False,
            check=False
        )
        sys.exit(result.returncode)
    except Exception as e:
        print(f"Error running tests: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
