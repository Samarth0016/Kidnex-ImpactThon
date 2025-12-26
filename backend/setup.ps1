# Health Platform Backend - Setup Script

Write-Host "🏥 Health Monitoring Platform - Backend Setup" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "📦 Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Node.js $nodeVersion found" -ForegroundColor Green
}
else {
    Write-Host "❌ Node.js not found. Please install Node.js v18 or higher" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host "📦 Checking npm installation..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ npm $npmVersion found" -ForegroundColor Green
}
else {
    Write-Host "❌ npm not found" -ForegroundColor Red
    exit 1
}

# Check if .env exists
Write-Host ""
Write-Host "🔍 Checking environment configuration..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Copying from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit .env file with your credentials:" -ForegroundColor Yellow
    Write-Host "   - DATABASE_URL (PostgreSQL connection string)" -ForegroundColor White
    Write-Host "   - CLOUDINARY_* (Cloudinary account details)" -ForegroundColor White
    Write-Host "   - GEMINI_API_KEY (Google AI API key)" -ForegroundColor White
    Write-Host "   - JWT_SECRET (random secret string)" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "Have you configured .env? (y/n)"
    if ($continue -ne "y") {
        Write-Host "Please configure .env file and run this script again" -ForegroundColor Yellow
        exit 0
    }
}
else {
    Write-Host "✅ .env file found" -ForegroundColor Green
}

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
}
else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Generate Prisma Client
Write-Host ""
Write-Host "🔄 Generating Prisma Client..." -ForegroundColor Yellow
npm run db:generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prisma Client generated successfully" -ForegroundColor Green
}
else {
    Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}

# Ask about database setup
Write-Host ""
Write-Host "🗄️  Database Setup" -ForegroundColor Yellow
Write-Host "Do you want to push the schema to the database now? (y/n)"
Write-Host "Note: Make sure your DATABASE_URL in .env is correct" -ForegroundColor Gray
$dbSetup = Read-Host

if ($dbSetup -eq "y") {
    Write-Host "📤 Pushing schema to database..." -ForegroundColor Yellow
    npm run db:push
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database schema created successfully" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Failed to push schema. Check your DATABASE_URL" -ForegroundColor Red
        Write-Host "You can run 'npm run db:push' manually later" -ForegroundColor Yellow
    }
}
else {
    Write-Host "⚠️  Skipped database setup. Run 'npm run db:push' when ready" -ForegroundColor Yellow
}

# Final message
Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure PostgreSQL is running" -ForegroundColor White
Write-Host "2. Make sure Python ML server is running (python app.py)" -ForegroundColor White
Write-Host "3. Start the backend server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - README.md for full documentation" -ForegroundColor White
Write-Host "   - QUICKSTART.md for quick start guide" -ForegroundColor White
Write-Host "   - IMPLEMENTATION_SUMMARY.md for overview" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Server will run on: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔍 Health check: http://localhost:3000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
