FROM python:3.12.0-slim-bookworm

ENV PYTHONBUFFERED 1
ENV PYTHONWRITEBYTECODE 1
ENV APP=/app

# Install jq for JSON parsing and Node.js for Express service
RUN apt-get update && \
    apt-get install -y jq curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR $APP

COPY requirements.txt $APP
RUN pip3 install -r requirements.txt

COPY . $APP

# Install Node.js dependencies for Express service
RUN cd /app/database && npm install

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

# Use the production start script that handles all services
ENTRYPOINT ["/bin/bash", "/app/entrypoint.sh"]
