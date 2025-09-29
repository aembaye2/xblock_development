

The crucial thing is to send data from the frontend (what the user drew) to the backend (what is to be processed, checked and graded) and then message is sent back to the frontend.

Main part of this is done such as sending the .json drawing to the backend, and then sending only important points about the drawing such as type:text, and the coordinates of the two points if we are talking about "line" drawing

What is left according their importance

1. Also use props to make drawing tools or other action icons on the canvas visible or not visible. This will help to easily deploy only the necessary tools for each question.

Done!!! Including initial drawing such as intial supply and demand, or consumer optimal point should be done in the backend

 Partially done !!! Master translating pixel coordinates of the main part of shapes for grading; Done for line successfully and can be extended for other shapes. This will be helpful to manipulate coordinates not interms of pixels but visible coordinates the user can understand.

Done!!! Also each drawing tool and hence object must have its .json data reflect unique type, so that you can easily identify it when grading

Done!!! In order not to be changed by the user, the x-y axes coordinates must be introduced as background canvas drawings. However, we have to change the coordinates to many possibilities at will using props for some of the values of the coordinates; the props must be changed at the starting page of the drawing.tsx file/page and eventually on the .py file or the studioview for each question >>> done!!

