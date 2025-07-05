FROM node:18-alpine as frontend-build

# Build React Frontend
WORKDIR /app/frontend
COPY server/frontend/package*.json ./
RUN npm ci --only=production
COPY server/frontend/ ./
RUN npm run build

# Build Express API Service
FROM node:18-bullseye-slim as express-build
WORKDIR /app/express
COPY server/database/package.json ./
RUN npm install
COPY server/database/ ./

# Final image
FROM python:3.12.0-slim-bookworm

# Install Node.js for Express service
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    jq \
    && curl -sL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set up working directory
WORKDIR /app

# Copy Express service
COPY --from=express-build /app/express /app/express

# Copy and install Flask service
COPY server/djangoapp/microservices /app/flask
WORKDIR /app/flask
RUN pip install -r requirements.txt
WORKDIR /app

# Copy and install Django application
COPY server/requirements.txt /app/
RUN pip install -r requirements.txt
COPY server/ /app/django/

# Copy frontend build
COPY --from=frontend-build /app/frontend/build /app/django/frontend/build

# Copy startup script
COPY deploy-scripts/start.sh /app/start.sh
COPY deploy-scripts/emergency_db_setup.py /app/emergency_db_setup.py
RUN chmod +x /app/start.sh

# Expose ports - main port will be dynamically assigned by Render
EXPOSE 8000 3030 5002

# Create directory for mounted secrets
RUN mkdir -p /etc/secrets

# Start all services
CMD ["/app/start.sh"]
