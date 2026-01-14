# JSXGraph React App

A standalone React application for drawing geometric shapes using JSXGraph, with the ability to export drawings as PNG or JSON.

## Features

- **Interactive Drawing**: Draw points, lines, segments, circles, triangles, arrows, curves, and polygons
- **Undo/Redo**: Full undo/redo functionality for all drawing actions
- **Clear Canvas**: Reset the canvas to start fresh
- **Customizable Axis Names**: Change the x and y axis names in real-time
- **Configurable Axis Ranges**: Set custom min/max values for both axes (default: 0 to 10)
- **Centered Canvas**: Canvas is now centered on the page
- **Export as PNG**: Download your drawing as a high-quality PNG image
- **Export as JSON**: Save your drawing data as JSON for later restoration
- **Clean Interface**: No navigation arrows or copyright notices cluttering the canvas
- **Based on diagram-xblock**: Uses the same proven codebase from the diagram-xblock project

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Fast build tool and dev server
- **JSXGraph** - Interactive geometry and plotting library
- **Tailwind CSS** - Utility-first CSS framework
- **html2canvas** - For PNG export functionality

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will open automatically in your browser at `http://localhost:3000`

### Building for Production

Build the app for production:
```bash
npm run build
```

The built files will be in the `dist/` folder, ready to be deployed to any static hosting service.

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

## Deployment

The built application is a static site that can be deployed to:

- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Import the repository or use Vercel CLI
- **GitHub Pages**: Upload the `dist` folder to gh-pages branch
- **Any static hosting**: Upload the `dist` folder contents

## Usage

1. **Select a Tool**: Click on any drawing tool from the toolbar at the top
2. **Draw**: Click and drag on the canvas to create shapes
3. **Undo/Redo**: Use the undo/redo buttons to modify your drawing
4. **Clear**: Click the clear button to reset the canvas
5. **Export**: 
   - Click "PNG" to download your drawing as an image
   - Click "JSON" to save the drawing data for later use

## Project Structure

```
jsxgraph-react-app/
├── src/
│   ├── canvas/           # Canvas components from diagram-xblock
│   │   ├── components/   # DrawingBoard and DrawingToolbar
│   │   ├── libs/         # Drawing modes and tools
│   │   ├── data/         # Default configurations
│   │   └── types/        # TypeScript type definitions
│   ├── styles/           # Tailwind CSS styles
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── package.json          # Dependencies and scripts
```

## Configuration

You can customize the drawing tools and buttons in `App.tsx`:

```tsx
<DrawingBoard
  tools={['point', 'segment', 'circle', 'triangle']} // Choose which tools to show
  buttons={['undo', 'redo', 'clear', 'downloadPNG', 'downloadJSON']} // Choose which buttons
  boardPixelSize={[700, 600]} // Canvas size [width, height]
  xAxisLabel="time" // Custom x-axis name (default: 'x')
  yAxisLabel="position" // Custom y-axis name (default: 'y')
  boundingBox={[0, 10, 10, 0]} // Axis ranges [left, top, right, bottom] (default: [0, 10, 10, 0])
/>
```

### Available Props

- **tools**: Array of tool IDs or predefined set name
- **buttons**: Array of button IDs to display
- **boardPixelSize**: Canvas dimensions [width, height] in pixels
- **xAxisLabel**: Name for the x-axis (default: 'x')
- **yAxisLabel**: Name for the y-axis (default: 'y')
- **boundingBox**: Axis ranges [left, top, right, bottom] (default: [0, 10, 10, 0])
- **initialState**: Initial board state to load
- **readOnlyInitial**: Make initial elements non-editable
- **onDownloadPNG**: Callback when PNG is downloaded
- **onDownloadJSON**: Callback when JSON is downloaded
- **onSubmit**: Callback when submit button is clicked

This project is based on the diagram-xblock project.

## Credits

Built from the diagram-xblock frontend codebase, adapted for standalone use.
