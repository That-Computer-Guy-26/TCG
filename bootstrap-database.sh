#!/bin/bash

# ============================================================
# TCG WEBSITE - FIREBASE DATABASE BOOTSTRAP
# Automatically populates Firebase with initial data
# ============================================================

set -e

echo "
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║        🚀 TCG FIREBASE DATABASE BOOTSTRAP 🚀                  ║
║                                                                ║
║  This script will populate your Firebase database with        ║
║  sample data to get started immediately!                      ║
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
TIMESTAMP=$(date +%s)

# ── CHECK PREREQUISITES ──
echo -e "${BLUE}Checking prerequisites...${NC}\n"

if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ curl is required${NC}"
    exit 1
fi

echo -e "${GREEN}✓ curl found${NC}\n"

# ── FUNCTION: ADD DATA ──
add_data() {
    local path=$1
    local data=$2
    local name=$3
    
    echo -n "Adding $name... "
    
    if curl -s -X POST "${DB_URL}/${path}.json" \
        -H "Content-Type: application/json" \
        -d "$data" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗ (Check credentials)${NC}"
    fi
}

# ── SAMPLE DATA ──
echo -e "${BLUE}Creating sample data...${NC}\n"

# Customers
CUSTOMER1='{
  "id": "CUST-001",
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "+1-555-0101",
  "address": "123 Main St, Seymour, IN 47274",
  "status": "active",
  "created": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
  "notes": "Regular customer - prefers remote support"
}'

CUSTOMER2='{
  "id": "CUST-002",
  "name": "Sarah Johnson",
  "email": "sarah@example.com",
  "phone": "+1-555-0102",
  "address": "456 Oak Ave, Seymour, IN 47274",
  "status": "active",
  "created": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
  "notes": "Business account - multiple devices"
}'

CUSTOMER3='{
  "id": "CUST-003",
  "name": "Mike Davis",
  "email": "mike@example.com",
  "phone": "+1-555-0103",
  "address": "789 Elm St, Seymour, IN 47274",
  "status": "active",
  "created": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
  "notes": "Referral from existing customer"
}'

# Services
SERVICE1='{
  "id": "SVC-001",
  "name": "Computer Repair",
  "category": "repair",
  "price": 85,
  "description": "Hardware and software repair services",
  "icon": "💻",
  "duration": 120
}'

SERVICE2='{
  "id": "SVC-002",
  "name": "Network Setup",
  "category": "networking",
  "price": 125,
  "description": "WiFi and network configuration",
  "icon": "🌐",
  "duration": 90
}'

SERVICE3='{
  "id": "SVC-003",
  "name": "Data Recovery",
  "category": "recovery",
  "price": 150,
  "description": "Lost file recovery services",
  "icon": "💾",
  "duration": 180
}'

# Bookings
BOOKING1='{
  "id": "BK-001",
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "+1-555-0101",
  "service": "Computer Repair",
  "date": "'$(date -d "+1 day" +%Y-%m-%d)'",
  "time": "10:00",
  "status": "confirmed",
  "type": "booking",
  "created": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
}'

BOOKING2='{
  "id": "BK-002",
  "name": "Sarah Johnson",
  "email": "sarah@example.com",
  "phone": "+1-555-0102",
  "service": "Network Setup",
  "date": "'$(date -d "+2 days" +%Y-%m-%d)'",
  "time": "14:00",
  "status": "confirmed",
  "type": "booking",
  "created": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
}'

# Invoices
INVOICE1='{
  "id": "INV-001",
  "customer_id": "CUST-001",
  "status": "paid",
  "subtotal": 350,
  "tax": 35,
  "total": 385,
  "tax_rate": 0.1,
  "items": [
    {
      "description": "Computer Repair",
      "quantity": 1,
      "price": 350
    }
  ],
  "created": "'$(date -u -d "7 days ago" +%Y-%m-%dT%H:%M:%SZ)'",
  "due_date": "'$(date -d "+30 days" +%Y-%m-%dT%H:%M:%SZ)'",
  "paid_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
}'

