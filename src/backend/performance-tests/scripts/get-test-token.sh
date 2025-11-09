#!/bin/bash

# Script to get authentication token for performance testing
# Usage: ./get-test-token.sh [email] [password] [base_url]

EMAIL="${1:-test@example.com}"
PASSWORD="${2:-test123}"
BASE_URL="${3:-http://localhost:8001}"
API_PREFIX="/api/v1"

echo "🔐 Getting authentication token..."
echo "Email: $EMAIL"
echo "Base URL: $BASE_URL"
echo ""

RESPONSE=$(curl -s -X POST \
  "${BASE_URL}${API_PREFIX}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

if echo "$RESPONSE" | grep -q "accessToken"; then
  ACCESS_TOKEN=$(echo "$RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  REFRESH_TOKEN=$(echo "$RESPONSE" | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)
  
  echo "✅ Login successful!"
  echo ""
  echo "Access Token:"
  echo "$ACCESS_TOKEN"
  echo ""
  echo "Refresh Token:"
  echo "$REFRESH_TOKEN"
  echo ""
  echo "To use with k6:"
  echo "AUTH_TOKEN=$ACCESS_TOKEN k6 run performance-tests/k6/lessons.test.js"
else
  echo "❌ Login failed!"
  echo "Response: $RESPONSE"
  exit 1
fi


