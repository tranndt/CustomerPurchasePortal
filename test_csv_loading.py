#!/usr/bin/env python3
"""
Test CSV access and parsing for production deployment
"""

import csv
import os

def test_csv_loading():
    # Test both local and production paths
    local_csv_path = '/Users/jasetran/Jase/Projects/xrwvm-fullstack_developer_capstone/server/database/data/Products.csv'
    production_csv_path = '/app/django/database/data/Products.csv'
    
    print("=== CSV LOADING TEST ===")
    
    # Test local path
    if os.path.exists(local_csv_path):
        print(f"✅ Local CSV found: {local_csv_path}")
        try:
            with open(local_csv_path, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                count = 0
                sample_products = []
                
                for row in reader:
                    count += 1
                    if count <= 3:  # Get first 3 products as samples
                        product_name = row.get('Product name', '').strip()
                        category = row.get('Category', row.get('\ufeffCategory', '')).strip()
                        price = row.get('Price', '0').replace('CA$', '').replace('$', '').replace(',', '').strip()
                        sample_products.append((product_name, category, price))
                
                print(f"✅ Local CSV contains {count} products")
                print("Sample products:")
                for name, cat, price in sample_products:
                    print(f"  - {name} | {cat} | ${price}")
                    
        except Exception as e:
            print(f"❌ Error reading local CSV: {e}")
    else:
        print("❌ Local CSV not found")
    
    print(f"\n📁 Production CSV path will be: {production_csv_path}")
    print("📋 In production, the startup script will:")
    print("   1. Check if djangoapp_product table exists")
    print("   2. If empty, try to load from CSV")
    print("   3. Parse product data with proper price cleaning")
    print("   4. Insert real products with descriptions")
    print("   5. Fallback to test products only if CSV fails")
    
    return True

if __name__ == "__main__":
    test_csv_loading()
