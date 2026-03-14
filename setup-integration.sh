#!/bin/bash

# ============================================================
# TCG WEBSITE v2.0 - COMPLETE INTEGRATION SETUP
# Auto-configures everything: Bootstrap, Health Check, Admin
# ============================================================

set -e

echo "
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║     🚀 TCG WEBSITE - COMPLETE INTEGRATION SETUP 🚀           ║
║                                                                ║
║  This will configure EVERYTHING automatically:                ║
║  • Connect to your Firebase database                          ║
║  • Populate with sample data                                  ║
║  • Verify connectivity                                        ║
║  • Setup admin tools                                          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DB_URL="https://babysitter-b322c-default-rtdb.firebaseio.com"

echo -e "${BLUE}Step 1/5: Verifying prerequisites...${NC}\n"

# Check curl
if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ curl is required${NC}"
    exit 1
fi

echo -e "${GREEN}✓ curl found${NC}"

# Check bash scripts
if [ ! -f "bootstrap-database.sh" ]; then
    echo -e "${RED}❌ bootstrap-database.sh not found${NC}"
    exit 1
fi

if [ ! -f "health-check.sh" ]; then
    echo -e "${RED}❌ health-check.sh not found${NC}"
    exit 1
fi

if [ ! -f "admin-tools.sh" ]; then
    echo -e "${RED}❌ admin-tools.sh not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All scripts found${NC}"

echo -e "\n${BLUE}Step 2/5: Testing Firebase connection...${NC}\n"

# Test connection
if curl -s -m 5 "${DB_URL}/.json" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Firebase database is reachable${NC}"
else
    echo -e "${RED}✗ Cannot reach Firebase database${NC}"
    echo "Check your internet connection and try again"
    exit 1
fi

echo -e "\n${BLUE}Step 3/5: Making scripts executable...${NC}\n"

chmod +x bootstrap-database.sh
chmod +x health-check.sh
chmod +x admin-tools.sh

echo -e "${GREEN}✓ Scripts are executable${NC}"

echo -e "\n${BLUE}Step 4/5: Running health check...${NC}\n"

./health-check.sh

echo -e "\n${BLUE}Step 5/5: Checking for existing data...${NC}\n"

# Check if database has data
local_data=$(curl -s "${DB_URL}/.json")

if [ -z "$local_data" ] || [ "$local_data" = "null" ] || [ "$local_data" = "{}" ]; then
    echo -e "${YELLOW}Database is empty. Ready for sample data.${NC}\n"
    
    read -p "Populate with sample data? (y/n): " populate
    
    if [ "$populate" = "y" ] || [ "$populate" = "Y" ]; then
        echo -e "\n${BLUE}Bootstrapping database...${NC}\n"
        ./bootstrap-database.sh
    else
        echo -e "${YELLOW}Skipped sample data population${NC}"
    fi
else
    echo -e "${GREEN}✓ Database already contains data${NC}"
fi

# ── CREATE INTEGRATION CONFIG ──
echo -e "\n${BLUE}Creating integration configuration...${NC}\n"

cat > tcg-firebase-integration.json << EOF
{
  "name": "TCG Website v2.0 - Firebase Integration",
  "database": {
    "url": "https://babysitter-b322c-default-rtdb.firebaseio.com",
    "project": "babysitter-b322c",
    "status": "configured"
  },
  "features": {
    "bootstrap": true,
    "health_check": true,
    "admin_tools": true,
    "auto_backup": true,
    "sample_data": true
  },
  "paths": {
    "bootstrap": "bootstrap-database.sh",
    "health_check": "health-check.sh",
    "admin_tools": "admin-tools.sh"
  },
  "collections": [
    "customers",
    "bookings",
    "invoices",
    "services",
    "appointments",
    "leads",
    "technicians",
    "timekeeping",
    "inventory",
    "reports",
    "webhooks"
  ],
  "setup_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "setup_user": "$USER",
  "status": "complete"
}
EOF

echo -e "${GREEN}✓ Configuration saved: tcg-firebase-integration.json${NC}"

# ── CREATE QUICK REFERENCE ──
cat > FIREBASE-QUICK-REFERENCE.md << 'EOF'
# TCG Firebase - Quick Reference

## Database URL
https://babysitter-b322c-default-rtdb.firebaseio.com

## Quick Commands

### Backup Database
```bash
./backup-database.sh
```

### Health Check
```bash
./health-check.sh
```

### Admin Tools
```bash
./admin-tools.sh
```

### View Collection
```bash
curl https://babysitter-b322c-default-rtdb.firebaseio.com/customers/.json
```

### Add Data
```bash
curl -X POST https://babysitter-b322c-default-rtdb.firebaseio.com/customers.json \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com"}'
```

### Delete Collection
```bash
curl -X DELETE https://babysitter-b322c-default-rtdb.firebaseio.com/customers/.json
```

## Collections
- customers
- bookings
- invoices
- services
- appointments
- leads
- technicians
- timekeeping
- inventory
- reports
- webhooks

## Support
Phone: (812) 373-6023
Email: gary.amick0614@gmail.com
Available: 24/7
EOF

echo -e "${GREEN}✓ Quick reference created: FIREBASE-QUICK-REFERENCE.md${NC}"

# ── FINAL SUMMARY ──
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║              ✅ INTEGRATION SETUP COMPLETE! ✅                ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║                                                                ║"
echo "║  Firebase Configuration: Complete                              ║"
echo "║  Database: babysitter-b322c                                    ║"
echo "║  URL: https://babysitter-b322c-default-rtdb.firebaseio.com    ║"
echo "║                                                                ║"
echo "║  Available Tools:                                              ║"
echo "║  • Bootstrap Database: ./bootstrap-database.sh                 ║"
echo "║  • Health Check:       ./health-check.sh                       ║"
echo "║  • Admin Tools:        ./admin-tools.sh                        ║"
echo "║                                                                ║"
echo "║  Next Steps:                                                   ║"
echo "║  1. Run: ./start.sh                                            ║"
echo "║  2. Visit: http://localhost:5000                               ║"
echo "║  3. Login with admin credentials                               ║"
echo "║  4. See sample data in all pages                               ║"
echo "║                                                                ║"
echo "║  To Manage Database:                                           ║"
echo "║  ./admin-tools.sh  (Interactive menu)                          ║"
echo "║                                                                ║"
echo "║  For Help:                                                     ║"
echo "║  cat FIREBASE-QUICK-REFERENCE.md                               ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"

echo ""
echo "Integration configuration saved to: tcg-firebase-integration.json"
echo "Quick reference guide: FIREBASE-QUICK-REFERENCE.md"
echo ""
echo "🎉 Your TCG system is ready to use!"
echo ""
