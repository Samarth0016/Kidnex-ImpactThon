#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🏥 Health Monitoring Platform - Backend Setup${NC}"
echo -e "${CYAN}=============================================${NC}"
echo ""

# Check Node.js
echo -e "${YELLOW}📦 Checking Node.js installation...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js $NODE_VERSION found${NC}"
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js v18 or higher${NC}"
    exit 1
fi

# Check npm
echo -e "${YELLOW}📦 Checking npm installation...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm $NPM_VERSION found${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

# Check if .env exists
echo ""
echo -e "${YELLOW}🔍 Checking environment configuration...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Copying from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit .env file with your credentials:${NC}"
    echo -e "   - DATABASE_URL (PostgreSQL connection string)"
    echo -e "   - CLOUDINARY_* (Cloudinary account details)"
    echo -e "   - GEMINI_API_KEY (Google AI API key)"
    echo -e "   - JWT_SECRET (random secret string)"
    echo ""
    read -p "Have you configured .env? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Please configure .env file and run this script again${NC}"
        exit 0
    fi
else
    echo -e "${GREEN}✅ .env file found${NC}"
fi

# Install dependencies
echo ""
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

# Generate Prisma Client
echo ""
echo -e "${YELLOW}🔄 Generating Prisma Client...${NC}"
npm run db:generate
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Prisma Client generated successfully${NC}"
else
    echo -e "${RED}❌ Failed to generate Prisma Client${NC}"
    exit 1
fi

# Ask about database setup
echo ""
echo -e "${YELLOW}🗄️  Database Setup${NC}"
echo "Do you want to push the schema to the database now? (y/n)"
echo -e "${NC}Note: Make sure your DATABASE_URL in .env is correct${NC}"
read -p "" -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}📤 Pushing schema to database...${NC}"
    npm run db:push
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database schema created successfully${NC}"
    else
        echo -e "${RED}❌ Failed to push schema. Check your DATABASE_URL${NC}"
        echo -e "${YELLOW}You can run 'npm run db:push' manually later${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipped database setup. Run 'npm run db:push' when ready${NC}"
fi

# Final message
echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo -e "${GREEN}=============================================${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo "1. Make sure PostgreSQL is running"
echo "2. Make sure Python ML server is running (python app.py)"
echo "3. Start the backend server:"
echo -e "${YELLOW}   npm run dev${NC}"
echo ""
echo -e "${CYAN}📚 Documentation:${NC}"
echo "   - README.md for full documentation"
echo "   - QUICKSTART.md for quick start guide"
echo "   - IMPLEMENTATION_SUMMARY.md for overview"
echo ""
echo -e "${CYAN}🌐 Server will run on: http://localhost:3000${NC}"
echo -e "${CYAN}🔍 Health check: http://localhost:3000/health${NC}"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
