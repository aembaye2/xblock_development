import React, { useState } from "react"
import DrawableCanvas, { ComponentArgs } from "./DrawableCanvas"
import DrawingModeSelector from "./DrawingModeSelector"
import { CanvasStateProvider } from "./DrawableCanvasState"

export interface DrawingAppProps {
  AssessName: string
  index: number
  canvasWidth: number
  canvasHeight: number
  nextButtonClicked: boolean
  bgnumber: number // New prop for selecting the background
  modes: { mode: string; icon: React.ElementType; description: string }[] // Add the modes prop
}

export function DrawingApp({
  index,
  AssessName,
  canvasWidth,
  canvasHeight,
  nextButtonClicked,
  bgnumber, // Consume the bgnumber prop
  modes, // Destructure the modes prop
}: DrawingAppProps) {
  const [drawingMode, setDrawingMode] = useState(modes[0].mode) // Use the first mode as the initial state
  const [strokeColor, setStrokeColor] = useState("#000000")
  const [strokeWidth, setStrokeWidth] = useState(2)

  const xlim = 100 // absolute in pixels
  const ylim = 100 // absolute in pixels
  const bottom_margin = 75 // absolute in pixels
  const left_margin = 84
  const top_margin = 25
  const right_margin = 35
  const scaleFactors = [
    xlim,
    ylim,
    bottom_margin,
    left_margin,
    top_margin,
    right_margin,
    
  ]

  const canvasProps: ComponentArgs = {
    AssessName: AssessName,
    index: index,
    fillColor: "transparent",
    strokeWidth: strokeWidth,
    strokeColor: strokeColor,
    backgroundColor: "blue",
    backgroundImageURL: "",
    canvasWidth: canvasWidth,
    canvasHeight: canvasHeight,
    drawingMode: drawingMode,
    initialDrawing: [{}],
    displayToolbar: true,
    displayRadius: 3,
    scaleFactors: scaleFactors,
    nextButtonClicked: nextButtonClicked,
    bgnumber: bgnumber, // Pass the bgnumber prop to DrawableCanvas
  }

  return (
    <>
      <div>
        <CanvasStateProvider>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <DrawingModeSelector
              drawingMode={drawingMode}
              setDrawingMode={setDrawingMode}
              modes={modes} // Pass the modes to the DrawingModeSelector
            />
            <div style={{ marginLeft: "10px" }}>
              <label htmlFor="strokeColor">Stroke Color: </label>
              <input
                type="color"
                id="strokeColor"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
              />
            </div>
            <div style={{ marginLeft: "10px" }}>
              <label htmlFor="strokeWidth">Stroke Width: </label>
              <input
                type="range"
                id="strokeWidth"
                value={strokeWidth}
                min="1"
                max="5"
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                style={{ width: "75px" }}
              />
              <span>{strokeWidth}</span>
            </div>
          </div>
          <DrawableCanvas {...canvasProps} />
        </CanvasStateProvider>
      </div>
    </>
  )
}

//export default DrawingApp
