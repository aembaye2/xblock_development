"""Helper module for processing drawing JSON objects.
Contains functions to extract human-readable summaries for different object types.
"""
from typing import Any, Dict


def summarize_line(obj: Dict[str, Any]) -> str:
    x1 = obj.get('x1')
    y1 = obj.get('y1')
    x2 = obj.get('x2')
    y2 = obj.get('y2')
    return f"Type: line, x1: {x1}, y1: {y1}, x2: {x2}, y2: {y2}"


def summarize_rectangle(obj: Dict[str, Any]) -> str:
    x = obj.get('left') or obj.get('x') or obj.get('x1')
    y = obj.get('top') or obj.get('y') or obj.get('y1')
    width = obj.get('width') or obj.get('w') or obj.get('rx')
    height = obj.get('height') or obj.get('h') or obj.get('ry')
    try:
        right = float(x) + float(width) if x is not None and width is not None else None
    except Exception:
        right = None
    try:
        bottom = float(y) + float(height) if y is not None and height is not None else None
    except Exception:
        bottom = None
    parts = [f"Type: rectangle", f"x: {x}", f"y: {y}", f"width: {width}", f"height: {height}"]
    if right is not None:
        parts.append(f"x2: {right}")
    if bottom is not None:
        parts.append(f"y2: {bottom}")
    return ", ".join(parts)


def process_drawing_json(drawing: Any) -> str:
    """Return a concise summary for the drawing JSON.

    Currently inspects the first object in `drawing['objects']` (if present)
    and returns a text summary. Designed to be extended for more shapes.
    """
    if not drawing:
        return "No drawing data provided."

    if isinstance(drawing, dict) and 'objects' in drawing and isinstance(drawing['objects'], list) and drawing['objects']:
        obj = drawing['objects'][0]
        otype = obj.get('type') or obj.get('objectType') or obj.get('shape')
        if otype == 'line':
            return summarize_line(obj)
        if otype in ('rect', 'rectangle'):
            return summarize_rectangle(obj)
        # For other shapes: return a simple table of key -> value
        lines = [f"shape_type: {otype or 'unknown'}"]
        for k in sorted(obj.keys()):
            try:
                v = obj[k]
                # stringify lists/dicts compactly
                if isinstance(v, (list, dict)):
                    v = str(v)
            except Exception:
                v = '<error>'
            lines.append(f"{k}: {v}")
        return "\n".join(lines)

    # If drawing is a list of objects
    if isinstance(drawing, list) and drawing:
        # Produce a compact table where each object is shown with its index and main keys
        rows = []
        for i, obj in enumerate(drawing):
            otype = obj.get('type', obj.get('shape', 'unknown'))
            # pick a few representative keys
            keys = sorted(k for k in obj.keys() if k in ('type', 'left', 'top', 'width', 'height', 'x1', 'y1', 'x2', 'y2'))
            values = ", ".join(f"{k}={obj.get(k)}" for k in keys)
            rows.append(f"{i}: {otype} - {values}")
        return "\n".join(rows)

    return "No drawable objects found."
