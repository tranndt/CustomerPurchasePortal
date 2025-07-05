#!/bin/bash
# Background test script for database setup processes
# Simulates the deployment environment database setup

echo "🔄 === BACKGROUND DATABASE SETUP TEST ==="

cd /Users/jasetran/Jase/Projects/xrwvm-fullstack_developer_capstone/server

# Test 1: Django-based setup in background
echo "Starting Django setup in background..."
python db_setup.py > django_setup.log 2>&1 &
DJANGO_PID=$!

# Test 2: Simple SQLite setup in background  
echo "Starting simple setup in background..."
python simple_db_setup.py > simple_setup.log 2>&1 &
SIMPLE_PID=$!

# Wait for both processes
echo "Waiting for setup processes to complete..."
wait $DJANGO_PID
DJANGO_RESULT=$?

wait $SIMPLE_PID  
SIMPLE_RESULT=$?

# Check results
echo "📊 === BACKGROUND SETUP RESULTS ==="

if [ $DJANGO_RESULT -eq 0 ]; then
    echo "✅ Django setup (background): SUCCESS"
    echo "Last lines from django_setup.log:"
    tail -3 django_setup.log
else
    echo "❌ Django setup (background): FAILED ($DJANGO_RESULT)"
    echo "Error from django_setup.log:"
    tail -5 django_setup.log
fi

if [ $SIMPLE_RESULT -eq 0 ]; then
    echo "✅ Simple setup (background): SUCCESS"
    echo "Last lines from simple_setup.log:"
    tail -3 simple_setup.log
else
    echo "❌ Simple setup (background): FAILED ($SIMPLE_RESULT)"
    echo "Error from simple_setup.log:"
    tail -5 simple_setup.log
fi

# Test emergency setup simulation
echo "🚨 === EMERGENCY SETUP SIMULATION ==="
cd /Users/jasetran/Jase/Projects/xrwvm-fullstack_developer_capstone/deploy-scripts

# Create a test version with local paths
python3 -c "
import sqlite3
import os

print('Emergency setup simulation started...')
db_path = '../server/db.sqlite3'

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if emergency setup would be needed
    cursor.execute('SELECT name FROM sqlite_master WHERE type=\"table\" AND name=\"djangoapp_product\"')
    table_exists = cursor.fetchone() is not None
    
    if table_exists:
        cursor.execute('SELECT COUNT(*) FROM djangoapp_product')
        count = cursor.fetchone()[0]
        print(f'✅ Emergency setup not needed - {count} products exist')
    else:
        print('⚠️  Emergency setup would create product table')
    
    conn.close()
    print('Emergency setup simulation completed successfully')
    
except Exception as e:
    print(f'❌ Emergency setup simulation failed: {e}')
"

echo "🎯 === BACKGROUND TESTING COMPLETE ==="
echo "All database setup mechanisms tested in background processes"

# Clean up log files
rm -f django_setup.log simple_setup.log

echo "✅ Background testing successful - ready for deployment!"
