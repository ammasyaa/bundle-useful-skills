#!/usr/bin/env python3
"""
Route task queries to minimum sufficient skill stacks.
Usage:
    python scripts/route.py "Build a Next.js e-commerce application"
    python scripts/route.py "Audit iOS app for memory leaks" --json
"""

import sys
from pathlib import Path

# Ensure root directory is on sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from router.cli import main

if __name__ == "__main__":
    sys.exit(main())
