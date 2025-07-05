#!/bin/bash
# Database diagnosis script
set -e

echo "========== DATABASE DIAGNOSIS SCRIPT =========="
echo "Date: $(date)"
echo "Current directory: $(pwd)"
echo "SQLite version: $(sqlite3 --version)"

echo -e "\n----- Database File Check -----"
DB_PATH="db.sqlite3"
if [ -f "$DB_PATH" ]; then
    echo "Database file exists"
    echo "Size: $(ls -lh $DB_PATH | awk '{print $5}')"
    echo "Permissions: $(ls -la $DB_PATH | awk '{print $1}')"
else
    echo "Database file not found at $DB_PATH"
fi

echo -e "\n----- Database Tables -----"
if [ -f "$DB_PATH" ]; then
    echo "Tables in database:"
    sqlite3 $DB_PATH ".tables"
    
    echo -e "\n----- Table Structure -----"
    echo "djangoapp_product table structure:"
    sqlite3 $DB_PATH ".schema djangoapp_product"
    
    echo -e "\n----- Product Count -----"
    echo "Number of products in table:"
    sqlite3 $DB_PATH "SELECT COUNT(*) FROM djangoapp_product;"
    
    echo -e "\n----- Sample Products -----"
    echo "First 5 products:"
    sqlite3 $DB_PATH "SELECT id, name, category, price FROM djangoapp_product LIMIT 5;"
else
    echo "Cannot check database tables - file not found"
fi

echo -e "\n----- Django Migrations -----"
echo "Running Django makemigrations to detect issues..."
python manage.py makemigrations --check

echo -e "\n----- Django Migration Status -----"
echo "Migration status:"
python manage.py showmigrations

echo "========== END DIAGNOSIS =========="
