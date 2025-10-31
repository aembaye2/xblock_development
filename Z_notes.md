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


# Troubleshooting when xblock doesn't work or gives error:

- try to fix it based on the error on build and then don't forget to reinstall the xblock; installing it many times doesn't hurt if things are not working

9/7:  You can fix the esthetics of the canvas but focus on functionality-- capture the drawing in .json file, or table with (like the streamlit drawing-canvas) and send it to drawing.py file for processing i.e., whether the drawing is right or wrong

# Editing the React frontend code
The main file for the XBlock's user interface is react_xblock_2/frontend/src/react_xblock_2.tsx. But in order to edit this file, you will first have to install the required Node packages and start the frontend compiler:

cd drawing-xblock-react/drawing/frontend/ && npm install --legacy-peer-deps && npm run watch

npm install --legacy-peer-deps
npm run watch

npm install --legacy-peer-deps

## stage the changed files (prefer explicit path rather than `.`)
git add drawing-xblock-react/setup.py
# add any other files you intentionally changed (changelog, README, etc.)
git add drawing-xblock-react/CHANGELOG.rst

git commit -m "Bump drawing-xblock-react to V2.0.0" \
 && git tag -a V2.0.0 -m "Release V2.0.0" \
 && git push origin main --follow-tags


# then in openedx tutor:

tutor config save --append OPENEDX_EXTRA_PIP_REQUIREMENTS="git+https://github.com/aembaye2/xblock_development.git@V2.0.0#subdirectory=drawing-xblock-react"