#!/bin/bash
set -e

# Print environment information (without sensitive data)
echo "Starting services with the following configuration:"
echo "DEBUG: $DEBUG"
echo "ALLOWED_HOSTS: $ALLOWED_HOSTS"
echo "EXPRESS_API_URL: $EXPRESS_API_URL"
echo "SENTIMENT_ANALYZER_URL: $SENTIMENT_ANALYZER_URL"
echo "MongoDB: [configured]"

# Start Flask sentiment service in background
cd /app/flask
python app.py &
FLASK_PID=$!
echo "Flask sentiment service started with PID: $FLASK_PID"

# Start Express API service in background
cd /app/express
node app.js &
EXPRESS_PID=$!
echo "Express API service started with PID: $EXPRESS_PID"

# Start Django application in foreground (main process)
cd /app/django
echo "Starting Django application..."
# Add a sleep to ensure other services are ready
sleep 5
gunicorn --bind :8000 --workers 3 djangoproj.wsgi
