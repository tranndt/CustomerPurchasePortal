#!/bin/bash
# Note: Not using 'set -e' to allow the script to continue even if some commands fail
# We'll handle errors explicitly where needed

# Load secrets from mounted files if they exist
if [ -f /etc/secrets/secrets.env ]; then
  echo "Loading environment variables from secret file..."
  export $(grep -v '^#' /etc/secrets/secrets.env | xargs)
fi

if [ -f /etc/secrets/watsonx.json ]; then
  echo "Loading WatsonX credentials from secret file..."
  export WATSONX_API_KEY=$(jq -r '.apikey' /etc/secrets/watsonx.json)
  export WATSONX_PROJECT_ID=$(jq -r '.project_id' /etc/secrets/watsonx.json)
  export SERVER_URL=$(jq -r '.url' /etc/secrets/watsonx.json)
fi

# Print environment information (without sensitive data)
echo "Starting services with the following configuration:"
echo "DEBUG: $DEBUG"
echo "ALLOWED_HOSTS: $ALLOWED_HOSTS"
echo "EXPRESS_API_URL: $EXPRESS_API_URL"
echo "SENTIMENT_ANALYZER_URL: $SENTIMENT_ANALYZER_URL"
echo "MongoDB: [configured]"
echo "WatsonX: [configured]"

# Start Flask sentiment service in background
cd /app/flask
python app.py &
FLASK_PID=$!
echo "Flask sentiment service started with PID: $FLASK_PID"

# Test MongoDB connection during startup
echo "Testing MongoDB connection..."
cd /app/express
if [ -f mongodb-auth-test.js ]; then
  echo "Running MongoDB authentication diagnostics..."
  node mongodb-auth-test.js
elif [ -f test-mongodb-connection.js ]; then
  echo "Running basic MongoDB connection test..."
  node test-mongodb-connection.js
else
  echo "MongoDB connection test scripts not found, skipping tests"
fi

# Start Express API service in background
cd /app/express
node app.js &
EXPRESS_PID=$!
echo "Express API service started with PID: $EXPRESS_PID"

# Start Django application in foreground (main process)
cd /app/django
echo "Starting Django application on port 8000 (main port Render will use)..."

# Run Django migrations and collect static files
echo "================ DATABASE SETUP START ================"
# First run a basic database diagnosis
echo "Running preliminary database diagnosis..."
if [ -f ./diagnose_db.sh ]; then
    bash ./diagnose_db.sh > /app/django/db_initial_diagnosis.log 2>&1 || echo "Diagnosis script failed, continuing"
    echo "Initial diagnosis saved to /app/django/db_initial_diagnosis.log"
else
    echo "Diagnosis script not found, continuing with setup"
fi

# Always attempt to run migrations, even if they fail
echo "Running Django migrations directly first..."
python manage.py makemigrations djangoapp --noinput || echo "makemigrations djangoapp failed, continuing"
python manage.py migrate djangoapp --noinput || echo "migrate djangoapp failed, continuing"
python manage.py makemigrations --noinput || echo "makemigrations failed, continuing"
python manage.py migrate --noinput || echo "migrate failed, continuing"

echo "Running comprehensive database setup script..."
# Run our special database setup script that handles migrations and data population
python db_setup.py || echo "Database setup script failed, will try fallback"

# Also run simple database setup as backup
echo "Running simple database setup as backup..."
python simple_db_setup.py || echo "Simple database setup failed, will try manual creation"

# Always run fallback database creation to ensure we have a working table
echo "Running fallback database creation to ensure Product table exists..."
python -c "
import os
import sys
import sqlite3
import traceback

