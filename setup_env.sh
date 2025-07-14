#!/bin/bash

# XBlock Development Environment Setup Script
# This script automates the setup process described in Z_notes.md

set -e  # Exit on any error

echo "🚀 Starting XBlock Development Environment Setup..."

# 1. Navigate to project directory (we're already here)
echo "📁 Current directory: $(pwd)"

# 2. Create virtual environment if it doesn't exist
if [ ! -d "xblock-env" ]; then
    echo "🐍 Creating virtual environment..."
    python -m venv xblock-env
else
    echo "✅ Virtual environment already exists"
fi

# 3. Activate virtual environment
echo "🔧 Activating virtual environment..."
source xblock-env/bin/activate

# 4. Upgrade pip
echo "📦 Upgrading pip..."
pip install --upgrade pip

# 4.5. Install correct Django version for XBlock compatibility
echo "🐍 Installing Django 4.2.23 for XBlock compatibility..."
pip install "Django==4.2.23"

# 4.6. Install additional dependencies for DoneXBlock
echo "📋 Installing additional dependencies..."
pip install django-pyfs

# 5. Install XBlocks in development mode
echo "📚 Installing XBlocks in development mode..."

if [ -d "xblock-sdk" ]; then
    echo "  - Installing XBlock SDK..."
    pip install -e ./xblock-sdk
else
    echo "  ⚠️  Warning: xblock-sdk directory not found"
fi

if [ -d "graphingxblock" ]; then
    echo "  - Installing graphing XBlock..."
    pip install -e ./graphingxblock
else
    echo "  ⚠️  Warning: graphingxblock directory not found"
fi

if [ -d "xblock-dragdrop2" ]; then
    echo "  - Installing dragdrop2 XBlock..."
    pip install -e ./xblock-dragdrop2
else
    echo "  ⚠️  Warning: xblock-dragdrop2 directory not found"
fi

if [ -d "DoneXBlock" ]; then
    echo "  - Installing DoneXBlock..."
    pip install -e ./DoneXBlock
else
    echo "  ⚠️  Warning: DoneXBlock directory not found"
fi


# 6. Verify installation
echo "📋 Verifying installation..."
pip list | grep -E "(xblock|graphing|drag|done|Django)"

# 7. Run database migrations
echo "🗄️  Running database migrations..."
if [ -f "xblock-sdk/manage.py" ]; then
    python xblock-sdk/manage.py migrate
else
    echo "  ⚠️  Warning: manage.py not found, skipping migrations"
fi

echo "✅ Setup complete!"
echo ""
echo "🎯 To start the development server, run:"
echo "   source xblock-env/bin/activate"
echo "   python xblock-sdk/manage.py runserver"
echo ""
echo "🌐 The server will be available at http://localhost:8000/"
