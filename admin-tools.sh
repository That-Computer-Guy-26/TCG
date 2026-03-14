#!/bin/bash

# ============================================================
# TCG WEBSITE - FIREBASE ADMIN TOOLS
# Manage, backup, and administer your database
# ============================================================

echo "
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║        🔧 TCG FIREBASE ADMIN TOOLS 🔧                         ║
║                                                                ║
║  Backup, restore, and manage your database                    ║
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
BACKUP_DIR="firebase-backups"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-tcg2025}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# ── MENU ──
show_menu() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${BLUE}         FIREBASE ADMIN TOOLS MENU${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo ""
    echo "1) 💾 Backup Database"
    echo "2) 📥 Restore Database"
    echo "3) 🗑️  Clear All Data"
    echo "4) 👥 Add Customer"
    echo "5) 📅 Add Booking"
    echo "6) 💳 Add Invoice"
    echo "7) 📊 Generate Report"
    echo "8) 🔍 View Collection"
    echo "9) ❌ Delete Entry"
    echo "0) 🚪 Exit"
    echo ""
    read -p "Choose option (0-9): " option
}

# ── FUNCTION: BACKUP DATABASE ──
backup_database() {
    echo -e "\n${BLUE}Creating database backup...${NC}\n"
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/firebase_backup_${timestamp}.json"
    
    echo "Downloading data..."
    if curl -s "${DB_URL}/.json" > "$backup_file"; then
        local size=$(du -h "$backup_file" | cut -f1)
        echo -e "${GREEN}✓ Backup created: $backup_file (${size})${NC}"
        echo "Backup can be restored at any time"
    else
        echo -e "${RED}✗ Backup failed${NC}"
    fi
}

# ── FUNCTION: RESTORE DATABASE ──
restore_database() {
    echo -e "\n${BLUE}Available backups:${NC}\n"
    
    local backups=($(ls -t "$BACKUP_DIR"/firebase_backup_*.json 2>/dev/null))
    
    if [ ${#backups[@]} -eq 0 ]; then
        echo -e "${RED}No backups found${NC}"
        return
    fi
    
    for i in "${!backups[@]}"; do
        echo "$((i + 1))) ${backups[$i]##*/}"
    done
    
    echo ""
    read -p "Choose backup to restore (1-${#backups[@]}): " backup_choice
    
    if [ $backup_choice -ge 1 ] && [ $backup_choice -le ${#backups[@]} ]; then
        local selected_backup="${backups[$((backup_choice - 1))]}"
        
        read -p "Are you sure? This will overwrite all data. Type 'restore' to confirm: " confirm
        
        if [ "$confirm" = "restore" ]; then
            echo -e "${YELLOW}Restoring...${NC}"
            
            if curl -s -X PUT "${DB_URL}/.json" \
                -H "Content-Type: application/json" \
                -d @"$selected_backup" > /dev/null; then
                echo -e "${GREEN}✓ Database restored successfully${NC}"
            else
                echo -e "${RED}✗ Restore failed${NC}"
            fi
        else
            echo -e "${YELLOW}Restore cancelled${NC}"
        fi
    fi
}

# ── FUNCTION: CLEAR ALL DATA ──
clear_database() {
    echo -e "\n${RED}WARNING: This will DELETE ALL DATA!${NC}"
    read -p "Type 'DELETE ALL' to confirm: " confirm
    
    if [ "$confirm" = "DELETE ALL" ]; then
        echo -e "${YELLOW}Clearing database...${NC}"
        
        if curl -s -X DELETE "${DB_URL}/.json" > /dev/null; then
            echo -e "${GREEN}✓ Database cleared${NC}"
        else
            echo -e "${RED}✗ Clear failed${NC}"
        fi
    else
        echo -e "${YELLOW}Operation cancelled${NC}"
    fi
}

# ── FUNCTION: ADD CUSTOMER ──
add_customer() {
    echo -e "\n${BLUE}Adding new customer...${NC}\n"
    
    read -p "Customer name: " name
    read -p "Email: " email
    read -p "Phone: " phone
    read -p "Address: " address
    
    local id="CUST-$(date +%s)"
    local data='{
        "id": "'$id'",
        "name": "'$name'",
        "email": "'$email'",
        "phone": "'$phone'",
        "address": "'$address'",
        "status": "active",
        "created": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }'
    
    if curl -s -X POST "${DB_URL}/customers.json" \
        -H "Content-Type: application/json" \
        -d "$data" > /dev/null; then
        echo -e "${GREEN}✓ Customer added: $id${NC}"
    else
        echo -e "${RED}✗ Failed to add customer${NC}"
    fi
}

# ── FUNCTION: ADD BOOKING ──
add_booking() {
    echo -e "\n${BLUE}Adding new booking...${NC}\n"
    
    read -p "Customer name: " name
    read -p "Email: " email
    read -p "Phone: " phone
    read -p "Service: " service
    read -p "Date (YYYY-MM-DD): " date
    read -p "Time (HH:MM): " time
    
    local id="BK-$(date +%s)"
    local data='{
        "id": "'$id'",
        "name": "'$name'",
        "email": "'$email'",
        "phone": "'$phone'",
        "service": "'$service'",
        "date": "'$date'",
        "time": "'$time'",
        "status": "confirmed",
        "type": "booking",
        "created": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }'
    
    if curl -s -X POST "${DB_URL}/bookings.json" \
        -H "Content-Type: application/json" \
        -d "$data" > /dev/null; then
        echo -e "${GREEN}✓ Booking added: $id${NC}"
    else
        echo -e "${RED}✗ Failed to add booking${NC}"
    fi
}

# ── FUNCTION: ADD INVOICE ──
add_invoice() {
    echo -e "\n${BLUE}Adding new invoice...${NC}\n"
    
    read -p "Customer ID: " customer_id
    read -p "Amount: " amount
    read -p "Description: " description
    read -p "Status (draft/sent/paid): " status
    
    local id="INV-$(date +%s)"
    local tax=$((amount * 10 / 100))
    local total=$((amount + tax))
    
    local data='{
        "id": "'$id'",
        "customer_id": "'$customer_id'",
        "subtotal": '$amount',
        "tax": '$tax',
        "total": '$total',
        "tax_rate": 0.1,
        "description": "'$description'",
        "status": "'$status'",
        "created": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
        "due_date": "'$(date -d "+30 days" +%Y-%m-%dT%H:%M:%SZ)'"
    }'
    
    if curl -s -X POST "${DB_URL}/invoices.json" \
        -H "Content-Type: application/json" \
        -d "$data" > /dev/null; then
        echo -e "${GREEN}✓ Invoice added: $id (Total: \$$total)${NC}"
    else
        echo -e "${RED}✗ Failed to add invoice${NC}"
    fi
}

# ── FUNCTION: GENERATE REPORT ──
generate_report() {
    echo -e "\n${BLUE}Generating database report...${NC}\n"
    
    local report_file="firebase-report-$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "═══════════════════════════════════════════════════════════════"
        echo "TCG FIREBASE DATABASE REPORT"
        echo "Generated: $(date)"
        echo "═══════════════════════════════════════════════════════════════"
        echo ""
        
        echo "COLLECTIONS:"
        for collection in customers bookings invoices services appointments leads technicians; do
            local count=$(curl -s "${DB_URL}/${collection}/.json?shallow=true" | grep -o '"' | wc -l)
            echo "  $collection: $(($count / 2)) items"
        done
        
        echo ""
        echo "RECENT BOOKINGS:"
        curl -s "${DB_URL}/bookings/.json?limitToLast=5" | head -20
        
        echo ""
        echo "RECENT INVOICES:"
        curl -s "${DB_URL}/invoices/.json?limitToLast=5" | head -20
        
    } > "$report_file"
    
    echo -e "${GREEN}✓ Report generated: $report_file${NC}"
}

