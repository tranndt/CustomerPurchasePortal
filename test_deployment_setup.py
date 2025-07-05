#!/usr/bin/env python3
"""
Test script to validate deployment setup process
Simulates the database setup flow without starting the server
"""

import os
import subprocess
import sys
import sqlite3

def test_database_setup():
    """Test the database setup process"""
    print("=== TESTING DEPLOYMENT SETUP ===")
    
    # Change to server directory
    server_dir = "/Users/jasetran/Jase/Projects/xrwvm-fullstack_developer_capstone/server"
    os.chdir(server_dir)
    
    print(f"Testing from directory: {os.getcwd()}")
    
    # Test 1: Django-based setup
    print("\n--- Test 1: Django-based setup ---")
    try:
        result = subprocess.run([sys.executable, "db_setup.py"], 
                              capture_output=True, text=True, timeout=30)
        print(f"Django setup exit code: {result.returncode}")
        if result.returncode == 0:
            print("✅ Django-based setup successful")
        else:
            print("❌ Django-based setup failed")
            print("STDOUT:", result.stdout)
            print("STDERR:", result.stderr)
    except Exception as e:
        print(f"❌ Django setup test failed: {e}")
    
    # Test 2: Simple SQLite setup  
    print("\n--- Test 2: Simple SQLite setup ---")
    try:
        result = subprocess.run([sys.executable, "simple_db_setup.py"], 
                              capture_output=True, text=True, timeout=30)
        print(f"Simple setup exit code: {result.returncode}")
        if result.returncode == 0:
            print("✅ Simple SQLite setup successful")
        else:
            print("❌ Simple SQLite setup failed")
            print("STDOUT:", result.stdout)
            print("STDERR:", result.stderr)
    except Exception as e:
        print(f"❌ Simple setup test failed: {e}")
    
    # Test 3: Database verification
    print("\n--- Test 3: Database verification ---")
    try:
        db_path = "db.sqlite3"
        if os.path.exists(db_path):
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Check tables
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row[0] for row in cursor.fetchall()]
            print(f"Database tables: {len(tables)}")
            
            # Check product table specifically
            if 'djangoapp_product' in tables:
                cursor.execute("SELECT COUNT(*) FROM djangoapp_product")
                product_count = cursor.fetchone()[0]
                print(f"✅ Product table exists with {product_count} products")
                
                # Get sample products
                cursor.execute("SELECT id, name, category, price FROM djangoapp_product LIMIT 3")
                products = cursor.fetchall()
                print("Sample products:")
                for product in products:
                    print(f"  - ID: {product[0]}, Name: {product[1]}")
            else:
                print("❌ Product table not found in database")
            
            conn.close()
        else:
            print("❌ Database file not found")
    except Exception as e:
        print(f"❌ Database verification failed: {e}")
    
    # Test 4: Emergency setup simulation
    print("\n--- Test 4: Emergency setup simulation ---")
    try:
        # Simulate the emergency setup logic
        db_path = "db.sqlite3"
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if emergency setup would be needed
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='djangoapp_product'")
        table_exists = cursor.fetchone() is not None
        
        if table_exists:
            cursor.execute("SELECT COUNT(*) FROM djangoapp_product")
            count = cursor.fetchone()[0]
            if count > 0:
                print(f"✅ Emergency setup not needed - {count} products exist")
            else:
                print("⚠️  Emergency setup would add products to empty table")
        else:
            print("⚠️  Emergency setup would create product table")
        
        conn.close()
    except Exception as e:
        print(f"❌ Emergency setup simulation failed: {e}")
    
    print("\n=== DEPLOYMENT SETUP TEST COMPLETE ===")

if __name__ == "__main__":
    test_database_setup()
