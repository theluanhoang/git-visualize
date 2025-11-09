#!/bin/bash

# Quick performance test - runs a shorter version of the full test
# Usage: ./quick-test.sh [base_url]

BASE_URL="${1:-http://localhost:8001}"

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Get the backend directory (parent of performance-tests)
BACKEND_DIR="$( cd "$SCRIPT_DIR/../.." && pwd )"

# Change to backend directory to ensure correct paths
cd "$BACKEND_DIR"

echo "⚡ Running quick performance test..."
echo "Base URL: $BASE_URL"
echo "Backend directory: $BACKEND_DIR"
echo ""

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo "❌ k6 is not installed. Please install k6 first."
    exit 1
fi

echo "Running Auth API quick test..."
BASE_URL=$BASE_URL k6 run performance-tests/k6/auth.test.js

echo ""
echo "Running Lessons API quick test..."
BASE_URL=$BASE_URL k6 run performance-tests/k6/lessons.test.js

echo ""
echo "✅ Quick test completed!"

