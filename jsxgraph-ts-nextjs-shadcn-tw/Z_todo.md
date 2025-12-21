# To do before we take this to the xblock as a npm library or the react frontend in the xblock
1. Imp: make a field for initial drawing; then direct the user/client to draw new graph or manipulate existing one; capture that someway and grade it 

1. point must include coordinate broken lines

2. curve drawing must update after each point, not after the fourth point is clicked (borrow from the fabric.js)

3. All buttons including redo, undo must be able to be hidden i.e. must be passed as props. Right now only for the drawing tools is done

4. .json drawing representation is not being saved as expected; I don't think there is a use for it as all the objects and coordinates can easily be identified as variables instead of as html objects