try:
    import django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangoproj.settings')
    django.setup()
    from django.db import connection
    
    print('SQLite version:', sqlite3.sqlite_version)
    
    # Check if Product table exists
    with connection.cursor() as cursor:
        cursor.execute(\"\"\"
        SELECT name FROM sqlite_master WHERE type='table' AND name='djangoapp_product';
        \"\"\")
        if cursor.fetchone():
            print('Product table exists')
            cursor.execute('SELECT COUNT(*) FROM djangoapp_product')
            count = cursor.fetchone()[0]
            print(f'Products count: {count}')
            
            if count == 0:
                print('Table exists but empty, adding test products')
                cursor.execute(\"\"\"
                INSERT INTO djangoapp_product 
                (name, category, price, description, stock_quantity, is_active, created_at)
                VALUES 
                ('Emergency Test Product', 'Test', 9.99, 'Created during recovery', 100, 1, CURRENT_TIMESTAMP),
                ('Sample Electronics', 'Electronics', 199.99, 'Sample electronic device', 25, 1, CURRENT_TIMESTAMP),
                ('Demo Product', 'Demo', 49.99, 'Demo product for testing', 50, 1, CURRENT_TIMESTAMP)
                \"\"\")
                print('Added test products')
        else:
            print('Creating Product table directly')
            cursor.execute(\"\"\"
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
            \"\"\")
            
            cursor.execute(\"\"\"
            INSERT INTO djangoapp_product 
            (name, category, price, description, stock_quantity, is_active, created_at)
            VALUES 
            ('First Test Product', 'Test', 9.99, 'Created during setup', 100, 1, CURRENT_TIMESTAMP),
            ('Second Test Product', 'Electronics', 29.99, 'Another test product', 50, 1, CURRENT_TIMESTAMP),
            ('Sample Laptop', 'Electronics', 899.99, 'High-performance laptop', 10, 1, CURRENT_TIMESTAMP),
            ('Demo Phone', 'Electronics', 599.99, 'Latest smartphone', 20, 1, CURRENT_TIMESTAMP),
            ('Test Accessory', 'Accessories', 19.99, 'Useful accessory', 75, 1, CURRENT_TIMESTAMP)
            \"\"\")
            print('Created table and added test products')
        
        # Verify the table was created successfully
        cursor.execute('SELECT COUNT(*) FROM djangoapp_product')
        final_count = cursor.fetchone()[0]
        print(f'Final product count: {final_count}')
        
except Exception as e:
    print('Error during database setup:', e)
    print(traceback.format_exc())
    # Don't exit here - let the application start anyway
" || echo "Emergency database creation failed, but continuing anyway"

# Capture diagnostic information
echo "Collecting final diagnostic information..."
python manage.py check > /app/django/db_diagnosis.log 2>&1 || echo "Django check failed"
python manage.py showmigrations >> /app/django/db_diagnosis.log 2>&1 || echo "showmigrations failed"

echo "Attempting to check database structure..."
sqlite3 db.sqlite3 ".tables" >> /app/django/db_diagnosis.log 2>&1 || echo "sqlite3 tables check failed"
sqlite3 db.sqlite3 "SELECT * FROM sqlite_master WHERE type='table';" >> /app/django/db_diagnosis.log 2>&1 || echo "sqlite3 schema check failed"
echo "Diagnostics saved to /app/django/db_diagnosis.log"

echo "================ DATABASE SETUP COMPLETE ================"

# Collect static files for production
echo "================ COLLECTING STATIC FILES START ================"
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear
echo "Static files collection completed"
echo "================ COLLECTING STATIC FILES COMPLETE ================"

# Add a sleep to ensure other services are ready
sleep 5

# Render automatically assigns PORT environment variable - use it, fallback to 8000
PORT="${PORT:-8000}"
echo "================ STARTING GUNICORN ================"
echo "Binding to port $PORT"
echo "Current directory: $(pwd)"
echo "Database file status:"
ls -la db.sqlite3 || echo "db.sqlite3 not found"
echo "Quick database check:"
sqlite3 db.sqlite3 "SELECT COUNT(*) FROM djangoapp_product;" || echo "Failed to query product count"
echo "================ GUNICORN STARTING ================"

# Start Django with gunicorn
exec gunicorn --bind 0.0.0.0:$PORT --workers 3 djangoproj.wsgi