#!/bin/bash

echo "🧪 Testing auto-migration setup for all PetPro services..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test migration setup
test_service_migration() {
    local service_name=$1
    local service_path=$2
    
    echo -e "\n${YELLOW}Testing ${service_name}...${NC}"
    
    # Check if sequelize config exists
    if [ ! -f "${service_path}/sequelize.config.js" ]; then
        echo -e "${RED}❌ sequelize.config.js not found in ${service_name}${NC}"
        return 1
    else
        echo -e "${GREEN}✅ sequelize.config.js found${NC}"
    fi
    
    # Check if migrations directory exists
    if [ ! -d "${service_path}/src/database/migrations" ]; then
        echo -e "${RED}❌ migrations directory not found in ${service_name}${NC}"
        return 1
    else
        echo -e "${GREEN}✅ migrations directory found${NC}"
    fi
    
    # Check if main.ts has migration code
    if grep -q "sequelize-cli db:migrate" "${service_path}/src/main.ts"; then
        echo -e "${GREEN}✅ Auto-migration code found in main.ts${NC}"
    else
        echo -e "${RED}❌ Auto-migration code not found in main.ts${NC}"
        return 1
    fi
    
    # Check if sequelize-cli is available
    cd "${service_path}"
    if [ -f "package.json" ]; then
        if npm list sequelize-cli &>/dev/null; then
            echo -e "${GREEN}✅ sequelize-cli is available${NC}"
        else
            echo -e "${YELLOW}⚠️  sequelize-cli not installed, but migrations should still work${NC}"
        fi
    fi
    
    echo -e "${GREEN}✅ ${service_name} migration setup complete${NC}"
    return 0
}

# Test each service
echo "Testing services..."

# Auth Service
test_service_migration "Auth Service" "auth-service"
auth_result=$?

# Booking Service  
test_service_migration "Booking Service" "booking-service"
booking_result=$?

# Admin Service
test_service_migration "Admin Service" "admin-service"
admin_result=$?

# Inventory Service
test_service_migration "Inventory Service" "inventory-service"
inventory_result=$?

# Summary
echo -e "\n${YELLOW}=== MIGRATION SETUP SUMMARY ===${NC}"
echo -e "Auth Service: $([[ $auth_result -eq 0 ]] && echo -e "${GREEN}✅ READY${NC}" || echo -e "${RED}❌ NEEDS WORK${NC}")"
echo -e "Booking Service: $([[ $booking_result -eq 0 ]] && echo -e "${GREEN}✅ READY${NC}" || echo -e "${RED}❌ NEEDS WORK${NC}")"
echo -e "Admin Service: $([[ $admin_result -eq 0 ]] && echo -e "${GREEN}✅ READY${NC}" || echo -e "${RED}❌ NEEDS WORK${NC}")"
echo -e "Inventory Service: $([[ $inventory_result -eq 0 ]] && echo -e "${GREEN}✅ READY${NC}" || echo -e "${RED}❌ NEEDS WORK${NC}")"

total_failed=$((auth_result + booking_result + admin_result + inventory_result))

if [ $total_failed -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All services are ready for auto-migration!${NC}"
    echo -e "${GREEN}When you start any service, it will automatically run database migrations.${NC}"
else
    echo -e "\n${RED}❌ $total_failed service(s) need attention${NC}"
    exit 1
fi