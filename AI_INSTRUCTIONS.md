PROJECT SURVIVAL RULES
IDENTITY: This project is Your Choice Ice. References to 'Arctic Ice Solutions' are legacy and must be ignored/replaced.

DATA SAFETY: DO NOT wipe the database. Use CREATE TABLE IF NOT EXISTS.

MIGRATION: The extract_legacy_data.py script must ONLY run if the users table is empty.

AUTH: Use Bcrypt rounds: 12 for all password hashing.

HISTORY: Always check the ADMIN_DASHBOARD_ROADMAP.md for the current task state before starting.
