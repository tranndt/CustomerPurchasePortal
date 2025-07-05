#!/usr/bin/env python3
"""
Simple database creation test script
This script creates the product table and adds test data if it doesn't exist
"""

import os
import sys
import sqlite3

def create_product_table():
    """Create product table with test data"""
    db_path = 'db.sqlite3'
    
    try:
        # Connect to SQLite database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print(f"Connected to database: {db_path}")
        print(f"SQLite version: {sqlite3.sqlite_version}")
        
        # Check if table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='djangoapp_product';")
        table_exists = cursor.fetchone() is not None
        
        if table_exists:
            print("Product table already exists")
            cursor.execute("SELECT COUNT(*) FROM djangoapp_product")
            count = cursor.fetchone()[0]
            print(f"Current product count: {count}")
        else:
            print("Creating Product table...")
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
            print("Table created successfully")
        
        # Check if we need to add test data
        cursor.execute("SELECT COUNT(*) FROM djangoapp_product")
        count = cursor.fetchone()[0]
        
        if count == 0:
            print("Adding test products...")
            test_products = [
                ('Test Laptop', 'Electronics', 999.99, 'High-performance laptop for testing', 15, 'https://via.placeholder.com/300', 1),
                ('Test Phone', 'Electronics', 699.99, 'Latest smartphone for testing', 25, 'https://via.placeholder.com/300', 1),
                ('Test Headphones', 'Audio', 199.99, 'Premium headphones for testing', 50, 'https://via.placeholder.com/300', 1),
                ('Test Monitor', 'Electronics', 299.99, '4K monitor for testing', 20, 'https://via.placeholder.com/300', 1),
                ('Test Keyboard', 'Accessories', 89.99, 'Mechanical keyboard for testing', 30, 'https://via.placeholder.com/300', 1)
            ]
            
            cursor.executemany("""
            INSERT INTO djangoapp_product 
            (name, category, price, description, stock_quantity, image_url, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """, test_products)
            
            print(f"Added {len(test_products)} test products")
        
        # Final verification
        cursor.execute("SELECT COUNT(*) FROM djangoapp_product")
        final_count = cursor.fetchone()[0]
        print(f"Final product count: {final_count}")
        
        # Show some sample products
        cursor.execute("SELECT id, name, category, price FROM djangoapp_product LIMIT 3")
        products = cursor.fetchall()
        print("Sample products:")
        for product in products:
            print(f"  ID: {product[0]}, Name: {product[1]}, Category: {product[2]}, Price: ${product[3]}")
        
        conn.commit()
        conn.close()
        
        print("Database setup completed successfully!")
        return True
        
    except Exception as e:
        print(f"Error setting up database: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=== SIMPLE DATABASE SETUP ===")
    success = create_product_table()
    sys.exit(0 if success else 1)
