// App.js
import React from "react"
//import { HelloWorld } from "@embaye/drawable-canvas"
import "./App.css"
import { DrawingApp } from "./components/canvas/DrawingApp"
import { modes } from "./components/canvas/modesfile"
//import { DrawingApp, modes } from "ae-drawable-canvas" // if this is uncommented, the above two must be commented

const App = () => {
  const currentQuestionIndex = 0
  const quizName = "Drawing"
  const nextButtonClicked = false
  const canvasWidth = 500
  const canvasHeight = 400
  const bgnumber = 1
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "10vh",
        }}
      >
        <h1>Library implementation</h1>
        <div>
          <DrawingApp
            index={currentQuestionIndex}
            AssessName={quizName || ""}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            nextButtonClicked={nextButtonClicked}
            bgnumber={bgnumber}
            modes={modes}
          />
        </div>
      </div>
    </>
  )
}

export default App
