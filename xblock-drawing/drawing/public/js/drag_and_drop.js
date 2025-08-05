document.addEventListener("DOMContentLoaded", function() {
    // Drawing Canvas: allow a click, drag and drop for a straight line, send to backend, show feedback
    var canvas = document.getElementById("drawing-canvas");
    if (!canvas) {
        console.error("Canvas with ID 'drawing-canvas' not found.");
        return;
    }
    var ctx = canvas.getContext("2d");
    
    // Line drawing state variables
    var isDrawing = false;
    var startX = 0;
    var startY = 0;
    var currentLine = {
        start: null,
        end: null
    };

    // Ensure the canvas has a size.
    // In a real application, you might set this via CSS or dynamically.
    canvas.width = 600;
    canvas.height = 400;

    // --- Drawing Logic ---
    
    canvas.addEventListener("mousedown", function(e) {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        // Reset the canvas for a new line, if desired.
        // If you want to keep previous lines, remove this.
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        currentLine.start = {x: startX, y: startY};
        currentLine.end = null;
    });

    canvas.addEventListener("mousemove", function(e) {
        if (!isDrawing) return;

        const rect = canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        // Clear the canvas to redraw a new line preview from the start point
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the line being dragged
        drawLine(startX, startY, currentX, currentY);
    });

    canvas.addEventListener("mouseup", function(e) {
        if (!isDrawing) return;
        isDrawing = false;

        const rect = canvas.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;
        
        currentLine.end = {x: endX, y: endY};

        // Redraw the final line
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawLine(startX, startY, endX, endY);
    });
    
    canvas.addEventListener("mouseout", function() {
        // Stop drawing if the mouse leaves the canvas
        isDrawing = false;
    });

    function drawLine(x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = "#1976d2";
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw the start and end points as circles
        ctx.beginPath();
        ctx.arc(x1, y1, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "#1976d2";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x2, y2, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "#1976d2";
        ctx.fill();
    }
    
    // --- Submission and Feedback Logic ---

    document.getElementById("submit-drawing").addEventListener("click", function() {
        if (!currentLine.start || !currentLine.end) {
            setFeedback("Please draw a line before submitting.", false);
            return;
        }

        // Send to backend using XBlock runtime handlerUrl if available
        var payload = {
            start: currentLine.start,
            end: currentLine.end
        };

        // Robustly find the block element for handlerUrl
        var handlerUrl = null;
        var blockElem = null;
        if (window.runtime && window.runtime.handlerUrl) {
            // Try to find the closest parent with data-usage-id
            blockElem = canvas.closest ? canvas.closest('[data-usage-id]') : null;
            if (!blockElem) {
                // Fallback: search the DOM
                var allBlocks = document.querySelectorAll('[data-usage-id]');
                if (allBlocks.length === 1) {
                    blockElem = allBlocks[0];
                } else if (allBlocks.length > 1) {
                    // Try to find the one containing our canvas
                    for (var i = 0; i < allBlocks.length; i++) {
                        if (allBlocks[i].contains(canvas)) {
                            blockElem = allBlocks[i];
                            break;
                        }
                    }
                }
            }
            if (blockElem) {
                handlerUrl = window.runtime.handlerUrl(blockElem, "submit_line");
            }
        }
        if (!handlerUrl) {
            // Fallback: try to guess the block id from the URL
            var blockId = window.location.pathname.split("/").filter(Boolean).pop();
            handlerUrl = "/xblock/handler/block/" + blockId + "/submit_line";
        }

        if (!handlerUrl) {
            setFeedback("Submission failed (no handler URL).", false);
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open("POST", handlerUrl, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    var resp = JSON.parse(xhr.responseText);
                    // Accept both {result: 1/0} and {correct: true/false, feedback: ...}
                    if (resp.result !== undefined) {
                        setFeedback(resp.result === 1 ? "Correct! You drew a positive slope." : "Incorrect. Please try again.", resp.result === 1);
                    } else if (resp.correct !== undefined) {
                        setFeedback(resp.feedback || (resp.correct ? "Correct!" : "Incorrect."), resp.correct);
                    } else {
                        setFeedback("Submission received.", true);
                    }
                } catch (e) {
                    setFeedback("Submission failed (bad response).", false);
                }
            } else {
                setFeedback("Submission failed.", false);
            }
        };
        xhr.onerror = function() {
            setFeedback("Submission failed (network error).", false);
        };
        xhr.send(JSON.stringify(payload));
    });

    function setFeedback(msg, correct) {
        var el = document.getElementById("drawing-feedback");
        if (el) {
            el.textContent = msg;
            el.style.color = correct ? "green" : "red";
        }
    }
});