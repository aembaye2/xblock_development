import { fabric } from "fabric"
import FabricTool, { ConfigureCanvasProps } from "./fabrictool"

class TriangleTool extends FabricTool {
  // State
  fillColor: string = ""
  strokeWidth: number = 1
  strokeColor: string = "#ffffff"
  startCircle: fabric.Circle | null = null
  points: Array<{ x: number; y: number }> = []
  currentLine: fabric.Line | null = null
  currentTriangle: fabric.Polygon | null = null

  configureCanvas({
    strokeWidth,
    strokeColor,
    fillColor,
  }: ConfigureCanvasProps): () => void {
    this._canvas.isDrawingMode = false
    this._canvas.selection = false
    this._canvas.forEachObject((o) => (o.selectable = (o.evented = false)))

    this.strokeWidth = strokeWidth
    this.strokeColor = strokeColor
    this.fillColor = fillColor

    this._canvas.on("mouse:down", (e: any) => this.onMouseDown(e))
    this._canvas.on("mouse:move", (e: any) => this.onMouseMove(e))
    this._canvas.on("mouse:up", (e: any) => this.onMouseUp(e))
    this._canvas.on("mouse:out", (e: any) => this.onMouseOut(e))
    this._canvas.on("mouse:dblclick", (e: any) => this.onMouseDoubleClick(e))
    return () => {
      this._canvas.off("mouse:down")
      this._canvas.off("mouse:move")
      this._canvas.off("mouse:up")
      this._canvas.off("mouse:out")
      this._canvas.off("mouse:dblclick")
    }
  }

  onMouseDown(o: any) {
    const canvas = this._canvas
    const button = o.e["button"]
    if (button !== 0) return // only handle left-clicks

    const pointer = canvas.getPointer(o.e)

    // First click: set first vertex
    if (this.points.length === 0) {
      this.points.push({ x: pointer.x, y: pointer.y })
      this.startCircle = new fabric.Circle({
        left: pointer.x,
        top: pointer.y,
        originX: "center",
        originY: "center",
        strokeWidth: this.strokeWidth,
        stroke: this.strokeColor,
        fill: this.strokeColor,
        selectable: false,
        evented: false,
        radius: Math.max(2, this.strokeWidth),
      })
      canvas.add(this.startCircle)

      // preview line from first point to cursor
      const pts = [pointer.x, pointer.y, pointer.x, pointer.y]
      this.currentLine = new fabric.Line(pts, {
        strokeWidth: this.strokeWidth,
        fill: this.strokeColor,
        stroke: this.strokeColor,
        originX: "center",
        originY: "center",
        selectable: false,
        evented: false,
      })
      canvas.add(this.currentLine)

      return
    }

    // Second click: set second vertex and start triangle preview
    if (this.points.length === 1) {
      this.points.push({ x: pointer.x, y: pointer.y })
      // remove preview line
      if (this.currentLine) {
        try {
          canvas.remove(this.currentLine)
        } catch (e) {}
        this.currentLine = null
      }

      // create triangle preview using current mouse as third vertex
      const triPoints = [
        { x: this.points[0].x, y: this.points[0].y },
        { x: this.points[1].x, y: this.points[1].y },
        { x: pointer.x, y: pointer.y },
      ]
      this.currentTriangle = new fabric.Polygon(triPoints, {
        strokeWidth: this.strokeWidth,
        fill: this.fillColor,
        stroke: this.strokeColor,
        selectable: false,
        evented: false,
        objectCaching: false,
      })
      canvas.add(this.currentTriangle)
      return
    }

    // Third click: finalize triangle
    if (this.points.length === 2) {
      this.points.push({ x: pointer.x, y: pointer.y })

      // remove preview triangle and start circle
      if (this.currentTriangle) {
        try {
          canvas.remove(this.currentTriangle)
        } catch (e) {}
        this.currentTriangle = null
      }
      if (this.startCircle) {
        try {
          canvas.remove(this.startCircle)
        } catch (e) {}
        this.startCircle = null
      }

      const final = new fabric.Polygon(
        this.points.map((p) => ({ x: p.x, y: p.y })),
        {
          strokeWidth: this.strokeWidth,
          fill: this.fillColor,
          stroke: this.strokeColor,
          selectable: false,
          evented: true,
        }
      )
      canvas.add(final)

      // reset state for next triangle
      this.points = []
      this.currentLine = null
      this.currentTriangle = null
      this.startCircle = null

      return
    }
  }

  onMouseMove(o: any) {
    const canvas = this._canvas
    const pointer = canvas.getPointer(o.e)

    // If we have only the first point, update preview line
    if (this.points.length === 1) {
      if (this.currentLine) {
        this.currentLine.set({ x2: pointer.x, y2: pointer.y })
        this.currentLine.setCoords()
        canvas.renderAll()
      }
      return
    }

    // If we have two fixed points, update the preview triangle using cursor as third
    if (this.points.length === 2) {
      if (this.currentTriangle) {
        const pts = [
          { x: this.points[0].x, y: this.points[0].y },
          { x: this.points[1].x, y: this.points[1].y },
          { x: pointer.x, y: pointer.y },
        ]
        this.currentTriangle.set({ points: pts })
        this.currentTriangle.setCoords()
        canvas.renderAll()
      }
      return
    }
  }

  onMouseUp(o: any) {
    // nothing special on mouse up for click-based triangle creation
  }

  onMouseOut(o: any) {
    // keep state — we want preview to follow cursor while over canvas only
  }
}

export default TriangleTool
