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