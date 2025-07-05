#!/usr/bin/env python3
"""
Minimal database setup for emergency use
Creates the djangoapp_product table with sample data if it doesn't exist
"""

import sqlite3
import os

def emergency_db_setup():
    """Create product table with minimal setup"""
    db_path = '/app/django/db.sqlite3'
    
    # Ensure the directory exists
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print(f"Emergency DB setup - SQLite version: {sqlite3.sqlite_version}")
        
        # Create table if it doesn't exist
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS djangoapp_product (
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
        
        # Check if we have products
        cursor.execute("SELECT COUNT(*) FROM djangoapp_product")
        count = cursor.fetchone()[0]
        
        if count == 0:
            # Try to load real products from CSV first
            csv_path = '/app/server/database/data/Products.csv'
            products_added = 0
            
            if os.path.exists(csv_path):
                import csv
                import random
                
                print("Loading real products from CSV...")
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
                        
                        # Create basic description
                        description = f"Quality {brand} {category.lower()} product."
                        
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
                
                print(f"Added {products_added} real products from CSV")
            
            if products_added == 0:
                # Fallback to emergency products if CSV loading failed
                print("CSV loading failed, using emergency products...")
                emergency_products = [
                    ('Emergency Laptop', 'Electronics', 999.99, 'Emergency laptop for testing', 10, 'https://via.placeholder.com/300', 1),
                    ('Emergency Phone', 'Electronics', 699.99, 'Emergency phone for testing', 15, 'https://via.placeholder.com/300', 1),
                    ('Emergency Headphones', 'Audio', 199.99, 'Emergency headphones for testing', 25, 'https://via.placeholder.com/300', 1),
                    ('Emergency Monitor', 'Electronics', 299.99, 'Emergency monitor for testing', 8, 'https://via.placeholder.com/300', 1),
                    ('Emergency Keyboard', 'Accessories', 89.99, 'Emergency keyboard for testing', 30, 'https://via.placeholder.com/300', 1)
                ]
                
                cursor.executemany("""
                INSERT INTO djangoapp_product 
                (name, category, price, description, stock_quantity, image_url, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                """, emergency_products)
                
                print(f"Added {len(emergency_products)} emergency products")
        else:
            print(f"Table already has {count} products")
        
        conn.commit()
        conn.close()
        print("Emergency database setup completed successfully!")
        return True
        
    except Exception as e:
        print(f"Emergency database setup failed: {e}")
        return False

if __name__ == "__main__":
    emergency_db_setup()
