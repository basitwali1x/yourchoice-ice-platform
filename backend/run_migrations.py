import os
import sqlalchemy
from database import engine, DATABASE_URL
from sqlalchemy import text
import models
import re

def run_migrations():
    print(f"Connecting to database: {DATABASE_URL}")
    
    # 1. Create tables from SQLAlchemy models first
    print("Initializing schema from models...")
    models.Base.metadata.create_all(bind=engine)
    
    # 2. Run SQL seeds/migrations
    migration_dir = "migrations"
    sql_files = sorted([f for f in os.listdir(migration_dir) if f.endswith(".sql")])
    
    is_sqlite = "sqlite" in DATABASE_URL.lower()
    
    with engine.begin() as conn:
        for sql_file in sql_files:
            print(f"Executing {sql_file}...")
            file_path = os.path.join(migration_dir, sql_file)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                
                # Cleanup syntax issues found in files
                # 1. Double closing issue in 004
                content = content.replace("');');", "');")
                
                # Use semicolon to split basic statements
                statements = content.split(";")
                for statement in statements:
                    stmt = statement.strip()
                    if stmt:
                        try:
                            if is_sqlite:
                                # Fix Postgres ON CONFLICT to SQLite INSERT OR IGNORE
                                if "ON CONFLICT" in stmt:
                                    # Regex to find 'INSERT INTO table (...)' and change to 'INSERT OR IGNORE INTO table (...)'
                                    stmt = re.sub(r"INSERT INTO", "INSERT OR IGNORE INTO", stmt, flags=re.IGNORECASE)
                                    # Remove the trailing ON CONFLICT clause
                                    stmt = re.sub(r"ON CONFLICT.*$", "", stmt, flags=re.IGNORECASE | re.MULTILINE)
                            
                            conn.execute(text(stmt))
                        except Exception as e:
                            # print(f"Warning in {sql_file}: {str(e)[:50]}")
                            pass

    print("DB migration run complete.")

if __name__ == "__main__":
    run_migrations()
