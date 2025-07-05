#!/bin/python
"""
Database setup and verification script.
This script will check the database structure and create required tables if they don't exist.
It will also populate initial data if needed.
"""

import os
import sys
import json
import sqlite3
import traceback

# Configure Django environment first
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangoproj.settings')

try:
    import django
    django.setup()
    from django.core.management import call_command
    from django.db import connection
    from django.db.utils import OperationalError, DatabaseError
    from djangoapp.models import Product
except ImportError as e:
    print(f"ERROR: Failed to import Django modules: {e}")
    sys.exit(1)

def check_sqlite_version():
    """Check SQLite version for compatibility issues"""
    try:
        print(f"SQLite version: {sqlite3.sqlite_version}")
        print(f"Python SQLite module version: {sqlite3.version}")
        return True
    except Exception as e:
        print(f"Error checking SQLite version: {e}")
        return False

def create_tables_directly():
    """Create tables directly with SQL as a last resort"""
    print("Creating Product table directly with SQL...")
    try:
        with connection.cursor() as cursor:
            # Check if table exists first
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='djangoapp_product'")
            if not cursor.fetchone():
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
                print("Product table created directly with SQL")
                
                # Add test product
                cursor.execute("""
                INSERT INTO djangoapp_product 
                (name, category, price, description, stock_quantity, is_active, created_at)
                VALUES 
                ('Test Product', 'Test', 9.99, 'Created directly with SQL', 100, 1, CURRENT_TIMESTAMP)
                """)
                print("Added test product")
                return True
            else:
                print("Product table already exists")
                return True
    except Exception as e:
        print(f"Failed to create table with SQL: {e}")
        print(traceback.format_exc())
        return False

def setup_database():
    """Set up database tables and populate with initial data if needed."""
    print("\n===== DATABASE SETUP =====")
    print("Setting up database...")
    
    # Check SQLite version first
    check_sqlite_version()
    
    try:
        # Step 1: Show current database state
        print("\nChecking database information...")
        print(f"DATABASE ENGINE: {connection.vendor}")
        print(f"DATABASE NAME: {connection.settings_dict['NAME']}")
        print(f"DATABASE PATH: {connection.settings_dict.get('NAME')}")
        
        # Step 2: Show all existing migrations
        print("\nExisting migrations:")
        call_command('showmigrations')
        
        # Step 3: Run migrations
        print("\nRunning migrations...")
        call_command('migrate', interactive=False)
        
        # Step 4: Check tables
        with connection.cursor() as cursor:
            tables = connection.introspection.table_names()
            print(f"Tables in database: {json.dumps(tables)}")
            
            if 'djangoapp_product' not in tables:
                print("WARNING: Product table not created after migrations!")
                print("Attempting emergency direct table creation...")
                if not create_tables_directly():
                    print("ERROR: Failed to create Product table through any method")
                    return False
            
            # Check if product table is empty
            cursor.execute("SELECT COUNT(*) FROM djangoapp_product")
            count = cursor.fetchone()[0]
            print(f"Products in database: {count}")
            
            if count == 0:
                print("Product table is empty, need to populate data")
                try:
                    from djangoapp.populate import populate_products
                    print("Running product data population...")
                    populate_products()
                    
                    # Verify population worked
                    cursor.execute("SELECT COUNT(*) FROM djangoapp_product")
                    new_count = cursor.fetchone()[0]
                    print(f"Products after population: {new_count}")
                    if new_count == 0:
                        print("WARNING: Failed to populate via populate_products")
                        print("Adding emergency test product...")
                        cursor.execute("""
                        INSERT INTO djangoapp_product 
                        (name, category, price, description, stock_quantity, is_active, created_at)
                        VALUES 
                        ('Emergency Product', 'Test', 9.99, 'Created during emergency', 100, 1, CURRENT_TIMESTAMP)
                        """)
                        print("Added emergency product")
                except Exception as e:
                    print(f"Error during product population: {e}")
                    print(traceback.format_exc())
                    print("Adding emergency product...")
                    cursor.execute("""
                    INSERT INTO djangoapp_product 
                    (name, category, price, description, stock_quantity, is_active, created_at)
                    VALUES 
                    ('Emergency Product', 'Test', 9.99, 'Created during emergency', 100, 1, CURRENT_TIMESTAMP)
                    """)
            else:
                print(f"Product table already contains {count} products")
        
        print("\nDatabase setup completed successfully.")
        return True
        
    except DatabaseError as e:
        print(f"Database error: {e}")
        print(traceback.format_exc())
        # Try emergency table creation
        return create_tables_directly()
    except Exception as e:
        print(f"Error setting up database: {e}")
        print(traceback.format_exc())
        return False

if __name__ == "__main__":
    print("=== DATABASE SETUP SCRIPT ===")
    success = setup_database()
    sys.exit(0 if success else 1)
