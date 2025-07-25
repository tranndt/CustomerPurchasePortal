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

# Start Flask sentiment service in background on internal port
cd /app/flask
unset PORT  # Clear PORT to prevent conflicts
python -c "
import os
os.environ['PORT'] = '5000'
exec(open('app.py').read())
" &
FLASK_PID=$!
echo "Flask sentiment service started with PID: $FLASK_PID on port 5000"

# Start Express API service in background on internal port
cd /app/express
echo "Starting Express on fixed port 3000..."
node app.js &
EXPRESS_PID=$!
echo "Express API service started with PID: $EXPRESS_PID on port 3000"

# Start Django application in foreground (main process)
cd /app/django
echo "Starting Django application on port 8000 (main port Render will use)..."

# Debug: Check React build status
echo "================ REACT BUILD DEBUG ================"
echo "Current working directory: $(pwd)"
echo "Contents of /app/django/:"
ls -la /app/django/ || echo "Failed to list /app/django/"

echo "Checking for frontend directory..."
if [ -d "/app/django/frontend" ]; then
    echo "frontend/ directory exists"
    echo "Contents of frontend/:"
    ls -la /app/django/frontend/ || echo "Failed to list frontend/"
    
    if [ -d "/app/django/frontend/build" ]; then
        echo "frontend/build/ directory exists"
        echo "Contents of frontend/build/:"
        ls -la /app/django/frontend/build/ || echo "Failed to list frontend/build/"
        
        if [ -f "/app/django/frontend/build/index.html" ]; then
            echo "SUCCESS: React build index.html found!"
            echo "File size: $(stat -c%s /app/django/frontend/build/index.html 2>/dev/null || echo 'unknown') bytes"
        else
            echo "ERROR: React build index.html NOT FOUND!"
        fi
    else
        echo "ERROR: frontend/build/ directory NOT FOUND!"
    fi
else
    echo "ERROR: frontend/ directory NOT FOUND!"
fi

# Also check the alternate locations in case the build is elsewhere
echo "Checking alternate React build locations..."
for path in "/app/frontend/build/index.html" "/app/build/index.html"; do
    if [ -f "$path" ]; then
        echo "Found React build at alternate location: $path"
    fi
done
echo "============== END REACT BUILD DEBUG =============="

echo "================ DATABASE SETUP START ================"
# Always attempt to run migrations, even if they fail
echo "Running Django migrations directly first..."
python manage.py makemigrations djangoapp --noinput || echo "makemigrations djangoapp failed, continuing"
python manage.py migrate djangoapp --noinput || echo "migrate djangoapp failed, continuing"
python manage.py makemigrations --noinput || echo "makemigrations failed, continuing"
python manage.py migrate --noinput || echo "migrate failed, continuing"

# Run Django-based database setup to populate products and users
echo "Running Django database setup to populate data..."
python db_setup.py || echo "Django db_setup.py failed, will use fallback"

