#!/bin/bash

# XBlock Development Server Startup Script
# This script starts the XBlock development server
# Usage: ./start_server.sh [port]
# Default port is 8000

set -e  # Exit on any error

# Get port from command line argument or use default
PORT=${1:-8000}

echo "🚀 Starting XBlock Development Server on port $PORT..."

# Check if virtual environment exists
if [ ! -d "xblock-env" ]; then
    echo "❌ Virtual environment not found! Please run ./setup_env.sh first"
    exit 1
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source xblock-env/bin/activate

# Check if manage.py exists
if [ ! -f "xblock-sdk/manage.py" ]; then
    echo "❌ manage.py not found! Please ensure XBlock SDK is properly installed"
    exit 1
fi

# Start the development server
echo "🌐 Starting development server..."
echo "📍 Server will be available at http://localhost:$PORT/"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

python xblock-sdk/manage.py runserver 0.0.0.0:$PORT
