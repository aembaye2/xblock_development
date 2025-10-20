

The crucial thing is to send data from the frontend (what the user drew) to the backend (what is to be processed, checked and graded) and then message is sent back to the frontend.

Main part of this is done such as sending the .json drawing to the backend, and then sending only important points about the drawing such as type:text, and the coordinates of the two points if we are talking about "line" drawing

What is left according their importance

1. Build the studioView so that you can edit all the fields (understand the basic xblock-react which has a working editable field and myxblock which has more fields and work well in openedx instance and then you can make the modification for the drawing studioView which is not working) --- > To the most part, the studioview edit is working but is throwing error. When "Save" button, it seems that html is sent instead of json file to the backend; so we need to fix that
   
2. Having now able to process the .json drawing for line drawing, ask possible questions of drawing and have a function that processes different questions of drawing !!! Do this based on the visble coordinates and not pixels
   
3. Test the xblock in openedx instance and if something doesn't work, get browser console errors and feed it to AI (Claude or GitHub Copilot)

Done and can be expanded!!! create many initial drawing .json file from the same canvas and put them in folder and use the as needed

Done !!! Also use props to make drawing tools or other action icons on the canvas visible or not visible. This will help to easily deploy only the necessary tools for each question.

Done!!! Including initial drawing such as intial supply and demand, or consumer optimal point-- this should be in the studentView and studioViews backend as fields

Done!!! Also each drawing tool and hence object must have its .json data reflect unique type, so that you can easily identify it when grading

Done!!! In order not to be changed by the user, the x-y axes coordinates must be introduced as background canvas drawings. However, we have to change the coordinates to many possibilities at will using props for some of the values of the coordinates; the props must be changed at the .py file or the studioview for each question >>> Here we don't really need to change the entire background but the coordinates base on max_lim for x and y coordinates

