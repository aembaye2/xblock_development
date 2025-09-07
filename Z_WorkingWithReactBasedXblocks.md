# Editing the React frontend code
The main file for the XBlock's user interface is react_xblock_2/frontend/src/react_xblock_2.tsx. But in order to edit this file, you will first have to install the required Node packages and start the frontend compiler:

cd xblock-react/react_xblock_2/frontend/
npm install
npm run watch

cd xblock-myxblock-react/myxblock/frontend/
npm install
npm run watch


cd xblock-drawing-react/drawing/frontend/
npm install --legacy-peer-deps
npm run watch

npm install --legacy-peer-deps

# Next step on React/rollup based xblock:
1. polish the xblock-sortable4 xblock so that it is grading correctly and then test it in the VPS
2. Use this xblock as template to work on xblock-drawing

## pushing to repo
git add .
git commit -m "on 9/7/2025 success!"
git push origin main
