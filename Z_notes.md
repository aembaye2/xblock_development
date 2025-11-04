# Run the Backend
./setup_env.sh && source xblock-env/bin/activate && python xblock-sdk/manage.py runserver 

# Run the frontend Rollup build in another terminal:

cd drawing-xblock-react/drawing/frontend/ && npm install --legacy-peer-deps && && npm run build && npm run watch

## stage the changed files (prefer explicit path rather than `.`)
git add .

git commit -m "Bump drawing-xblock-react to V0.0.4" \
 && git tag -a V0.0.4 -m "Release V0.0.4" \
 && git push origin main --follow-tags


# then in openedx tutor:

tutor config save --append OPENEDX_EXTRA_PIP_REQUIREMENTS="git+https://github.com/aembaye2/xblock_development.git@V0.0.1#subdirectory=drawing-xblock-react"