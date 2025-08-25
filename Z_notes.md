# To run this code,  on the terminal run the following:

# create and activate venv and install the xblocks as packages into the venv

./setup_env.sh

# Then start the server by running:

./start_server.sh

# After this, each time you want to run the server:

python xblock-sdk/manage.py runserver 

# Once these is done, each time you create a new xblock:
pip install -e xblockname

# You don't need to run setup_env.sh again and again because you are re-installing things unnecessarily; if you are updating lines of code in xblock, it updates automatically in the env because the --egg file tracks those changes

# only if the installing of xblock is not done well, you can uninstall it and reinstall it afresh:

pip uninstall xblockname

####
source xblock-env/bin/activate
python xblock-sdk/manage.py runserver 


## git commands

git add .
git commit -m "commited on 8/24/2024"
git push origin main



