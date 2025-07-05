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
            # Add emergency products
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
