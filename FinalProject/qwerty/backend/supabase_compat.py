"""Supabase/Postgres compatibility helpers for the existing SQL codebase."""

from __future__ import annotations

import os
import re
from dataclasses import dataclass

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except Exception:  # pragma: no cover - handled at runtime when Supabase is configured
    psycopg2 = None
    RealDictCursor = None


SUPABASE_DB_URL = os.environ.get('SUPABASE_DB_URL') or os.environ.get('DATABASE_URL')
SUPABASE_DB_HOST = os.environ.get('SUPABASE_DB_HOST')
SUPABASE_DB_PORT = int(os.environ.get('SUPABASE_DB_PORT', '5432'))
SUPABASE_DB_NAME = os.environ.get('SUPABASE_DB_NAME', 'postgres')
SUPABASE_DB_USER = os.environ.get('SUPABASE_DB_USER', 'postgres')
SUPABASE_DB_PASSWORD = os.environ.get('SUPABASE_DB_PASSWORD', '')
SUPABASE_DB_SSLMODE = os.environ.get('SUPABASE_DB_SSLMODE', 'require')

SHOW_COLUMNS_RE = re.compile(
    r"^\s*SHOW\s+COLUMNS\s+FROM\s+([`\"\w\.]+)(?:\s+LIKE\s+'([^']+)')?\s*;?\s*$",
    re.IGNORECASE,
)
SHOW_TABLES_RE = re.compile(r"^\s*SHOW\s+TABLES\s*;?\s*$", re.IGNORECASE)
PRAGMA_TABLE_INFO_RE = re.compile(
    r"^\s*PRAGMA\s+table_info\(\s*['\"]?([\w\.]+)['\"]?\s*\)\s*;?\s*$",
    re.IGNORECASE,
)


def supabase_configured() -> bool:
    """Return True when a Supabase Postgres connection is configured."""
    return bool(SUPABASE_DB_URL or SUPABASE_DB_HOST)


def _clean_identifier(identifier: str) -> str:
    identifier = identifier.strip()
    if '.' in identifier:
        identifier = identifier.split('.')[-1]
    return identifier.strip('`"')


def _normalize_params(params):
    if params is None:
        return ()
    if isinstance(params, tuple):
        return params
    if isinstance(params, list):
        return tuple(params)
    return (params,)


def _rewrite_query(query: str, params=None):
    """Translate a small set of MySQL/SQLite metadata queries to Postgres."""
    if not isinstance(query, str):
        return query, _normalize_params(params)

    rewritten = query.strip().rstrip(';')
    normalized_params = _normalize_params(params)

    show_columns_match = SHOW_COLUMNS_RE.match(rewritten)
    if show_columns_match:
        table_name = _clean_identifier(show_columns_match.group(1))
        like_value = show_columns_match.group(2)
        sql = [
            'SELECT',
            '  c.column_name AS "Field",',
            '  c.data_type AS "Type",',
            '  CASE WHEN c.is_nullable = \'NO\' THEN \'NO\' ELSE \'YES\' END AS "Null",',
            '  CASE WHEN pk.column_name IS NOT NULL THEN \'PRI\' ELSE \'\' END AS "Key",',
            '  c.column_default AS "Default",',
            '  \'\' AS "Extra"',
            'FROM information_schema.columns c',
            'LEFT JOIN (',
            '  SELECT kcu.table_schema, kcu.table_name, kcu.column_name',
            '  FROM information_schema.table_constraints tc',
            '  JOIN information_schema.key_column_usage kcu',
            '    ON tc.constraint_name = kcu.constraint_name',
            '   AND tc.table_schema = kcu.table_schema',
            '   AND tc.table_name = kcu.table_name',
            "  WHERE tc.constraint_type = 'PRIMARY KEY'",
            ') pk',
            '  ON pk.table_schema = c.table_schema',
            ' AND pk.table_name = c.table_name',
            ' AND pk.column_name = c.column_name',
            'WHERE c.table_schema = current_schema()',
            '  AND c.table_name = %s',
        ]
        rewritten_params = [table_name]
        if like_value is not None:
            sql.append('  AND c.column_name ILIKE %s')
            rewritten_params.append(like_value)
        sql.append('ORDER BY c.ordinal_position')
        return '\n'.join(sql), tuple(rewritten_params)

    if SHOW_TABLES_RE.match(rewritten):
        return (
            'SELECT tablename AS "Tables_in_public" FROM pg_catalog.pg_tables WHERE schemaname = current_schema() ORDER BY tablename',
            (),
        )

    pragma_match = PRAGMA_TABLE_INFO_RE.match(rewritten)
    if pragma_match:
        table_name = _clean_identifier(pragma_match.group(1))
        return (
            '\n'.join([
                'SELECT',
                '  c.ordinal_position - 1 AS cid,',
                '  c.column_name AS name,',
                '  c.data_type AS type,',
                '  CASE WHEN c.is_nullable = \'NO\' THEN 1 ELSE 0 END AS notnull,',
                '  c.column_default AS dflt_value,',
                '  CASE WHEN pk.column_name IS NOT NULL THEN 1 ELSE 0 END AS pk',
                'FROM information_schema.columns c',
                'LEFT JOIN (',
                '  SELECT kcu.table_schema, kcu.table_name, kcu.column_name',
                '  FROM information_schema.table_constraints tc',
                '  JOIN information_schema.key_column_usage kcu',
                '    ON tc.constraint_name = kcu.constraint_name',
                '   AND tc.table_schema = kcu.table_schema',
                '   AND tc.table_name = kcu.table_name',
                "  WHERE tc.constraint_type = 'PRIMARY KEY'",
                ') pk',
                '  ON pk.table_schema = c.table_schema',
                ' AND pk.table_name = c.table_name',
                ' AND pk.column_name = c.column_name',
                'WHERE c.table_schema = current_schema()',
                '  AND c.table_name = %s',
                'ORDER BY c.ordinal_position',
            ]),
            (table_name,),
        )

    if '?' in rewritten and '%s' not in rewritten:
        rewritten = rewritten.replace('?', '%s')

    return rewritten, normalized_params


