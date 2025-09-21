# To run this code,  on the terminal run the following:

# create and activate venv and install the xblocks as packages into the venv

./setup_env.sh && source xblock-env/bin/activate && python xblock-sdk/manage.py runserver 

source xblock-env/bin/activate 

python xblock-sdk/manage.py runserver
# After this, each time you want to run the server:

python xblock-sdk/manage.py runserver 

# Once these is done, each time you create a new xblock:
pip install -e xblockname

# You don't need to run setup_env.sh again and again because you are re-installing things unnecessarily; if you are updating lines of code in xblock, it updates automatically in the env because the --egg file tracks those changes

# only if the installing of xblock is not done well, you can uninstall it and reinstall it afresh:

pip uninstall xblockname

####
source xblock-env/bin/activate && python xblock-sdk/manage.py runserver 


## git commands

git add .
git commit -m "commited on 9/2/2025b"
git push origin main


npm install --legacy-peer-deps



# Troubleshooting when xblock doesn't work or gives error:

- try to fix it based on the error on build and then don't forget to reinstall the xblock; installing it many times doesn't hurt

9/7:  You can fix the esthetics of the canvas but focus on functionality-- capture the drawing in .json file, or table with (like the streamlit drawing-canvas) and send it to drawing.py file for processing i.e., whether the drawing is right or wrong