# Always run fallback database creation to ensure we have a working table
echo "Running fallback database creation to ensure Product table exists..."
python -c "
import os
import sys
import sqlite3
import traceback
import csv
import random

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
                print('Table exists but empty, loading real products from CSV')
                
                # Try to load real products from CSV
                csv_path = 'database/data/Products.csv'
                products_added = 0
                
                if os.path.exists(csv_path):
                    print(f'Loading products from {csv_path}')
                    with open(csv_path, 'r', encoding='utf-8') as file:
                        reader = csv.DictReader(file)
                        
                        for row in reader:
                            # Clean and parse price
                            price_str = row.get('Price', '0').replace('CA\$', '').replace('\$', '').replace(',', '').strip()
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
                                cursor.execute(\"\"\"
                                INSERT INTO djangoapp_product 
                                (name, category, price, description, stock_quantity, image_url, is_active, created_at)
                                VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                                \"\"\", (
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
                
                if products_added == 0:
                    print('CSV loading failed, adding fallback test products')
                    cursor.execute(\"\"\"
                    INSERT INTO djangoapp_product 
                    (name, category, price, description, stock_quantity, is_active, created_at)
                    VALUES 
                    ('Emergency Test Product', 'Test', 9.99, 'Created during recovery', 100, 1, CURRENT_TIMESTAMP),
                    ('Sample Electronics', 'Electronics', 199.99, 'Sample electronic device', 25, 1, CURRENT_TIMESTAMP),
                    ('Demo Product', 'Demo', 49.99, 'Demo product for testing', 50, 1, CURRENT_TIMESTAMP),
                    ('Test Laptop', 'Electronics', 899.99, 'High-performance laptop', 10, 1, CURRENT_TIMESTAMP),
                    ('Test Phone', 'Electronics', 599.99, 'Latest smartphone', 20, 1, CURRENT_TIMESTAMP)
                    \"\"\")
                    print('Added test products as fallback')
        else:
            print('Creating Product table directly and loading real products')
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
            
            # Try to load real products from CSV
            csv_path = 'database/data/Products.csv'
            products_added = 0
            
            if os.path.exists(csv_path):
                print(f'Loading products from {csv_path}')
                with open(csv_path, 'r', encoding='utf-8') as file:
                    reader = csv.DictReader(file)
                    
                    for row in reader:
                        # Clean and parse price
                        price_str = row.get('Price', '0').replace('CA\$', '').replace('\$', '').replace(',', '').strip()
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
                            cursor.execute(\"\"\"
                            INSERT INTO djangoapp_product 
                            (name, category, price, description, stock_quantity, image_url, is_active, created_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                            \"\"\", (
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
            
            if products_added == 0:
                cursor.execute(\"\"\"
                INSERT INTO djangoapp_product 
                (name, category, price, description, stock_quantity, is_active, created_at)
                VALUES 
                ('First Test Product', 'Test', 9.99, 'Created during setup', 100, 1, CURRENT_TIMESTAMP),
                ('Second Test Product', 'Electronics', 29.99, 'Another test product', 50, 1, CURRENT_TIMESTAMP),
                ('Sample Laptop', 'Electronics', 899.99, 'High-performance laptop', 10, 1, CURRENT_TIMESTAMP),
                ('Demo Phone', 'Electronics', 599.99, 'Latest smartphone', 20, 1, CURRENT_TIMESTAMP),
                ('Test Accessory', 'Accessories', 19.99, 'Useful accessory', 75, 1, CURRENT_TIMESTAMP),
                ('Gaming Console', 'Electronics', 499.99, 'Latest gaming console', 15, 1, CURRENT_TIMESTAMP),
                ('Wireless Earbuds', 'Audio', 129.99, 'Premium wireless earbuds', 40, 1, CURRENT_TIMESTAMP),
                ('Smart Watch', 'Electronics', 249.99, 'Feature-rich smart watch', 30, 1, CURRENT_TIMESTAMP)
                \"\"\")
                print('Created table and added test products as fallback')
        
        # Verify the table was created successfully
        cursor.execute('SELECT COUNT(*) FROM djangoapp_product')
        final_count = cursor.fetchone()[0]
        print(f'Final product count: {final_count}')
        
    # Create demo users if they don't exist
    print('Checking and creating demo users...')
    try:
        from django.contrib.auth.models import User
        from django.contrib.auth.hashers import make_password
        from djangoapp.models import UserProfile
        
        demo_users_data = [
            {
                'username': 'demo_customer',
                'first_name': 'Demo',
                'last_name': 'Customer',
                'email': 'demo.customer@portal.com',
                'password': 'password123',
                'role': 'customer'
            },
            {
                'username': 'demo_admin',
                'first_name': 'Demo',
                'last_name': 'Admin',
                'email': 'demo.admin@portal.com',
                'password': 'password123',
                'role': 'admin'
            },
            {
                'username': 'demo_support',
                'first_name': 'Demo',
                'last_name': 'Support',
                'email': 'demo.support@portal.com',
                'password': 'password123',
                'role': 'support'
            }
        ]
        
        users_created = 0
        for user_data in demo_users_data:
            if not User.objects.filter(username=user_data['username']).exists():
                user = User.objects.create(
                    username=user_data['username'],
                    first_name=user_data['first_name'],
                    last_name=user_data['last_name'],
                    email=user_data['email'],
                    password=make_password(user_data['password'])
                )
                
                # Create user profile
                UserProfile.objects.create(
                    user=user,
                    role=user_data['role']
                )
                users_created += 1
                print(f'Created demo user: {user_data[\"username\"]}')
            else:
                print(f'Demo user already exists: {user_data[\"username\"]}')
        
        print(f'Created {users_created} new demo users')
        print(f'Total demo users: {User.objects.filter(username__startswith=\"demo_\").count()}')
        
    except Exception as e:
        print(f'Error creating demo users: {e}')
        print(traceback.format_exc())
        
except Exception as e:
    print('Error during database setup:', e)
    print(traceback.format_exc())
    # Don't exit here - let the application start anyway
" || echo "Emergency database creation failed, trying standalone script..."

# Try emergency standalone script if the above fails
echo "Running emergency standalone database setup..."
python /app/emergency_db_setup.py || echo "Emergency standalone script also failed, continuing anyway"

echo "================ DATABASE SETUP COMPLETE ================"

# Collect static files for production
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

# Add a sleep to ensure other services are ready
sleep 5

# Check React build status
echo "================ REACT BUILD CHECK ================"
echo "Checking React build directory..."
if [ -d "/app/django/frontend/build" ]; then
    echo "✅ React build directory exists"
    echo "React build contents:"
    ls -la /app/django/frontend/build/ || echo "Failed to list build contents"
    if [ -f "/app/django/frontend/build/index.html" ]; then
        echo "✅ React index.html exists"
        echo "First few lines of index.html:"
        head -5 /app/django/frontend/build/index.html || echo "Failed to read index.html"
    else
        echo "❌ React index.html NOT found"
    fi
else
    echo "❌ React build directory NOT found"
    echo "Frontend directory contents:"
    ls -la /app/django/frontend/ || echo "Frontend directory not found"
fi
echo "============================================="

# Render automatically assigns PORT environment variable - use it, fallback to 8000
# Make sure we use the exact PORT that Render expects
export DJANGO_PORT="${PORT:-8000}"
echo "================ STARTING GUNICORN ================"
echo "Render PORT environment variable: $PORT"
echo "Django will bind to: $DJANGO_PORT"
echo "Current directory: $(pwd)"
echo "Database file status:"
ls -la db.sqlite3 || echo "db.sqlite3 not found"
echo "Quick database check:"
sqlite3 db.sqlite3 "SELECT COUNT(*) FROM djangoapp_product;" || echo "Failed to query product count"
echo "Sample products:"
sqlite3 db.sqlite3 "SELECT id, name, category, price FROM djangoapp_product LIMIT 3;" || echo "Failed to query sample products"
echo "================ GUNICORN STARTING ================"

gunicorn --bind 0.0.0.0:$DJANGO_PORT --workers 3 djangoproj.wsgi
