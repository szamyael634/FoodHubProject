#!/usr/bin/env python3
"""Supabase database setup script for the Hub E-Commerce system."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

from backend.supabase_compat import create_supabase_connection, supabase_configured


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')

SCHEMA_PATH = BASE_DIR / 'database' / 'schema_supabase.sql'


def _read_statements(schema_path: Path):
    content = schema_path.read_text(encoding='utf-8')
    statements = []
    for statement in content.split(';'):
        statement = statement.strip()
        if not statement:
            continue
        if statement.startswith('--'):
            continue
        statements.append(statement)
    return statements


def setup_supabase_schema():
    if not supabase_configured():
        print('Supabase connection details are missing.')
        print('Set SUPABASE_DB_URL or the individual SUPABASE_DB_* variables in .env.')
        return False

    if not SCHEMA_PATH.exists():
        print(f'Schema file not found: {SCHEMA_PATH}')
        return False

    conn = None
    cursor = None
    try:
        print('Connecting to Supabase...')
        conn = create_supabase_connection()
        cursor = conn.cursor()

        statements = _read_statements(SCHEMA_PATH)
        print(f'Executing {len(statements)} schema statements...')

        for index, statement in enumerate(statements, 1):
            cursor.execute(statement)
            print(f'  [{index}/{len(statements)}] OK')

        conn.commit()

        cursor.execute("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = current_schema() ORDER BY tablename")
        tables = [row['tablename'] if isinstance(row, dict) else row[0] for row in cursor.fetchall()]

        print('\nSetup complete.')
        print(f'Tables created: {len(tables)}')
        for table in tables:
            print(f'  - {table}')
        return True
    except Exception as exc:
        if conn is not None:
            conn.rollback()
        print(f'\nSetup failed: {exc}')
        return False
    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None:
            conn.close()


def main():
    print('=' * 60)
    print('  Hub E-Commerce Supabase Database Setup')
    print('=' * 60)
    return setup_supabase_schema()


if __name__ == '__main__':
    raise SystemExit(0 if main() else 1)