# ── FUNCTION: VIEW COLLECTION ──
view_collection() {
    echo -e "\n${BLUE}Collections available:${NC}\n"
    
    local collections=("customers" "bookings" "invoices" "services" "appointments" "leads" "technicians")
    
    for i in "${!collections[@]}"; do
        echo "$((i + 1))) ${collections[$i]}"
    done
    
    echo ""
    read -p "Choose collection (1-${#collections[@]}): " choice
    
    if [ $choice -ge 1 ] && [ $choice -le ${#collections[@]} ]; then
        local collection="${collections[$((choice - 1))]}"
        
        echo -e "\n${BLUE}Data in $collection:${NC}\n"
        curl -s "${DB_URL}/${collection}/.json" | head -50
    fi
}

# ── FUNCTION: DELETE ENTRY ──
delete_entry() {
    echo -e "\n${BLUE}Delete an entry...${NC}\n"
    
    read -p "Collection: " collection
    read -p "Entry ID: " entry_id
    
    read -p "Are you sure? Type 'DELETE' to confirm: " confirm
    
    if [ "$confirm" = "DELETE" ]; then
        if curl -s -X DELETE "${DB_URL}/${collection}/${entry_id}.json" > /dev/null; then
            echo -e "${GREEN}✓ Entry deleted${NC}"
        else
            echo -e "${RED}✗ Deletion failed${NC}"
        fi
    fi
}

# ── MAIN LOOP ──
while true; do
    show_menu
    
    case $option in
        1) backup_database ;;
        2) restore_database ;;
        3) clear_database ;;
        4) add_customer ;;
        5) add_booking ;;
        6) add_invoice ;;
        7) generate_report ;;
        8) view_collection ;;
        9) delete_entry ;;
        0) echo -e "\n${GREEN}Goodbye!${NC}\n"; exit 0 ;;
        *) echo -e "${RED}Invalid option${NC}" ;;
    esac
done
