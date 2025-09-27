import FabricTool, { ConfigureCanvasProps } from "./fabrictool"

class FreedrawTool extends FabricTool {
  configureCanvas({
    strokeWidth,
    strokeColor,
  }: ConfigureCanvasProps): () => void {
    this._canvas.isDrawingMode = true
    this._canvas.freeDrawingBrush.width = strokeWidth
    this._canvas.freeDrawingBrush.color = strokeColor

    // Override the type of free-drawn paths to 'freedraw'
    this._canvas.on('path:created', (e: any) => {
      if (e.path) {
        e.path.type = 'freedraw'
      }
    })

    return () => {
      this._canvas.off('path:created')
    }
  }
}

export default FreedrawTool
