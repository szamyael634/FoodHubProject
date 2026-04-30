"""Repository-root Flask entrypoint for deployment platforms like Vercel."""

from __future__ import annotations

import os
import sys


PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.join(PROJECT_ROOT, 'FinalProject', 'qwerty')

if APP_DIR not in sys.path:
    sys.path.insert(0, APP_DIR)

from backend.server import app  # noqa: E402


__all__ = ["app"]
