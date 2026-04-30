#!/usr/bin/env python3
"""Database setup helpers for Supabase/Postgres."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

from backend.supabase_compat import create_supabase_connection, supabase_configured


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')


def get_db_config(db_name='qwerty'):
    """Compatibility shim that exposes the Supabase environment contract."""
    return {
        'supabase_url': os.environ.get('SUPABASE_DB_URL', ''),
        'supabase_host': os.environ.get('SUPABASE_DB_HOST', ''),
        'supabase_port': os.environ.get('SUPABASE_DB_PORT', '5432'),
        'supabase_db': os.environ.get('SUPABASE_DB_NAME', 'postgres'),
        'supabase_user': os.environ.get('SUPABASE_DB_USER', 'postgres'),
        'supabase_password': bool(os.environ.get('SUPABASE_DB_PASSWORD', '')),
    }


def get_admin_config():
    """Compatibility shim retained for callers that expect an admin config object."""
    return get_db_config()


# ============================================================================
# Schema Setup Functions
# ============================================================================

def _read_statements(schema_path):
    with open(schema_path, 'r', encoding='utf-8') as handle:
        content = handle.read()

    statements = []
    for statement in content.split(';'):
        statement = statement.strip()
        if not statement or statement.startswith('--'):
            continue
        statements.append(statement)
    return statements


def setup_schema(db_name='qwerty', schema_path='database/schema_supabase.sql'):
    """Apply the Supabase schema to the configured Postgres database.
    
    Args:
        schema_path: Path to SQL schema file
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        if not supabase_configured():
            print('❌ Supabase connection details are missing.')
            return False

        schema_path = str(BASE_DIR / schema_path) if not os.path.isabs(schema_path) else schema_path
        if not os.path.exists(schema_path):
            print(f'❌ Schema file not found: {schema_path}')
            return False

        print('Connecting to Supabase...')
        conn = create_supabase_connection()
        cursor = conn.cursor()

        statements = _read_statements(schema_path)
        print(f'Executing {len(statements)} SQL statements...')
        for i, statement in enumerate(statements, 1):
            try:
                cursor.execute(statement)
                print(f'  [{i}/{len(statements)}] ✓')
            except Exception as e:
                print(f'  [{i}/{len(statements)}] ✗ Error: {e}')

        conn.commit()
        print('\n✅ Schema setup completed successfully!')

        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"\n❌ Error setting up schema: {e}")
        return False


def create_fresh_database(db_name='qwerty_fresh', schema_path='database/schema_supabase.sql'):
    """Supabase uses a managed Postgres database, so this applies the schema in place.
    
    Args:
        schema_path: Path to SQL schema file
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        print('🔧 Applying Supabase schema...')
        return setup_schema(db_name=db_name, schema_path=schema_path)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


# ============================================================================
# CLI Entry Points
# ============================================================================

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Supabase database setup utilities')
    parser.add_argument('command', 
                        choices=['setup-schema', 'setup-fresh'],
                        help='Command to execute')
    parser.add_argument('--db-name', default=None, help='Database name')
    parser.add_argument('--schema', default='database/schema_supabase.sql', help='Path to schema file')
    
    args = parser.parse_args()
    
    if args.command == 'setup-schema':
        db_name = args.db_name or 'qwerty'
        success = setup_schema(db_name, args.schema)
        if success:
            print("\nYou can now run: python run.py")
    
    elif args.command == 'setup-fresh':
        db_name = args.db_name or 'qwerty_fresh'
        success = create_fresh_database(db_name, args.schema)
        if not success:
            print("\n⚠️  Setup failed. Please check the error messages above.")
