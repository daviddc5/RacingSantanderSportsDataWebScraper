#!/bin/bash

# =============================================================================
# FastAPI + Supabase Boilerplate - API Test Script
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:8000"
API_BASE="$BASE_URL/api/v1"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to print test results
print_test_result() {
    local test_name="$1"
    local status_code="$2"
    local expected="$3"
    
    if [ "$status_code" = "$expected" ]; then
        echo -e "${GREEN}✅ PASS${NC} - $test_name (HTTP $status_code)"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} - $test_name (Expected: $expected, Got: $status_code)"
        ((TESTS_FAILED++))
    fi
}

# Helper function to make requests and extract status code
make_request() {
    local method="$1"
    local url="$2"
    local data="$3"
    local headers="$4"
    
    if [ "$method" = "GET" ]; then
        curl -s -w "%{http_code}" -o /tmp/response.json "$url" $headers
    elif [ "$method" = "POST" ]; then
        curl -s -w "%{http_code}" -o /tmp/response.json -X POST \
            -H "Content-Type: application/json" \
            -d "$data" "$url" $headers
    elif [ "$method" = "PUT" ]; then
        curl -s -w "%{http_code}" -o /tmp/response.json -X PUT \
            -H "Content-Type: application/json" \
            -d "$data" "$url" $headers
    elif [ "$method" = "DELETE" ]; then
        curl -s -w "%{http_code}" -o /tmp/response.json -X DELETE "$url" $headers
    fi
}

# Helper function to extract value from JSON response
get_json_value() {
    local key="$1"
    if command -v jq >/dev/null 2>&1; then
        jq -r ".$key" /tmp/response.json 2>/dev/null || echo "null"
    else
        # Fallback for systems without jq
        grep -o "\"$key\":[^,}]*" /tmp/response.json | cut -d: -f2 | tr -d '"' | tr -d ' ' || echo "null"
    fi
}

echo -e "${BLUE}🚀 FastAPI + Supabase Boilerplate - API Test Suite${NC}"
echo "=================================================================="
echo "Testing API at: $BASE_URL"
echo ""

# =============================================================================
# Test 1: Root Endpoint
# =============================================================================
echo -e "${YELLOW}📍 Testing Root Endpoint${NC}"
status=$(make_request "GET" "$BASE_URL/")
print_test_result "Root endpoint" "$status" "200"

# =============================================================================
# Test 2: Health Check Endpoints
# =============================================================================
echo -e "\n${YELLOW}🏥 Testing Health Check Endpoints${NC}"

status=$(make_request "GET" "$API_BASE/health/")
print_test_result "Basic health check" "$status" "200"

status=$(make_request "GET" "$API_BASE/health/ready")
print_test_result "Readiness check" "$status" "200"

# =============================================================================
# Test 3: Items CRUD Operations
# =============================================================================
echo -e "\n${YELLOW}📦 Testing Items CRUD Operations${NC}"

# Get all items (should work even if empty)
status=$(make_request "GET" "$API_BASE/items/")
print_test_result "Get all items" "$status" "200"

# Create a new item
create_data='{
    "name": "Test Coffee Mug",
    "price": 15.99,
    "is_offer": false
}'

status=$(make_request "POST" "$API_BASE/items/" "$create_data")
print_test_result "Create new item" "$status" "201"

# Extract the created item ID (if successful)
if [ "$status" = "201" ]; then
    ITEM_ID=$(get_json_value "data.id")
    echo "   Created item with ID: $ITEM_ID"
    
    # Get specific item
    if [ "$ITEM_ID" != "null" ]; then
        status=$(make_request "GET" "$API_BASE/items/$ITEM_ID")
        print_test_result "Get specific item" "$status" "200"
        
        # Update item
        update_data='{
            "name": "Updated Test Coffee Mug",
            "price": 17.99,
            "is_offer": true
        }'
        
        status=$(make_request "PUT" "$API_BASE/items/$ITEM_ID" "$update_data")
        print_test_result "Update item" "$status" "200"
    fi
fi

# =============================================================================
# Test 4: Search and Filtering
# =============================================================================
echo -e "\n${YELLOW}🔍 Testing Search and Filtering${NC}"

