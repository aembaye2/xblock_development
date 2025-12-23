


# Run the Backend
./setup_env.sh && source xblock-env/bin/activate && python xblock-sdk/manage.py runserver 

# Run the frontend Rollup build in another terminal if you want to update the static files:

# cd drawing-xblock-react/drawing/frontend/ && npm install --legacy-peer-deps && npm run build && npm run watch
cd diagram-xblock/diagram/frontend/ && npm install --legacy-peer-deps && npm run build && npm run watch

## stage the changed files (prefer explicit path rather than `.`)
## update first the version in __init__.py and in the setup.py 
git add .

git commit -m "Bump to V1.0.6"  && git tag -a V1.0.6 -m "Release V1.0.6"  && git push origin main --follow-tags


# then in openedx tutor:

tutor config save --append OPENEDX_EXTRA_PIP_REQUIREMENTS="git+https://github.com/aembaye2/xblock_development.git@V0.0.1#subdirectory=drawing-xblock-react"