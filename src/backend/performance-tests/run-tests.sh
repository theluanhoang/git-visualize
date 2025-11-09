#!/bin/bash

# Performance Tests Runner
# Usage: ./run-tests.sh [module] [base_url] [test_type]
#
# Test types: comprehensive (default), stress, spike
#
# Examples:
#   ./run-tests.sh                                    # Run all comprehensive tests
#   ./run-tests.sh auth                                # Run auth comprehensive tests
#   ./run-tests.sh auth http://localhost:8001         # Run auth with custom URL
#   ./run-tests.sh auth http://localhost:8001 stress  # Run auth stress test
#   ./run-tests.sh all http://localhost:8001 spike    # Run all spike tests

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# Change to backend directory
cd "$BACKEND_DIR"

# Parse arguments
MODULE="${1:-all}"
BASE_URL="${2:-http://localhost:8000}"
TEST_TYPE="${3:-comprehensive}"

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo -e "${RED}❌ k6 is not installed. Please install k6 first.${NC}"
    echo "See: https://k6.io/docs/getting-started/installation/"
    exit 1
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Performance Tests Runner${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Module: ${YELLOW}$MODULE${NC}"
echo -e "Base URL: ${YELLOW}$BASE_URL${NC}"
echo -e "Test Type: ${YELLOW}$TEST_TYPE${NC}"
echo ""

# Validate test type
if [[ ! "$TEST_TYPE" =~ ^(comprehensive|stress|spike)$ ]]; then
    echo -e "${RED}❌ Invalid test type: $TEST_TYPE${NC}"
    echo ""
    echo "Available test types:"
    echo "  - comprehensive (default)"
    echo "  - stress"
    echo "  - spike"
    exit 1
fi

# Function to run test
run_test() {
    local module=$1
    local test_file="performance-tests/k6/${module}.full.test.js"
    
    if [ ! -f "$test_file" ]; then
        echo -e "${RED}❌ Test file not found: $test_file${NC}"
        return 1
    fi
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Running ${module^^} API Tests (${TEST_TYPE^^})...${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    BASE_URL=$BASE_URL TEST_TYPE=$TEST_TYPE k6 run "$test_file"
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ ${module^^} tests passed${NC}"
    else
        echo -e "${RED}❌ ${module^^} tests failed${NC}"
    fi
    
    echo ""
    return $exit_code
}

# Run tests based on module
case "$MODULE" in
    auth)
        run_test "auth"
        exit $?
        ;;
    lessons)
        run_test "lessons"
        exit $?
        ;;
    practice)
        run_test "practice"
        exit $?
        ;;
    git-engine)
        run_test "git-engine"
        exit $?
        ;;
    all)
        # Run all tests
        failed_modules=()
        
        run_test "auth" || failed_modules+=("auth")
        run_test "lessons" || failed_modules+=("lessons")
        run_test "practice" || failed_modules+=("practice")
        run_test "git-engine" || failed_modules+=("git-engine")
        
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}Summary${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        
        if [ ${#failed_modules[@]} -eq 0 ]; then
            echo -e "${GREEN}✅ All tests passed!${NC}"
            exit 0
        else
            echo -e "${RED}❌ Failed modules: ${failed_modules[*]}${NC}"
            exit 1
        fi
        ;;
    *)
        echo -e "${RED}❌ Invalid module: $MODULE${NC}"
        echo ""
        echo "Available modules:"
        echo "  - auth"
        echo "  - lessons"
        echo "  - practice"
        echo "  - git-engine"
        echo "  - all (default)"
        echo ""
        echo "Available test types:"
        echo "  - comprehensive (default)"
        echo "  - stress"
        echo "  - spike"
        echo ""
        echo "Usage: $0 [module] [base_url] [test_type]"
        exit 1
        ;;
esac