# Search items
status=$(make_request "GET" "$API_BASE/items/search/?q=coffee&skip=0&limit=10")
print_test_result "General search" "$status" "200"

# Search by name
status=$(make_request "GET" "$API_BASE/items/search/name/Test")
print_test_result "Search by name" "$status" "200"

# Get items on offer
status=$(make_request "GET" "$API_BASE/items/search/offers?skip=0&limit=10")
print_test_result "Get items on offer" "$status" "200"

# Price range search
status=$(make_request "GET" "$API_BASE/items/search/price-range/?min_price=10&max_price=50&skip=0&limit=10")
print_test_result "Price range search" "$status" "200"

# =============================================================================
# Test 5: Pagination
# =============================================================================
echo -e "\n${YELLOW}📄 Testing Pagination${NC}"

status=$(make_request "GET" "$API_BASE/items/?skip=0&limit=5")
print_test_result "Pagination with skip/limit" "$status" "200"

status=$(make_request "GET" "$API_BASE/items/?skip=10&limit=5")
print_test_result "Pagination with offset" "$status" "200"

# =============================================================================
# Test 6: Error Handling
# =============================================================================
echo -e "\n${YELLOW}⚠️  Testing Error Handling${NC}"

# Test non-existent item
status=$(make_request "GET" "$API_BASE/items/99999")
print_test_result "Get non-existent item" "$status" "404"

# Test invalid item creation
invalid_data='{
    "name": "",
    "price": -5.00
}'

status=$(make_request "POST" "$API_BASE/items/" "$invalid_data")
print_test_result "Create invalid item" "$status" "422"

# Test invalid price range
status=$(make_request "GET" "$API_BASE/items/search/price-range/?min_price=100&max_price=50")
print_test_result "Invalid price range" "$status" "400"

# =============================================================================
# Test 7: Request ID Tracing
# =============================================================================
echo -e "\n${YELLOW}🔍 Testing Request ID Tracing${NC}"

status=$(curl -s -w "%{http_code}" -o /tmp/response.json -H "X-Request-ID: test-123" "$API_BASE/items/99999")
if [ "$status" = "404" ]; then
    # Check if response contains request ID
    if grep -q "test-123" /tmp/response.json 2>/dev/null; then
        echo -e "${GREEN}✅ PASS${NC} - Request ID tracing (Found request ID in error response)"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} - Request ID tracing (Request ID not found in response)"
        ((TESTS_FAILED++))
    fi
else
    echo -e "${RED}❌ FAIL${NC} - Request ID tracing (Unexpected status code: $status)"
    ((TESTS_FAILED++))
fi

# =============================================================================
# Test 8: Delete Item (Cleanup)
# =============================================================================
echo -e "\n${YELLOW}🗑️  Testing Delete Operation${NC}"

if [ "$ITEM_ID" != "null" ] && [ -n "$ITEM_ID" ]; then
    status=$(make_request "DELETE" "$API_BASE/items/$ITEM_ID")
    print_test_result "Delete item" "$status" "200"
    
    # Verify item is deleted
    status=$(make_request "GET" "$API_BASE/items/$ITEM_ID")
    print_test_result "Verify item deleted" "$status" "404"
else
    echo -e "${YELLOW}⚠️  SKIP${NC} - Delete test (No item ID available)"
fi

# =============================================================================
# Test 9: API Documentation
# =============================================================================
echo -e "\n${YELLOW}📚 Testing API Documentation${NC}"

status=$(make_request "GET" "$BASE_URL/docs")
print_test_result "Swagger UI documentation" "$status" "200"

status=$(make_request "GET" "$BASE_URL/redoc")
print_test_result "ReDoc documentation" "$status" "200"

status=$(make_request "GET" "$BASE_URL/openapi.json")
print_test_result "OpenAPI schema" "$status" "200"

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "=================================================================="
echo -e "${BLUE}📊 Test Results Summary${NC}"
echo "=================================================================="
echo -e "${GREEN}✅ Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Failed: $TESTS_FAILED${NC}"
echo "Total: $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Your API is working perfectly!${NC}"
    exit 0
else
    echo -e "${RED}💥 Some tests failed. Please check the API implementation.${NC}"
    exit 1
fi

# Cleanup
rm -f /tmp/response.json 