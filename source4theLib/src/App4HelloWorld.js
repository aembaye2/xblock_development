// App.js
import React from "react"
import { HelloWorld } from "@embaye/drawable-canvas"
import "./App.css"

function App() {
  return (
    <>
      <div className="App">
        <h1>Library implementation</h1>
        <div>
          <HelloWorld name="Abel !" />
        </div>
      </div>
    </>
  )
}

export default App
