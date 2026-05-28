import sqlite3
from pathlib import Path
from contextlib import contextmanager

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

DB_PATH = DATA_DIR / "database.db"


@contextmanager
def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    try:
        yield conn
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        raise
    finally:
        conn.close()