class SupabaseCursorProxy:
    """Cursor wrapper that translates the small set of MySQL/SQLite helpers still used by the app."""

    def __init__(self, cursor):
        self._cursor = cursor

    def execute(self, query, params=None):
        rewritten_query, rewritten_params = _rewrite_query(query, params)
        return self._cursor.execute(rewritten_query, rewritten_params)

    def executemany(self, query, param_list):
        rewritten_query, _ = _rewrite_query(query, ())
        return self._cursor.executemany(rewritten_query, param_list)

    def fetchone(self):
        return self._cursor.fetchone()

    def fetchall(self):
        return self._cursor.fetchall()

    def close(self):
        return self._cursor.close()

    @property
    def rowcount(self):
        return self._cursor.rowcount

    @property
    def description(self):
        return self._cursor.description

    def __iter__(self):
        return iter(self._cursor)

    def __enter__(self):
        self._cursor.__enter__()
        return self

    def __exit__(self, exc_type, exc, tb):
        return self._cursor.__exit__(exc_type, exc, tb)

    def __getattr__(self, name):
        return getattr(self._cursor, name)


@dataclass
class SupabaseConnectionProxy:
    """Lightweight connection wrapper that exposes a dict-cursor interface."""

    connection: object

    def cursor(self, *args, **kwargs):
        if psycopg2 is None:
            raise RuntimeError('psycopg2-binary is required for Supabase connections')
        if 'cursor_factory' not in kwargs:
            kwargs['cursor_factory'] = RealDictCursor
        return SupabaseCursorProxy(self.connection.cursor(*args, **kwargs))

    def commit(self):
        return self.connection.commit()

    def rollback(self):
        return self.connection.rollback()

    def close(self):
        return self.connection.close()

    def ping(self, reconnect=False):
        with self.cursor() as cursor:
            cursor.execute('SELECT 1')
            cursor.fetchone()
        return True

    @property
    def closed(self):
        return getattr(self.connection, 'closed', 0)

    def __getattr__(self, name):
        return getattr(self.connection, name)


def create_supabase_connection():
    """Create a Supabase/Postgres connection when Supabase credentials are configured."""
    if psycopg2 is None:
        raise RuntimeError('psycopg2-binary must be installed to use Supabase')

    if SUPABASE_DB_URL:
        conn = psycopg2.connect(SUPABASE_DB_URL, cursor_factory=RealDictCursor)
    else:
        conn = psycopg2.connect(
            host=SUPABASE_DB_HOST,
            port=SUPABASE_DB_PORT,
            dbname=SUPABASE_DB_NAME,
            user=SUPABASE_DB_USER,
            password=SUPABASE_DB_PASSWORD,
            sslmode=SUPABASE_DB_SSLMODE,
            cursor_factory=RealDictCursor,
        )

    conn.autocommit = False
    return SupabaseConnectionProxy(conn)
