# Button Visibility Configuration Guide

This guide explains how to control which buttons and tools are displayed in the DrawingBoard component, making it suitable for embedding in OpenEdX XBlocks or other constrained environments.

## Overview

The `DrawingBoard` component supports fine-grained control over which UI elements are displayed through props. You can selectively show or hide:

- **Drawing tools** (point, segment, triangle, circle, etc.)
- **Action buttons** (undo, redo, clear, download PNG, download JSON)

## Basic Usage

```tsx
<DrawingBoard 
  tools={["point", "segment", "triangle"]}
  buttons={["undo", "redo", "downloadPNG"]}
/>
```

## Props Reference

### `tools` (optional)
Controls which drawing tools are displayed.

**Type:** `DrawingMode[] | keyof typeof TOOL_SETS`  
**Default:** `"all"`

**Options:**
- **Array of tool IDs:** `["point", "segment", "circle", "triangle"]`
- **Predefined sets:**
  - `"all"` - All available tools
  - `"basic"` - Basic drawing tools
  - `"geometric"` - Geometric shapes
  - `"arrows"` - Arrow tools
  - `"minimal"` - Minimal set

**Available tool IDs:**
- `"point"` - Draw points
- `"segment"` - Draw line segments
- `"line"` - Draw infinite lines
- `"circle"` - Draw circles
- `"rectangle"` - Draw rectangles
- `"triangle"` - Draw triangles
- `"curve"` - Draw freehand curves
- `"arrow"` - Draw arrows
- `"doubleArrow"` - Draw double-headed arrows

### `buttons` (optional)
Controls which action buttons are displayed.

**Type:** `ActionButton[]`  
**Default:** `["undo", "redo", "clear", "downloadPNG", "downloadJSON"]` (all buttons)

**Available button IDs:**
- `"undo"` - Undo button
- `"redo"` - Redo button
- `"clear"` - Clear All button
- `"downloadPNG"` - Download PNG button
- `"downloadJSON"` - Download JSON button

## Usage Examples

### Example 1: Minimal Configuration (OpenEdX XBlock)
Perfect for an embedded quiz or exercise where you only want students to draw specific shapes without downloading or clearing:

```tsx
<DrawingBoard 
  tools={["point", "segment"]}
  buttons={["undo", "redo"]}
/>
```

### Example 2: Assessment Mode
For graded assignments where students shouldn't be able to clear their work but can download:

```tsx
<DrawingBoard 
  tools={["point", "segment", "circle", "triangle"]}
  buttons={["undo", "redo", "downloadPNG", "downloadJSON"]}
/>
```

### Example 3: Full Featured Mode
For open-ended creative work with all features:

```tsx
<DrawingBoard 
  tools="all"
  buttons={["undo", "redo", "clear", "downloadPNG", "downloadJSON"]}
/>
```

### Example 4: View-Only Tools
For demonstrations where you want to show possibilities but limit actions:

```tsx
<DrawingBoard 
  tools={["point", "segment", "circle"]}
  buttons={["downloadPNG"]}
/>
```

### Example 5: Geometry Exercise
For a geometry class focusing on triangles and circles:

```tsx
<DrawingBoard 
  tools={["point", "triangle", "circle"]}
  buttons={["undo", "redo", "clear"]}
/>
```

### Example 6: Technical Drawing
For technical exercises with precise shapes:

```tsx
<DrawingBoard 
  tools={["point", "segment", "rectangle", "circle"]}
  buttons={["undo", "redo", "clear", "downloadPNG", "downloadJSON"]}
/>
```

## Default Behavior

If you don't specify any props, the component defaults to showing all tools and all buttons:

```tsx
<DrawingBoard />
```

This is equivalent to:

```tsx
<DrawingBoard 
  tools="all"
  buttons={["undo", "redo", "clear", "downloadPNG", "downloadJSON"]}
/>
```

## OpenEdX XBlock Integration

When integrating into an OpenEdX XBlock, you can control the UI through XBlock settings:

### Python XBlock Example

```python
class DrawingBoardXBlock(XBlock):
    tools = List(
        default=["point", "segment", "triangle"],
        scope=Scope.settings,
        help="List of drawing tools to display"
    )
    
    buttons = List(
        default=["undo", "redo", "downloadPNG"],
        scope=Scope.settings,
        help="List of action buttons to display"
    )
    
    def student_view(self, context=None):
        html = self.render_template('static/html/drawingboard.html', {
            'tools': json.dumps(self.tools),
            'buttons': json.dumps(self.buttons),
        })
        return Fragment(html)
```

### HTML Template Example

```html
<div id="drawing-board-container">
  <DrawingBoard 
    tools={{{tools}}}
    buttons={{{buttons}}}
  />
</div>
```

## Benefits for OpenEdX Integration

1. **Reduced Visual Clutter:** Only show buttons relevant to the exercise
2. **Prevent Cheating:** Hide clear button in assessments
3. **Guided Learning:** Limit tools to those being taught
4. **Customizable Experience:** Adapt the interface to different course levels
5. **Better Mobile Experience:** Fewer buttons mean better mobile UI

## TypeScript Support

All props are fully typed with TypeScript for IDE autocomplete and type checking:

```typescript
type ActionButton = "undo" | "redo" | "clear" | "downloadPNG" | "downloadJSON";

interface DrawingBoardProps {
  tools?: DrawingMode[] | keyof typeof TOOL_SETS;
  buttons?: ActionButton[];
}
```
