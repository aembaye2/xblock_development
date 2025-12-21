"""Helper module for processing diagram JSON objects.
Contains functions to extract human-readable summaries for different object types.
"""
from typing import Any, Dict


def pixel_to_scaled(x: float, y: float, scaleFactors: list, canvasWidth: float, canvasHeight: float) -> tuple:
    """Convert pixel coordinates to scaled coordinates based on labels."""
    xx = ((x - scaleFactors[3]) / (canvasWidth - scaleFactors[3] - scaleFactors[5])) * scaleFactors[0]
    yy = scaleFactors[1] - ((y - scaleFactors[4]) / (canvasHeight - scaleFactors[4] - scaleFactors[2])) * scaleFactors[1]
    return xx, yy


def process_diagram_json(diagram: Any, scaleFactors: list = None, canvasWidth: float = None, canvasHeight: float = None) -> str:
    """Return a summary of the diagram by listing each object with details for lines.

    For lines, includes raw and transformed coordinates; for others, just the type.
    """
    messages = []
    
    objects = []
    if isinstance(diagram, dict) and 'objects' in diagram and isinstance(diagram['objects'], list):
        objects = diagram['objects']
    elif isinstance(diagram, list):
        objects = diagram
    
    for obj in objects:
        otype = obj.get('type') or obj.get('objectType') or obj.get('shape') or 'unknown'
        if otype == 'line':
            x1 = obj.get('x1')+obj.get('left')
            y1 = obj.get('y1')+obj.get('top')
            x2 = obj.get('x2')+obj.get('left')
            y2 = obj.get('y2')+obj.get('top')
            if scaleFactors and canvasWidth and canvasHeight:
                xx1, yy1 = pixel_to_scaled(x1, y1, scaleFactors, canvasWidth, canvasHeight)
                xx2, yy2 = pixel_to_scaled(x2, y2, scaleFactors, canvasWidth, canvasHeight)
                messages.append(f"You drew a line with raw coordinates ({x1:.0f}, {y1:.0f}) to ({x2:.0f}, {y2:.0f}) and transformed coordinates ({xx1:.0f}, {yy1:.0f}) to ({xx2:.0f}, {yy2:.0f})")
            else:
                messages.append(f"You drew a line from ({x1}, {y1}) to ({x2}, {y2})")
        else:
            messages.append(f"You drew: {otype}")
    
    if messages:
        return "\n".join(messages)
    else:
        return "No drawable objects found."
