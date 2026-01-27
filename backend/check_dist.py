import sqlite3

def check_dist():
    conn = sqlite3.connect('yci_sqlite.db')
    cursor = conn.cursor()
    
    print("--- Distribution Centers ---")
    cursor.execute('SELECT id, name FROM distribution_centers')
    dcs = cursor.fetchall()
    for dc_id, name in dcs:
        cursor.execute('SELECT COUNT(*) FROM customers WHERE primary_dc_id = ?', (dc_id,))
        count = cursor.fetchone()[0]
        print(f"DC: {name} ({dc_id}) -> {count} customers")
    
    cursor.execute('SELECT COUNT(*) FROM customers WHERE primary_dc_id IS NULL')
    print(f"NULL primary_dc_id -> {cursor.fetchone()[0]} customers")
    
    print("\n--- Sample Customers for Lake Charles ---")
    cursor.execute('''
        SELECT c.business_name, l.city, l.address_line 
        FROM customers c 
        JOIN locations l ON c.id = l.customer_id 
        WHERE c.primary_dc_id = 'dc_lake_charles' 
        LIMIT 5
    ''')
    for row in cursor.fetchall():
        print(row)
        
    print("\n--- Sample Customers for Lufkin ---")
    cursor.execute('''
        SELECT c.business_name, l.city, l.address_line 
        FROM customers c 
        JOIN locations l ON c.id = l.customer_id 
        WHERE c.primary_dc_id = 'dc_lufkin' 
        LIMIT 5
    ''')
    for row in cursor.fetchall():
        print(row)
    
    print("\n--- Sample Customers for Leesville (Checking for MISPLACED ones) ---")
    cursor.execute('''
        SELECT c.business_name, l.city, l.address_line 
        FROM customers c 
        JOIN locations l ON c.id = l.customer_id 
        WHERE c.primary_dc_id = 'dc_leesville' AND (l.city LIKE '%Charles%' OR l.city LIKE '%Lufkin%')
        LIMIT 10
    ''')
    for row in cursor.fetchall():
        print(row)
        
    conn.close()

if __name__ == "__main__":
    check_dist()
