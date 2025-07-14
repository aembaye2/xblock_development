# XBlock Development Environment Setup

Since the xblock-env folder is huge due to being a virtual environment, we exclude it from the repo and recreate it using installation steps.

# Steps to Recreate the Virtual Environment:

## 1. Navigate to your project directory

```bash
cd /workspaces/xblock_development
```

## 2. Create a new virtual environment

```bash
python -m venv xblock-env
```

## 3. Activate the virtual environment

```bash
source xblock-env/bin/activate
```

## 4. Upgrade pip (recommended)

```bash
pip install --upgrade pip
```

## 5. Install XBlocks in development mode
Since the requirements.txt has some dependency conflicts, install the XBlocks directly:

```bash
# Install the graphing XBlock
pip install -e ./graphingxblock

# Install the drag-and-drop XBlock
pip install -e ./xblock-dragdrop2

# Install the XBlock SDK
pip install -e ./xblock-sdk
```

## 6. Verify the installation

```bash
pip list
```

## 7. Run database migrations

```bash
python xblock-sdk/manage.py migrate
```

## 8. Start the development server

```bash
python xblock-sdk/manage.py runserver
```

The server will be available at http://localhost:8000/

## Fixed Issues:
- Changed python3 to python (python3 command not available in this environment)
- Fixed XBlock registration: dragdrop2 scenarios were using incorrect tag name "adddrop2"
- Updated installation steps to avoid requirements.txt conflicts
- **DoneXBlock Django Compatibility**: Fixed Django version conflict by installing Django 4.2.23 instead of 5.2.4
  - Issue: `djpyfs` dependency uses deprecated `index_together` attribute removed in Django 5.x
  - Solution: Install `Django==4.2.23` and `django-pyfs` before installing XBlocks
- Updated setup_env.sh to automatically handle correct Django version and DoneXBlock installation
- **edx-jsme XBlock Compatibility**: Converted from legacy CAPA system to standalone XBlock
  - Issue: Original version required full edX platform's `capa` (Computer Assisted Personalized Approach) system
  - Solution: Completely rewrote as a proper XBlock using XBlock SDK standards
  - Current Status: **Working with text-based SMILES input** (graphical editor integration pending)
  - New Features: 
    - Text-based chemical structure input using SMILES notation
    - Proper XBlock fields and handlers
    - Studio configuration interface
    - Grade submission and scoring
    - Attempt tracking and limits
    - Auto-save functionality
  - Entry Point: `jsme = edx_jsme.jsme_xblock:JSMEXBlock`
  - Note: Full graphical JSME integration requires additional work to properly embed the JSME applet