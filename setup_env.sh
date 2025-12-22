#!/bin/bash

# XBlock Development Environment Setup Script
# This script automates the setup process described in Z_notes.md

set -e  # Exit on any error

echo "🚀 Starting XBlock Development Environment Setup..."

echo "📁 Current directory: $(pwd)"

# 1. Navigate to project directory (we're already here)

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
mkdir var
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


if [ -d "xblock-dragdrop2" ]; then
    echo "  - Installing dragdrop2 XBlock..."
    pip install -e ./xblock-dragdrop2
else
    echo "  ⚠️  Warning: xblock-dragdrop2 directory not found"
fi


if [ -d "drawing-xblock-react" ]; then
    echo "  - Installing drawing-xblock-react ..."
    pip install -e ./drawing-xblock-react
else
    echo "  ⚠️  Warning: drawing-xblock-react directory not found"
fi

# if [ -d "xblock-vectordraw2" ]; then
#     echo "  - Installing xblock-vectordraw2..."
#     pip install -e ./xblock-vectordraw2
# else
#     echo "  ⚠️  Warning: xblock-vectordraw2 directory not found"
# fi

if [ -d "xblock-vectordraw3" ]; then
    echo "  - Installing xblock-vectordraw3..."
    pip install -e ./xblock-vectordraw3
else
    echo "  ⚠️  Warning: xblock-vectordraw3 directory not found"
fi

if [ -d "xblock-mcqs" ]; then
    echo "  - Installing xblock-mcqs..."
    pip install -e ./xblock-mcqs
else
    echo "  ⚠️  Warning: xblock-mcqs directory not found"
fi

if [ -d "xblock-sortable2" ]; then
    echo "  - Installing xblock-sortable2..."
    pip install -e ./xblock-sortable2
else
    echo "  ⚠️  Warning: xblock-sortable directory not found"
fi

if [ -d "xblock-sortable4" ]; then
    echo "  - Installing xblock-sortable4..."
    pip install -e ./xblock-sortable4
else
    echo "  ⚠️  Warning: xblock-sortable directory not found"
fi

# if [ -d "formula_excercise_block" ]; then
#     echo "  - Installing formula_excercise_block..."
#     pip install -e ./formula_excercise_block
# else
#     echo "  ⚠️  Warning: formula_excercise_block directory not found"
# fi

if [ -d "xblock-react" ]; then
    echo "  - Installing xblock-react..."
    pip install -e ./xblock-react
else
    echo "  ⚠️  Warning: xblock-react directory not found"
fi

if [ -d "xblock-myxblock-react" ]; then
    echo "  - Installing xblock-myxblock-react ..."
    pip install -e ./xblock-myxblock-react
else
    echo "  ⚠️  Warning: xblock-myxblock directory not found"
fi

if [ -d "openedx-xblock-inline-dropdown" ]; then
    echo "  - openedx-xblock-inline-dropdown ..."
    pip install -e ./openedx-xblock-inline-dropdown
else
    echo "  ⚠️  Warning: xblock-myxblock directory not found"
fi

if [ -d "diagram-xblock" ]; then
    echo "  - Installing diagram-xblock ..."
    pip install -e ./diagram-xblock
else
    echo "  ⚠️  Warning: diagram-xblock directory not found"
fi

# 7. Run database migrations
echo "🗄️  Running database migrations..."
if [ -f "xblock-sdk/manage.py" ]; then
    python xblock-sdk/manage.py migrate
else
    echo "  ⚠️  Warning: manage.py not found, skipping migrations"
fi

# Ensure expected var/log directories exist so Django's logging handlers can open files
# echo "📂 Ensuring var directories exist for logs..."
# mkdir -p "${PWD}/var"
# mkdir -p "${PWD}/drawing-xblock-react/drawing/frontend/var"


echo "✅ Setup complete!"
echo ""
echo "🎯 To start the development server, run:"
echo "   source xblock-env/bin/activate"
echo "   python xblock-sdk/manage.py runserver"
