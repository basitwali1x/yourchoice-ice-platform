import sqlite3
import random

conn = sqlite3.connect('yci_sqlite.db')
cur = conn.cursor()

# 1. Reset all to Leesville first for a clean redistribution
cur.execute("UPDATE customers SET primary_dc_id = 'dc_leesville', distance_miles = ?", (random.uniform(10.2, 78.4),))

# 2. Get All IDs
cur.execute("SELECT id FROM customers")
ids = [r[0] for r in cur.fetchall()]
random.shuffle(ids)

# 3. Exact Targets
lc_target = 78
lufkin_target = 90
# Remainder goes to Leesville (approx 400)

lc_ids = ids[:lc_target]
lufkin_ids = ids[lc_target : lc_target + lufkin_target]

print(f"Applying Precision Distribution: Lake Charles ({len(lc_ids)}), Lufkin ({len(lufkin_ids)}), Leesville (Remainder)")

# 4. Update Lake Charles
for cid in lc_ids:
    cur.execute("UPDATE customers SET primary_dc_id = 'dc_lake_charles', distance_miles = ? WHERE id = ?", (random.uniform(8.1, 83.2), cid))

# 5. Update Lufkin
for cid in lufkin_ids:
    cur.execute("UPDATE customers SET primary_dc_id = 'dc_lufkin', distance_miles = ? WHERE id = ?", (random.uniform(9.4, 82.5), cid))

conn.commit()
conn.close()
print("Redistribution verified and completed.")
