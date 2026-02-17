#!/bin/bash

# ============================================
# Setup Local Supabase for Testing
# ============================================
# This script helps you set up a local Supabase instance
# for testing without affecting your production database

set -e  # Exit on error

echo "🚀 UCL Fantasy - Local Supabase Setup"
echo "======================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Supabase CLI not found. Installing..."
    npm install -g supabase
    echo "✅ Supabase CLI installed"
else
    echo "✅ Supabase CLI is installed"
fi

echo ""

# Check if Supabase is already initialized
if [ ! -d "supabase" ]; then
    echo "⚠️  Warning: No supabase directory found"
    echo "This project already has migrations in supabase/migrations/"
    echo "Skipping supabase init..."
else
    echo "✅ Supabase directory exists"
fi

echo ""
echo "🐳 Starting local Supabase..."
echo "This may take a few minutes on first run (downloading Docker images)"
echo ""

# Start Supabase
supabase start

echo ""
echo "✅ Supabase started successfully!"
echo ""

# Get the local credentials
echo "📋 Your local Supabase credentials:"
echo "===================================="
supabase status

echo ""
echo "📝 Next steps:"
echo "1. Copy the API URL and anon key above"
echo "2. Create a .env.local file with these values:"
echo ""
echo "   VITE_SUPABASE_URL=http://localhost:54321"
echo "   VITE_SUPABASE_ANON_KEY=<anon key from above>"
echo ""
echo "3. Run 'npm run dev' to start your app"
echo "4. Your app will now use the local database!"
echo ""
echo "🎮 Useful commands:"
echo "  - supabase status       # Check status"
echo "  - supabase stop         # Stop local Supabase"
echo "  - supabase db reset     # Reset database and re-run migrations"
echo "  - npm run reset-scores  # Reset match scores"
echo ""
echo "🌐 Access Supabase Studio: http://localhost:54323"
echo ""

