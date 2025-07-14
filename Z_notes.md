
# Since the xblock-env folder is huge due to being venv, just repo the requirements.txt and other folders and next time just install from there


# Great question! Here are the steps you should follow to recreate the xblock-env virtual environment from your requirements.txt file when you restart the repository in a new Codespace:

# Steps to Recreate the Virtual Environment:
# 1. Navigate to your project directory

cd /workspaces/xblock_development

# 2. Create a new virtual environment

python3 -m venv xblock-env

# 3. Activate the virtual environment

source xblock-env/bin/activate

# 4. Upgrade pip (recommended)

pip install --upgrade pip

# 5. Install dependencies from requirements.txt

pip install -r requirements.txt

# 6. Install your custom XBlocks in development mode (if needed)

# For your graphing XBlockcd graphingxblockpip install -e .cd ..# For the drag-and-drop XBlock (if you want to work with it)
# from root folder
cd xblock-dragdrop2

pip install -e . 

cd

# 7. Verify the installation

pip list

# 8. Test that everything works

# from the root folder

python xblock-sdk/manage.py runserver