#!/bin/python
"""
Database setup and verification script.
This script will check the database structure and create required tables if they don't exist.
It will also populate initial data if needed.
"""

import os
import sys
import json
from django.core.management import call_command
from django.db import connection
from django.db.utils import OperationalError
from djangoapp.models import Product

def setup_database():
    """Set up database tables and populate with initial data if needed."""
    print("Setting up database...")
    
    # Step 1: Show all existing migrations
    print("Existing migrations:")
    call_command('showmigrations')
    
    # Step 2: Run migrations
    print("\nRunning migrations...")
    call_command('migrate', interactive=False)
    
    # Step 3: Check tables
    try:
        with connection.cursor() as cursor:
            tables = connection.introspection.table_names()
            print(f"Tables in database: {json.dumps(tables)}")
            
            if 'djangoapp_product' not in tables:
                print("ERROR: Product table not created even after migrations!")
                return False
            
            # Check if product table is empty
            cursor.execute("SELECT COUNT(*) FROM djangoapp_product")
            count = cursor.fetchone()[0]
            print(f"Products in database: {count}")
            
            if count == 0:
                print("Product table is empty, need to populate data")
                from djangoapp.populate import populate_products
                print("Running product data population...")
                populate_products()
                
                # Verify population worked
                cursor.execute("SELECT COUNT(*) FROM djangoapp_product")
                new_count = cursor.fetchone()[0]
                print(f"Products after population: {new_count}")
                if new_count == 0:
                    print("ERROR: Failed to populate product data!")
                    return False
            
        print("Database setup completed successfully.")
        return True
        
    except OperationalError as e:
        print(f"Database error: {e}")
        return False
    except Exception as e:
        import traceback
        print(f"Error setting up database: {e}")
        print(traceback.format_exc())
        return False

if __name__ == "__main__":
    print("=== DATABASE SETUP SCRIPT ===")
    success = setup_database()
    sys.exit(0 if success else 1)
