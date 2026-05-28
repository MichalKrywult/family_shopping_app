from core.database import get_connection


def init_shopping_tables():
    """Initialize tables specific to shopping module."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS shopping_lists (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                list_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                quantity INTEGER DEFAULT 1,
                is_done INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE
            );
        """)
        conn.commit()


def create_list(name: str):
    """Creates a shopping list and returns its ID."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO shopping_lists (name) VALUES (?);", (name,))
        conn.commit()
        return cursor.lastrowid


def add_item_to_list(list_id: int, name: str, quantity: int):
    """Adds an item to a specific shopping list."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO items (list_id, name, quantity) VALUES (?, ?, ?);",
            (list_id, name, quantity),
        )
        conn.commit()


def get_list_with_items(list_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT 
                l.id AS list_id, l.name AS list_name, l.created_at AS list_created,
                i.id AS item_id, i.name AS item_name, i.quantity, i.is_done
            FROM shopping_lists l
            LEFT JOIN items i ON l.id = i.list_id
            WHERE l.id = ?;
        """,
            (list_id,),
        )

        rows = cursor.fetchall()
        if not rows:
            return None

        result = {
            "id": rows[0]["list_id"],
            "name": rows[0]["list_name"],
            "created_at": rows[0]["list_created"],
            "items": [],
        }

        for row in rows:
            if row["item_id"] is not None:
                result["items"].append(
                    {
                        "id": row["item_id"],
                        "name": row["item_name"],
                        "quantity": row["quantity"],
                        "is_done": row["is_done"],
                    }
                )

        return result
