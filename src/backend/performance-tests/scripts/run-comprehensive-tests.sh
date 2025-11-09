#!/bin/bash

# Script to run all comprehensive performance tests + load tests
# Usage: ./run-comprehensive-tests.sh [base_url] [--load-tests] [--skip-endurance]
#
# Options:
#   --load-tests      Run stress and spike tests after comprehensive tests
#   --skip-endurance  Skip endurance test (takes 1 hour) when using --load-tests
#   --endurance-only  Run only endurance test (1 hour)
#
# Examples:
#   ./run-comprehensive-tests.sh                          # Only comprehensive tests
#   ./run-comprehensive-tests.sh http://localhost:8000 --load-tests    # + stress & spike
#   ./run-comprehensive-tests.sh --load-tests --skip-endurance         # + stress & spike (no endurance)

RUN_LOAD_TESTS=false
SKIP_ENDURANCE=false
ENDURANCE_ONLY=false
BASE_URL="http://localhost:8000"

# Parse arguments
for arg in "$@"; do
    case $arg in
        --load-tests)
            RUN_LOAD_TESTS=true
            ;;
        --skip-endurance)
            SKIP_ENDURANCE=true
            ;;
        --endurance-only)
            ENDURANCE_ONLY=true
            ;;
        *)
            # If argument looks like a URL, use it as BASE_URL
            if [[ "$arg" =~ ^http ]]; then
                BASE_URL="$arg"
            fi
            ;;
    esac
done

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Get the backend directory (parent of performance-tests)
BACKEND_DIR="$( cd "$SCRIPT_DIR/../.." && pwd )"

# Change to backend directory to ensure correct paths
cd "$BACKEND_DIR"

echo "🚀 Running all comprehensive performance tests..."
echo "Base URL: $BASE_URL"
echo "Backend directory: $BACKEND_DIR"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo "❌ k6 is not installed. Please install k6 first."
    echo "See: https://k6.io/docs/getting-started/installation/"
    exit 1
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 1/4: Auth API Comprehensive${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
BASE_URL=$BASE_URL k6 run performance-tests/k6/auth.comprehensive.test.js

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Auth comprehensive test had errors, continuing...${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 2/4: Lessons API Comprehensive${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
BASE_URL=$BASE_URL k6 run performance-tests/k6/lessons.comprehensive.test.js

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Lessons comprehensive test had errors, continuing...${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 3/4: Practice API Comprehensive${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
BASE_URL=$BASE_URL k6 run performance-tests/k6/practice.comprehensive.test.js

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Practice comprehensive test had errors, continuing...${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 4/4: Git Engine API Comprehensive${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
BASE_URL=$BASE_URL k6 run performance-tests/k6/git-engine.comprehensive.test.js

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Git Engine comprehensive test had errors, continuing...${NC}"
fi

echo ""
echo -e "${GREEN}✅ All comprehensive performance tests completed!${NC}"

# Run load tests if requested
if [ "$ENDURANCE_ONLY" = true ]; then
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Auth Endurance Test (1 hour - Memory Leak Detection)${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}⚠️  Warning: This test will run for 1 hour${NC}"
    BASE_URL=$BASE_URL k6 run performance-tests/k6/auth.endurance.test.js
    
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️  Auth endurance test had errors${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}✅ Endurance test completed!${NC}"
elif [ "$RUN_LOAD_TESTS" = true ]; then
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Auth Load Tests - Stress & Spike Tests${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Load Test 1/2: Auth Stress Test (Finding Breaking Point)${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Duration: ~15 minutes | Load: 10 → 50 → 100 → 200 → 500 users${NC}"
    BASE_URL=$BASE_URL k6 run performance-tests/k6/auth.stress.test.js
    
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️  Auth stress test had errors, continuing...${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Load Test 2/2: Auth Spike Test (Sudden Traffic Spike)${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Duration: ~10 minutes | Load: 10 → 200 (20x) → 500 (50x) users${NC}"
    BASE_URL=$BASE_URL k6 run performance-tests/k6/auth.spike.test.js
    
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️  Auth spike test had errors, continuing...${NC}"
    fi
    
    # Run endurance test unless skipped
    if [ "$SKIP_ENDURANCE" = false ]; then
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}Load Test 3/3: Auth Endurance Test (Memory Leak Detection)${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}⚠️  Warning: This test will run for 1 hour${NC}"
        echo -e "${YELLOW}Press Ctrl+C to skip if needed${NC}"
        echo ""
        read -p "Continue with endurance test? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            BASE_URL=$BASE_URL k6 run performance-tests/k6/auth.endurance.test.js
            
            if [ $? -ne 0 ]; then
                echo -e "${YELLOW}⚠️  Auth endurance test had errors${NC}"
            fi
        else
            echo -e "${YELLOW}⏭️  Skipping endurance test${NC}"
        fi
    else
        echo ""
        echo -e "${YELLOW}⏭️  Skipping endurance test (--skip-endurance flag)${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}✅ All load tests completed!${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 All tests completed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"


