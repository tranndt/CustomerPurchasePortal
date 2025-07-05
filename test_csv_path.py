#!/usr/bin/env python3
import os
import csv

# Test CSV path from server directory
print("Current directory:", os.getcwd())
csv_path = 'database/data/Products.csv'
print(f"Looking for CSV at: {csv_path}")
print(f"CSV exists: {os.path.exists(csv_path)}")

if os.path.exists(csv_path):
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        rows = list(reader)
        print(f"CSV contains {len(rows)} rows")
        if rows:
            print("First product:", rows[0].get('Product name', 'Unknown'))
else:
    print("CSV file not found!")
