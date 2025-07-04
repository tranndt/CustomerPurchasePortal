#!/bin/bash
# update_mongodb_credentials.sh
# 
# This script updates MongoDB Atlas credentials in the secrets.env file and
# prepares it for deployment to Render.com.
#
# Usage: ./update_mongodb_credentials.sh <username> <password> <cluster-url> <database>
#
# Example: ./update_mongodb_credentials.sh myuser mypassword cluster0.abc123.mongodb.net mydbname

# Check for correct arguments
if [ "$#" -lt 3 ]; then
    echo "Usage: $0 <username> <password> <cluster-url> [database]"
    echo "Example: $0 myuser mypassword cluster0.abc123.mongodb.net purchasePortalDB"
    exit 1
fi

USERNAME="$1"
PASSWORD="$2"
CLUSTER_URL="$3"
DATABASE="${4:-purchasePortalDB}"  # Default database name if not provided

# Check if secrets.env exists, if not, create from example
if [ ! -f ./secrets.env ]; then
    if [ -f ./secrets.example.env ]; then
        cp ./secrets.example.env ./secrets.env
        echo "Created secrets.env from template"
    else
        echo "ERROR: secrets.example.env not found. Cannot create secrets.env"
        exit 1
    fi
fi

# Update MongoDB URI in secrets.env
# Construct the full MongoDB Atlas URI with proper parameters
MONGODB_URI="mongodb+srv://${USERNAME}:${PASSWORD}@${CLUSTER_URL}/${DATABASE}?authSource=admin&retryWrites=true&w=majority"

# Format for display (hide password)
SAFE_URI=$(echo "$MONGODB_URI" | sed "s/:${PASSWORD}@/:****@/")
echo "Setting MongoDB URI to: $SAFE_URI"

# Update the URI in secrets.env file
if grep -q "^MONGODB_URI=" ./secrets.env; then
    # URI exists, update it
    sed -i.bak "s|^MONGODB_URI=.*|MONGODB_URI=$MONGODB_URI|" ./secrets.env
else
    # URI doesn't exist, add it
    echo "MONGODB_URI=$MONGODB_URI" >> ./secrets.env
fi

echo "MongoDB credentials updated successfully in secrets.env"
echo ""
echo "IMPORTANT: Now you need to:"
echo "1. Upload the updated secrets.env file to Render.com as a Secret File"
echo "2. Make sure your MongoDB Atlas Network Access allows connections from Render.com (0.0.0.0/0)"
echo "3. Verify the MongoDB user has correct permissions in MongoDB Atlas"
echo ""
echo "To test your MongoDB connection locally, run:"
echo "export MONGODB_URI=\"$MONGODB_URI\""
echo "node server/database/mongodb-auth-test.js"
