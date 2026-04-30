"""Top-level Flask entrypoint for deployment platforms like Vercel."""

from __future__ import annotations

import os
import sys


PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.server import app  # noqa: E402


__all__ = ["app"]
