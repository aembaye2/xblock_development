# to start the app:
npm run dev

# pushing to github
git add .

git commit -m "committed on 12/20/2025b"

git fetch origin

git push -u origin main




# JSXGraph Drawing App

A Next.js application with TypeScript, Tailwind CSS, shadcn UI, and JSXGraph for interactive geometric drawing. Perfect for embedding in educational platforms like OpenEdX XBlocks.

## Features

- **Interactive Drawing**: Draw points, lines, circles, triangles, and more
- **Configurable UI**: Control which tools and buttons are displayed via props
- **OpenEdX Ready**: Designed for easy integration into XBlocks
- **Initial State Loading**: Load instructor's pre-drawn elements
- **Read-Only Elements**: Prevent students from modifying instructor's drawings
- **State Capture**: Capture and submit student work
- **Automated Grading**: Validate student answers programmatically
- **Mouse Controls**: 
  - Mouse down to start drawing
  - Mouse move to update the shape in real-time
  - Mouse up to finish drawing
- **Undo/Redo**: Full undo/redo stack support
- **Export Options**: Download drawings as PNG or JSON
- **Modern UI**: Built with shadcn UI components and Tailwind CSS
- **TypeScript**: Fully typed for better development experience
- **JSXGraph Integration**: Powerful mathematical visualization library

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn UI** - High-quality React components
- **JSXGraph** - Interactive geometry and plotting library

## Getting Started

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

The `DrawingBoard` component is highly configurable for different use cases, especially for OpenEdX integration.

### Basic Usage

```tsx
<DrawingBoard 
  tools={["point", "segment", "triangle"]}
  buttons={["undo", "redo", "downloadPNG"]}
/>
```

### Props

#### `tools` (optional)
- **Type:** `DrawingMode[] | "all" | "basic" | "geometric" | "arrows" | "minimal"`
- **Default:** `"all"`
- **Available tool IDs:** `"point"`, `"segment"`, `"line"`, `"circle"`, `"rectangle"`, `"triangle"`, `"curve"`, `"arrow"`, `"doubleArrow"`

#### `buttons` (optional)
- **Type:** `ActionButton[]`
- **Default:** `["undo", "redo", "clear", "downloadPNG", "downloadJSON"]`
- **Available button IDs:** `"undo"`, `"redo"`, `"clear"`, `"downloadPNG"`, `"downloadJSON"`, `"submit"`

#### `initialState` (optional)
- **Type:** `BoardState`
- **Default:** `undefined`
- **Description:** Pre-drawn elements (instructor's setup for OpenEdX)

#### `readOnlyInitial` (optional)
- **Type:** `boolean`
- **Default:** `false`
- **Description:** Make initial elements non-modifiable by students

#### `onSubmit` (optional)
- **Type:** `(state: BoardState) => void`
- **Default:** `undefined`
- **Description:** Callback when student clicks submit button

#### `onStateChange` (optional)
- **Type:** `(state: BoardState) => void`
- **Default:** `undefined`
- **Description:** Callback whenever board state changes

### Examples

**Minimal Configuration (OpenEdX XBlock):**
```tsx
<DrawingBoard 
  tools={["point", "segment"]}
  buttons={["undo", "redo"]}
/>
```

**Assessment Mode:**
```tsx
<DrawingBoard 
  tools={["point", "segment", "circle", "triangle"]}
  buttons={["undo", "redo", "downloadPNG"]}
/>
```

**OpenEdX XBlock with Grading:**
```tsx
<DrawingBoard 
  tools={["segment", "point"]}
  buttons={["undo", "redo", "submit"]}
  initialState={instructorDrawing}
  readOnlyInitial={true}
  onSubmit={(state) => {
    // Send to backend for grading
    gradeSubmission(state);
  }}
/>
```

For more examples and detailed documentation, see [OPENEDX_XBLOCK_GUIDE.md](./OPENEDX_XBLOCK_GUIDE.md).

## Live Demos

- `/` - Basic configuration example
- `/examples` - Multiple configuration examples
- `/openedx-demo` - **Full OpenEdX workflow with grading** 🎓
- `/tools-demo` - All available tools showcase

## How to Use

1. **Select a Drawing Mode**: Click on one of the icon buttons:
   - **Minus icon** (─) - Draw straight lines
   - **Slash icon** (/) - Draw line segments  
   - **Square icon** (▢) - Draw rectangles
   - **Circle icon** (○) - Draw circles

2. **Draw a Shape**:
   - Click and hold the mouse button at your starting point
   - Drag the mouse to see the shape update in real-time
   - Release the mouse button to finish drawing

3. **Edit Your Work**:
   - **Undo icon** - Undo the last action
   - **Redo icon** - Redo the last undone action
   - **Trash icon** - Clear all drawings (with confirmation)

4. **Tooltips**: Hover over any button to see its description

5. **Draw Multiple Shapes**: You can draw multiple shapes of different types on the same board

## Project Structure

```
├── app/
│   ├── page.tsx          # Main page component
│   └── globals.css       # Global styles
├── components/
│   ├── DrawingBoard.tsx  # Main drawing component with JSXGraph
│   └── ui/
│       └── button.tsx    # shadcn Button component
├── types/
│   └── jsxgraph.d.ts     # TypeScript definitions for JSXGraph
└── package.json
```

## Customization

- Board size: Edit the width and height in DrawingBoard.tsx
- Colors: Modify the strokeColor and fillColor properties
- Board bounds: Adjust the boundingbox parameter
