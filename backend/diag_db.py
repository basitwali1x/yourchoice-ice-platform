import sqlite3
import os

db_path = os.getenv('DATABASE_PATH', '/app/backend/data/yci_sqlite.db')
print(f"Checking DB: {db_path}")

if not os.path.exists(db_path):
    print("Database file does not exist!")
else:
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cur.fetchall()
    print("Tables found:")
    for t in tables:
        print(f" - {t[0]}")
    conn.close()
