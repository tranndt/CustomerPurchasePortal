#!/bin/bash
set -e

# Start Flask sentiment service in background
cd /app/flask
python app.py &

# Start Express API service in background
cd /app/express
node app.js &

# Start Django application in foreground (main process)
cd /app/django
gunicorn --bind :8000 --workers 3 djangoproj.wsgi
