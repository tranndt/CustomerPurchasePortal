#!/usr/bin/env python3
"""
Test the updated startup script database logic
"""

import os
import sys
import sqlite3
import traceback
import csv
import random

# Change to server directory 
os.chdir('/Users/jasetran/Jase/Projects/xrwvm-fullstack_developer_capstone/server')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangoproj.settings')

try:
    import django
    django.setup()
    from django.db import connection
    
    print('=== TESTING UPDATED STARTUP SCRIPT LOGIC ===')
    print('SQLite version:', sqlite3.sqlite_version)
    
    # Check if Product table exists
    with connection.cursor() as cursor:
        cursor.execute("""
        SELECT name FROM sqlite_master WHERE type='table' AND name='djangoapp_product';
        """)
        
        if not cursor.fetchone():
            print('Product table does not exist, creating and loading real products')
            cursor.execute("""
            CREATE TABLE djangoapp_product (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100) NOT NULL,
                category VARCHAR(100) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                description TEXT NOT NULL,
                stock_quantity INTEGER NOT NULL,
                image_url VARCHAR(200) NULL,
                is_active BOOLEAN NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """)
            
            # Try to load real products from CSV
            csv_path = 'database/data/Products.csv'
            products_added = 0
            
            if os.path.exists(csv_path):
                print(f'Loading products from {csv_path}')
                with open(csv_path, 'r', encoding='utf-8') as file:
                    reader = csv.DictReader(file)
                    
                    for row in reader:
                        # Clean and parse price
                        price_str = row.get('Price', '0').replace('CA$', '').replace('$', '').replace(',', '').strip()
                        try:
                            price = float(price_str)
                        except ValueError:
                            price = 0.0
                        
                        # Handle BOM in the first column
                        category = row.get('Category', row.get('\ufeffCategory', '')).strip()
                        product_name = row.get('Product name', '').strip()
                        brand = row.get('Brand', '').strip()
                        subcategory = row.get('Subcategory', '').strip()
                        
                        # Create description
                        description = f'High-quality {brand} {subcategory.lower()} in the {category.lower()} category.'
                        
                        # Generate realistic stock
                        stock_quantity = random.randint(10, 100)
                        
                        try:
                            cursor.execute("""
                            INSERT INTO djangoapp_product 
                            (name, category, price, description, stock_quantity, image_url, is_active, created_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                            """, (
                                product_name,
                                category,
                                price,
                                description,
                                stock_quantity,
                                row.get('Image Url', '').strip(),
                                1
                            ))
                            products_added += 1
                        except Exception as e:
                            continue
                
                print(f'Added {products_added} real products from CSV')
            
            # Verify the table was created successfully
            cursor.execute('SELECT COUNT(*) FROM djangoapp_product')
            final_count = cursor.fetchone()[0]
            print(f'Final product count: {final_count}')
            
            # Show sample products
            cursor.execute('SELECT id, name, category, price FROM djangoapp_product LIMIT 3')
            products = cursor.fetchall()
            print('Sample products:')
            for product in products:
                print(f'  - {product[1]} (${product[3]})')
        else:
            print('Product table already exists')
        
except Exception as e:
    print('Error during database setup:', e)
    print(traceback.format_exc())
