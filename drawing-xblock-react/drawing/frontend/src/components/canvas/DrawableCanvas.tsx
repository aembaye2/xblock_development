//DrawableCanvas.tsx
//"use client";
import React, { useEffect, useRef } from "react"
import { fabric } from "fabric"
import CanvasToolbar from "./CanvasToolbar"
import { useCanvasState } from "./DrawableCanvasState"
import { tools, FabricTool } from "./libs"
// import {
//   downloadCallback,
//   //downloadCallback4Json,
//   //logCanvasData,
// } from "./helpers"
import { customBackground0, customBackground1 } from "./AxesLabels"

const backgroundlist: any = [customBackground0, customBackground1]

export interface ComponentArgs {
  AssessName: string
  index: number
  fillColor: string
  strokeWidth: number
  strokeColor: string
  backgroundColor: string
  backgroundImageURL: string
  canvasWidth: number
  canvasHeight: number
  drawingMode: string
  initialDrawing: Object
  displayToolbar: boolean
  displayRadius: number
  scaleFactors: number[]
  submitButtonClicked: boolean
  bgnumber: number // New prop for selecting the background
  showDownload?: boolean // whether to show the download icon in the toolbar
}

const DrawableCanvas = ({
  AssessName,
  index,
  fillColor,
  strokeWidth,
  strokeColor,
  backgroundImageURL,
  canvasWidth,
  canvasHeight,
  drawingMode,
  initialDrawing,
  displayToolbar,
  displayRadius,
  scaleFactors,
  submitButtonClicked,
  bgnumber, // Consume the bgnumber prop
  showDownload, // optional boolean to show/hide download icon
}: ComponentArgs & { showDownload?: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null)
  const canvasInstance = useRef<fabric.Canvas | null>(null)
  const backgroundCanvasInstance = useRef<fabric.StaticCanvas | null>(null)

  const {
    canvasState: {
      action: { shouldReloadCanvas },
      currentState,
      initialState,
    },
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
    resetState,
  } = useCanvasState()

  const customBackground = backgroundlist[bgnumber] // Select background function based on bgnumber

  useEffect(() => {
    if (canvasRef.current) {
      canvasInstance.current = new fabric.Canvas(canvasRef.current, {
        enableRetinaScaling: false,
      })

      // Load initial drawing only once
      canvasInstance.current.loadFromJSON(initialDrawing, () => {
        canvasInstance.current?.renderAll()
        resetState(initialDrawing)
      })
    }

    if (backgroundCanvasRef.current) {
      backgroundCanvasInstance.current = new fabric.StaticCanvas(
        backgroundCanvasRef.current,
        {
          enableRetinaScaling: false,
        }
      )

      const group = customBackground(canvasWidth, canvasHeight, scaleFactors)

      backgroundCanvasInstance.current.add(group)
      backgroundCanvasInstance.current.renderAll()
    }

    // // Disable context menu on right-click
    const canvasElement = canvasRef.current
    if (canvasElement) {
      canvasElement.addEventListener("contextmenu", (e) => {
        e.preventDefault()
      })
    }

    return () => {
      if (canvasElement) {
        canvasElement.removeEventListener("contextmenu", (e) => {
          e.preventDefault()
        })
      }
      canvasInstance.current?.dispose()
      backgroundCanvasInstance.current?.dispose()
    }
  }, [resetState]) //[resetState])

  useEffect(() => {
    if (backgroundCanvasInstance.current && backgroundImageURL) {
      const bgImage = new Image()
      bgImage.onload = function () {
        backgroundCanvasInstance.current?.getContext().drawImage(bgImage, 0, 0)
      }
      bgImage.src = backgroundImageURL
    }
  }, [backgroundImageURL])

  useEffect(() => {
    if (canvasInstance.current && shouldReloadCanvas) {
      canvasInstance.current.loadFromJSON(currentState, () => {
        canvasInstance.current?.renderAll()
      })
    }
  }, [shouldReloadCanvas, currentState])

  useEffect(() => {
    if (canvasInstance.current) {
      const selectedTool = new tools[drawingMode](
        canvasInstance.current
      ) as FabricTool
      const cleanupToolEvents = selectedTool.configureCanvas({
        fillColor: fillColor,
        strokeWidth: strokeWidth,
        strokeColor: strokeColor,
        displayRadius: displayRadius,
        scaleFactors: scaleFactors,
        canvasHeight: canvasHeight,
        canvasWidth: canvasWidth,
      })

      const handleMouseUp = () => {
        const canvasJSON = canvasInstance.current?.toJSON()
        if (canvasJSON) {
          saveState(canvasJSON)
        }
      }

      canvasInstance.current.on("mouse:up", handleMouseUp)
      canvasInstance.current.on("mouse:dblclick", handleMouseUp)

      return () => {
        cleanupToolEvents()
        canvasInstance.current?.off("mouse:up", handleMouseUp)
        canvasInstance.current?.off("mouse:dblclick", handleMouseUp)
      }
    }
  }, [
    strokeWidth,
    strokeColor,
    displayRadius,
    fillColor,
    drawingMode,
    scaleFactors,
    canvasHeight,
    canvasWidth,
    saveState,
  ])
  ////Load the drawing whenever the `index` and canvasInstance.current changes
  // useEffect(() => {
  //   if (canvasInstance.current) {
  //     const savedDrawing = localStorage.getItem(
  //       `${AssessName}-canvasDrawing-${index}`
  //     )
  //     if (savedDrawing) {
  //       const parsedDrawing = JSON.parse(savedDrawing)
  //       if (canvasRef.current) {
  //         // Clear the canvas before loading the saved drawing
  //         //canvasInstance.current.clear()

  //         // Ensure the canvas is properly loaded from L-Storage.
  //         canvasInstance.current?.loadFromJSON(parsedDrawing, () => {
  //           canvasInstance.current?.renderAll()
  //         })
  //         console.log(
  //           `Canvas data loaded from localStorage for index ${index}:`,
  //           savedDrawing
  //         )
  //       }
  //     }
  //   }
  // }, [canvasInstance.current, index, AssessName]) // Load the drawing whenever the `index` and canvasInstance.current changes

  // Save the current drawing to local-storage when submitButtonClicked becomes true
  useEffect(() => {
  if (!submitButtonClicked) return
    if (!canvasInstance.current) {
  console.warn('DrawableCanvas: submitButtonClicked set but canvasInstance not ready')
      return
    }
    try {
      const canvasData = canvasInstance.current.toJSON()
      if (canvasData) {
        localStorage.setItem(
          `${AssessName}-canvasDrawing-${index}`,
          JSON.stringify(canvasData)
        )
        // small log for debugging
        console.log(
          `Canvas JSON saved to localStorage for ${AssessName}-${index}`
        )
      }
    } catch (err) {
      console.error('Error saving canvas JSON to localStorage', err)
    }
    // no cleanup needed; parent component resets the flag if desired
  }, [submitButtonClicked, index, AssessName])

  const downloadCallback = () => {
    if (canvasInstance.current && backgroundCanvasInstance.current) {
      const tempCanvas = document.createElement("canvas")
      tempCanvas.width = canvasWidth
      tempCanvas.height = canvasHeight
      const tempContext = tempCanvas.getContext("2d")

      if (tempContext) {
        // Draw background canvas onto temp canvas
        if (backgroundCanvasRef.current) {
          tempContext.drawImage(backgroundCanvasRef.current, 0, 0)
        }

        if (canvasRef.current) {
          tempContext.drawImage(canvasRef.current, 0, 0)
        }

        // Export temp canvas as image
        const dataURL = tempCanvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.href = dataURL
        link.download = "canvas.png"
        link.click()
      }
    }
  }

  //These are the items that the user sees
  return (
        <div style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 0,
          backgroundColor: "rgba(248, 243, 243, 0.1)", //"rgba(255, 0, 0, 0.1)",
        }}
      >
        <canvas
          id={`backgroundimage-canvas-${index}`}
          ref={backgroundCanvasRef}
          width={canvasWidth}
          height={canvasHeight}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
          border: "1px solid black",
        }}
      >
        <canvas
          id={`canvas-${index}`}
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="border border-lightgrey"
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        {displayToolbar && (
          <CanvasToolbar
            topPosition={0}
            leftPosition={canvasWidth + 5}
            downloadCallback={downloadCallback}
            //downloadCallback2={downloadCallback4Json}
            //downloadCallback3={logCanvasData}
            //saveCallback={() => {}} //{save2Storage}
            canUndo={canUndo}
            canRedo={canRedo}
            undoCallback={undo}
            redoCallback={redo}
            resetCallback={() => {
              //resetState(initialState);
              const userConfirmed = window.confirm(
                "Are you sure you want to clear the canvas? This action cannot be undone."
              )
              if (userConfirmed) {
                resetState(initialState)
                console.log("Canvas has been reset.");
              } else {
                console.log("Canvas reset canceled.");
              }
            }}
            showDownload={typeof showDownload === 'undefined' ? true : showDownload}
          />
        )}
      </div>     
    </div>
  )
}

export default DrawableCanvas
