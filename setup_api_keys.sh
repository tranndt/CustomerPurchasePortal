#!/bin/bash

# This script helps copy API keys from the credentials directory to a .env file
# Usage: ./setup_api_keys.sh [environment]
#   environment: 'dev' (default), 'prod', or 'test'

# Default to dev environment
ENV="${1:-dev}"
CREDS_DIR="./credentials"
ENV_FILE=".env"

if [ ! -d "$CREDS_DIR" ]; then
  echo "Error: Credentials directory not found. Creating one..."
  mkdir -p "$CREDS_DIR"
  echo "{
	\"name\": \"API Key Name\",
	\"description\": \"Description of what this key is used for\",
	\"createdAt\": \"$(date +%Y-%m-%dT%H:%M%z)\",
	\"apikey\": \"your-api-key-goes-here\"
}" > "$CREDS_DIR/apikey.json"
  echo "Created sample apikey.json file in $CREDS_DIR. Please update it with your actual API key."
  exit 1
fi

if [ -f "$CREDS_DIR/apikey.json" ]; then
  echo "Found API key file."
  
  # Extract API key using grep or jq if available
  if command -v jq &> /dev/null; then
    API_KEY=$(jq -r '.apikey' "$CREDS_DIR/apikey.json")
  else
    # Fallback to grep (less reliable)
    API_KEY=$(grep -o '"apikey": *"[^"]*"' "$CREDS_DIR/apikey.json" | cut -d'"' -f4)
  fi
  
  # Copy or create .env file
  if [ -f "$ENV_FILE" ]; then
    echo "Updating existing .env file..."
    # Check if WATSONX_API_KEY already exists in the file
    if grep -q "WATSONX_API_KEY=" "$ENV_FILE"; then
      # Replace existing line
      sed -i '' "s/WATSONX_API_KEY=.*/WATSONX_API_KEY=$API_KEY/" "$ENV_FILE"
    else
      # Add new line
      echo "WATSONX_API_KEY=$API_KEY" >> "$ENV_FILE"
    fi
  else
    echo "Creating new .env file from example..."
    if [ -f ".env.example" ]; then
      cp ".env.example" "$ENV_FILE"
      # Replace placeholder
      sed -i '' "s/WATSONX_API_KEY=.*/WATSONX_API_KEY=$API_KEY/" "$ENV_FILE"
    else
      echo "WATSONX_API_KEY=$API_KEY" > "$ENV_FILE"
    fi
  fi
  
  echo "API key has been added to $ENV_FILE"
  echo "Additional environment variables may need to be configured manually."
else
  echo "Error: API key file not found at $CREDS_DIR/apikey.json"
  exit 1
fi