INVOICE2='{
  "id": "INV-002",
  "customer_id": "CUST-002",
  "status": "sent",
  "subtotal": 500,
  "tax": 50,
  "total": 550,
  "tax_rate": 0.1,
  "items": [
    {
      "description": "Network Setup",
      "quantity": 1,
      "price": 500
    }
  ],
  "created": "'$(date -u -d "3 days ago" +%Y-%m-%dT%H:%M:%SZ)'",
  "due_date": "'$(date -d "+30 days" +%Y-%m-%dT%H:%M:%SZ)'"
}'

# Appointments
APPOINTMENT1='{
  "id": "APT-001",
  "customer_id": "CUST-001",
  "service": "Computer Repair",
  "date": "'$(date -d "+1 day" +%Y-%m-%d)'",
  "time": "10:00",
  "duration": 120,
  "status": "scheduled",
  "technician_id": "TECH-001",
  "created": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
}'

# Leads
LEAD1='{
  "id": "LD-001",
  "name": "Alice Williams",
  "email": "alice@example.com",
  "phone": "+1-555-0104",
  "service": "Software Installation",
  "message": "Need help installing new software on my laptop",
  "status": "new",
  "type": "lead",
  "created": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
}'

# Technicians
TECH1='{
  "id": "TECH-001",
  "name": "Gary Amick",
  "email": "gary@thatcomputerguy.com",
  "phone": "+1-812-373-6023",
  "specialty": "Computer Repair",
  "status": "active",
  "hourly_rate": 35,
  "created": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
}'

TECH2='{
  "id": "TECH-002",
  "name": "Support Tech",
  "email": "support@thatcomputerguy.com",
  "phone": "+1-812-373-6023",
  "specialty": "Networking",
  "status": "active",
  "hourly_rate": 40,
  "created": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
}'

# ── ADD SAMPLE DATA ──
echo -e "${BLUE}Adding customers...${NC}"
add_data "customers/CUST-001" "$CUSTOMER1" "Customer 1"
add_data "customers/CUST-002" "$CUSTOMER2" "Customer 2"
add_data "customers/CUST-003" "$CUSTOMER3" "Customer 3"

echo -e "\n${BLUE}Adding services...${NC}"
add_data "services/SVC-001" "$SERVICE1" "Service 1"
add_data "services/SVC-002" "$SERVICE2" "Service 2"
add_data "services/SVC-003" "$SERVICE3" "Service 3"

echo -e "\n${BLUE}Adding bookings...${NC}"
add_data "bookings/BK-001" "$BOOKING1" "Booking 1"
add_data "bookings/BK-002" "$BOOKING2" "Booking 2"

echo -e "\n${BLUE}Adding invoices...${NC}"
add_data "invoices/INV-001" "$INVOICE1" "Invoice 1"
add_data "invoices/INV-002" "$INVOICE2" "Invoice 2"

echo -e "\n${BLUE}Adding appointments...${NC}"
add_data "appointments/APT-001" "$APPOINTMENT1" "Appointment 1"

echo -e "\n${BLUE}Adding leads...${NC}"
add_data "leads/LD-001" "$LEAD1" "Lead 1"

echo -e "\n${BLUE}Adding technicians...${NC}"
add_data "technicians/TECH-001" "$TECH1" "Technician 1"
add_data "technicians/TECH-002" "$TECH2" "Technician 2"

# ── SUMMARY ──
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  ✅ DATABASE BOOTSTRAP COMPLETE! ✅           ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║                                                                ║"
echo "║  Sample data added:                                            ║"
echo "║  • 3 Customers                                                 ║"
echo "║  • 3 Services                                                  ║"
echo "║  • 2 Bookings                                                  ║"
echo "║  • 2 Invoices                                                  ║"
echo "║  • 1 Appointment                                               ║"
echo "║  • 1 Lead                                                      ║"
echo "║  • 2 Technicians                                               ║"
echo "║                                                                ║"
echo "║  Ready to use! Start your system and see sample data.          ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
