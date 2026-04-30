#!/usr/bin/env python3
"""Compatibility wrapper for the Supabase database setup script."""

from scripts.setup_supabase import main


if __name__ == '__main__':
    raise SystemExit(0 if main() else 1)
