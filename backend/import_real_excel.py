import pandas as pd
import json
import uuid

# Load the real Excel file we found
excel_path = "c:/Users/Basit/.gemini/antigravity/playground/golden-curiosity/backend/arctic_data_source/lake_charles_customers.xlsx"

try:
    df = pd.read_excel(excel_path)
    print(f"Loaded {len(df)} rows from Excel.")
    
    customers = []
    # Map Excel columns to our schema
    # Assuming columns based on legacy import script: 'Customer', 'Address', etc.
    # We'll inspect and map dynamically if needed, but for now we try standard keys
    
    for _, row in df.iterrows():
        cust = {
            "id": str(uuid.uuid4()),
            "business_name": row.get("name", row.get("Customer", "Unknown")),
            "billing_address": row.get("address", row.get("Address", "")),
            "billing_email": row.get("email", ""),
            "billing_phone": row.get("phone", ""),
            "notes": "Imported from Lake Charles Excel"
        }
        customers.append(cust)

    # Save as SQL for migration
    with open("c:/Users/Basit/.gemini/antigravity/playground/golden-curiosity/backend/data-migration/real_customers.sql", "w") as f:
        f.write("-- Real Data from lake_charles_customers.xlsx\n")
        f.write("INSERT INTO customers (id, business_name, billing_address, billing_email, billing_phone, notes) VALUES\n")
        
        values = []
        for c in customers:
            val = f"('{c['id']}', '{c['business_name'].replace("'", "''")}', '{c['billing_address'].replace("'", "''")}', '{c['billing_email']}', '{c['billing_phone']}', '{c['notes']}')"
            values.append(val)
            
        f.write(",\n".join(values))
        f.write("\nON CONFLICT DO NOTHING;")
        
    print(f"Generated SQL for {len(customers)} real customers.")

except Exception as e:
    print(f"Error processing Excel: {e}")
