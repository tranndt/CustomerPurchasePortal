#!/bin/bash
set -e

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
echo "Running comprehensive database setup script..."

# Run our special database setup script that handles migrations and data population
python db_setup.py

# If the script fails, create an emergency file with debug info
if [ $? -ne 0 ]; then
    echo "Database setup script failed. Running emergency diagnostics..."
    
    # Try direct SQL approach as emergency fallback
    echo "Attempting emergency table creation and population..."
    python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangoproj.settings')
django.setup()

from django.db import connection

# Try to create Product table directly with SQL if it doesn't exist
with connection.cursor() as cursor:
    cursor.execute(\"\"\"
    CREATE TABLE IF NOT EXISTS djangoapp_product (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT NOT NULL,
        stock_quantity INTEGER NOT NULL,
        image_url VARCHAR(200) NULL,
        is_active BOOLEAN NOT NULL,
        created_at DATETIME NOT NULL
    )
    \"\"\")
    
    # Check if we have any products
    cursor.execute('SELECT COUNT(*) FROM djangoapp_product')
    count = cursor.fetchone()[0]
    print(f'Products after emergency creation: {count}')
    
    # Add at least one test product if empty
    if count == 0:
        cursor.execute(\"\"\"
        INSERT INTO djangoapp_product 
        (name, category, price, description, stock_quantity, is_active, created_at)
        VALUES 
        ('Emergency Test Product', 'Test', 9.99, 'Created during emergency recovery', 100, 1, CURRENT_TIMESTAMP)
        \"\"\")
        print('Added emergency test product')
    "
    
    # Capture complete diagnostic information
    echo "Collecting emergency diagnostic information..."
    python manage.py check > /app/django/db_diagnosis.log 2>&1
    python manage.py showmigrations >> /app/django/db_diagnosis.log 2>&1
    python manage.py inspectdb >> /app/django/db_diagnosis.log 2>&1
    echo "Emergency diagnostics saved to /app/django/db_diagnosis.log"
fi

echo "================ DATABASE SETUP COMPLETE ================"

# Collect static files for production
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

# Add a sleep to ensure other services are ready
sleep 5

# Render automatically assigns PORT environment variable - use it, fallback to 8000
PORT="${PORT:-8000}"
echo "Binding to port $PORT"

# Start Django with gunicorn
exec gunicorn --bind 0.0.0.0:$PORT --workers 3 djangoproj.wsgi