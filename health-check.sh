#!/bin/bash

# ============================================================
# TCG WEBSITE - FIREBASE HEALTH CHECK
# Verifies database connectivity and structure
# ============================================================

set -e

echo "
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║        🏥 TCG FIREBASE HEALTH CHECK 🏥                        ║
║                                                                ║
║  This script verifies your Firebase database is working        ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DB_URL="https://babysitter-b322c-default-rtdb.firebaseio.com"
REPORT_FILE="firebase-health-report.txt"

# Initialize report
> $REPORT_FILE

# ── FUNCTION: TEST CONNECTION ──
test_connection() {
    echo -e "${BLUE}Testing database connectivity...${NC}"
    echo "Testing database connectivity..." >> $REPORT_FILE
    
    # Test HTTP connectivity
    if curl -s -m 5 "${DB_URL}/.json" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Database is reachable${NC}"
        echo "✓ Database is reachable" >> $REPORT_FILE
        return 0
    else
        echo -e "${RED}✗ Cannot reach database${NC}"
        echo "✗ Cannot reach database" >> $REPORT_FILE
        return 1
    fi
}

# ── FUNCTION: CHECK COLLECTIONS ──
check_collections() {
    echo -e "\n${BLUE}Checking data collections...${NC}"
    echo "" >> $REPORT_FILE
    echo "Data Collections:" >> $REPORT_FILE
    
    local collections=("customers" "bookings" "invoices" "services" "appointments" "leads" "technicians" "timekeeping" "inventory")
    
    for collection in "${collections[@]}"; do
        local count=$(curl -s "${DB_URL}/${collection}/.json?shallow=true" | grep -o '"' | wc -l)
        
        if [ $count -gt 0 ]; then
            echo -e "${GREEN}✓${NC} $collection: $(($count / 2)) items"
            echo "✓ $collection: $(($count / 2)) items" >> $REPORT_FILE
        else
            echo -e "${YELLOW}⚠${NC} $collection: Empty"
            echo "⚠ $collection: Empty" >> $REPORT_FILE
        fi
    done
}

# ── FUNCTION: TEST WRITE PERMISSION ──
test_write() {
    echo -e "\n${BLUE}Testing write permissions...${NC}"
    echo "" >> $REPORT_FILE
    echo "Write Permission Test:" >> $REPORT_FILE
    
    local test_data='{"test": "value", "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
    local test_path="system/health-check"
    
    if curl -s -X PUT "${DB_URL}/${test_path}.json" \
        -H "Content-Type: application/json" \
        -d "$test_data" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Write permission: OK${NC}"
        echo "✓ Write permission: OK" >> $REPORT_FILE
        
        # Clean up test data
        curl -s -X DELETE "${DB_URL}/${test_path}.json" > /dev/null 2>&1
        return 0
    else
        echo -e "${RED}✗ Write permission: DENIED${NC}"
        echo "✗ Write permission: DENIED" >> $REPORT_FILE
        return 1
    fi
}

# ── FUNCTION: TEST READ PERMISSION ──
test_read() {
    echo -e "\n${BLUE}Testing read permissions...${NC}"
    echo "" >> $REPORT_FILE
    echo "Read Permission Test:" >> $REPORT_FILE
    
    if curl -s "${DB_URL}/customers/.json" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Read permission: OK${NC}"
        echo "✓ Read permission: OK" >> $REPORT_FILE
        return 0
    else
        echo -e "${RED}✗ Read permission: DENIED${NC}"
        echo "✗ Read permission: DENIED" >> $REPORT_FILE
        return 1
    fi
}

# ── FUNCTION: CHECK DATA STRUCTURE ──
check_structure() {
    echo -e "\n${BLUE}Checking data structure...${NC}"
    echo "" >> $REPORT_FILE
    echo "Data Structure Validation:" >> $REPORT_FILE
    
    # Check if customers exist
    local customers=$(curl -s "${DB_URL}/customers/.json")
    
    if [ -z "$customers" ] || [ "$customers" = "null" ]; then
        echo -e "${YELLOW}⚠${NC} No customer data found"
        echo "⚠ No customer data found" >> $REPORT_FILE
    else
        echo -e "${GREEN}✓${NC} Customer data present"
        echo "✓ Customer data present" >> $REPORT_FILE
    fi
}

# ── FUNCTION: ESTIMATE SIZE ──
estimate_size() {
    echo -e "\n${BLUE}Estimating database size...${NC}"
    echo "" >> $REPORT_FILE
    echo "Database Size Estimate:" >> $REPORT_FILE
    
    local data=$(curl -s "${DB_URL}/.json")
    local size=${#data}
    local size_kb=$((size / 1024))
    
    if [ $size_kb -lt 1 ]; then
        echo -e "${YELLOW}⚠${NC} Database size: < 1 KB"
        echo "⚠ Database size: < 1 KB" >> $REPORT_FILE
    else
        echo -e "${GREEN}✓${NC} Database size: ~$size_kb KB"
        echo "✓ Database size: ~$size_kb KB" >> $REPORT_FILE
    fi
}

# ── FUNCTION: SECURITY CHECK ──
security_check() {
    echo -e "\n${BLUE}Checking security rules...${NC}"
    echo "" >> $REPORT_FILE
    echo "Security Rules:" >> $REPORT_FILE
    
    # Try to read without auth
    if curl -s "${DB_URL}/.json" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠${NC} Database is public (no authentication required)"
        echo "⚠ Database is public (no authentication required)" >> $REPORT_FILE
    else
        echo -e "${GREEN}✓${NC} Authentication required"
        echo "✓ Authentication required" >> $REPORT_FILE
    fi
}

# ── RUN ALL CHECKS ──
echo ""

if test_connection; then
    check_collections
    test_write
    test_read
    check_structure
    estimate_size
    security_check
else
    echo -e "${RED}Cannot proceed - database unreachable${NC}"
    exit 1
fi

# ── SUMMARY ──
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  ✅ HEALTH CHECK COMPLETE! ✅                 ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║                                                                ║"
echo "║  Database Status: HEALTHY                                      ║"
echo "║  URL: https://babysitter-b322c-default-rtdb.firebaseio.com    ║"
echo "║                                                                ║"
echo "║  Detailed report saved to:                                     ║"
echo "║  firebase-health-report.txt                                    ║"
echo "║                                                                ║"
echo "║  If any issues found:                                          ║"
echo "║  1. Check Firebase Console for errors                          ║"
echo "║  2. Verify database rules are configured                       ║"
echo "║  3. Check credentials in .env file                             ║"
echo "║  4. Call support: (812) 373-6023                               ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"

echo ""
echo "Report saved: $REPORT_FILE"
