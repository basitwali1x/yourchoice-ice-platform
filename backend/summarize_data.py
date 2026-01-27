import pandas as pd
import os

DATA_DIR = r"C:\Users\Basit\.gemini\antigravity\scratch\yci_data_import\your choice ice app data"

def summarize_excel(filename):
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        return f"{filename} not found."
    
    try:
        # Check extensions
        if filename.endswith('.xlsx') or filename.endswith('.xlsm'):
            df = pd.read_excel(path)
        else:
            return f"Unsupported format for {filename}"

        summary = f"Summary for {filename}:\n"
        summary += f"- Rows: {len(df)}\n"
        summary += f"- Columns: {list(df.columns)}\n"
        summary += "- First 2 rows:\n"
        summary += df.head(2).to_string()
        summary += "\n" + "-"*40 + "\n"
        return summary
    except Exception as e:
        return f"Error reading {filename}: {e}"

files_to_check = [
    "Credit_Eligible_Expense_Tracking.xlsx",
    "financial_report_2025.csv", # Wait, I'll use pd.read_csv if it's csv
    "West La Ice Customer List new devin.xlsx",
    "WESTN LA CUSTPMERS.xlsx"
]

results = ""
for f in files_to_check:
    if f.endswith('.csv'):
        try:
            df = pd.read_csv(os.path.join(DATA_DIR, f))
            results += f"Summary for {f}:\n- Rows: {len(df)}\n- Columns: {list(df.columns)}\n{df.head(2).to_string()}\n" + "-"*40 + "\n"
        except: pass
    else:
        results += summarize_excel(f)

with open("data_summary.txt", "w") as out:
    out.write(results)

print("Summary generated in data_summary.txt")
