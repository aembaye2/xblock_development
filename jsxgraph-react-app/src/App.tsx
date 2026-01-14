import { useState } from 'react';
import DrawingBoard, { type BoardState } from './canvas/components/DrawingBoard';

function App() {
  const [downloadMessage, setDownloadMessage] = useState<string>('');
  const [xAxisLabel, setXAxisLabel] = useState<string>('x');
  const [yAxisLabel, setYAxisLabel] = useState<string>('y');
  const [minX, setMinX] = useState<number>(-1);
  const [maxX, setMaxX] = useState<number>(10);
  const [minY, setMinY] = useState<number>(-1);
  const [maxY, setMaxY] = useState<number>(10);

  // Default board configuration
  const boardSize: [number, number, number, number] = [minX, maxY, maxX, minY]; // [left, top, right, bottom]
  const boardPixelSize: [number, number] = [700, 600]; // [width, height]

  const initialDrawingState: BoardState = {
    version: '1.0',
    boardSettings: { boundingBox: boardSize },
    objects: []
  };

  const handleDownloadPNG = () => {
    setDownloadMessage('PNG downloaded successfully! ✓');
    setTimeout(() => setDownloadMessage(''), 3000);
  };

  const handleDownloadJSON = () => {
    setDownloadMessage('JSON downloaded successfully! ✓');
    setTimeout(() => setDownloadMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
      <main className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
            JSXGraph Drawing App
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Draw geometric shapes and export as PNG or JSON
          </p>
          {downloadMessage && (
            <p className="mt-4 text-green-600 dark:text-green-400 font-medium">
              {downloadMessage}
            </p>
          )}
        </div>

        <div className="max-w-2xl mx-auto mb-6">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-50">
              Axes Names
            </h2>
            <div className="flex gap-4 items-center justify-center">
              <div className="w-40">
                <label htmlFor="xAxis" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  X-Axis Name
                </label>
                <input
                  id="xAxis"
                  type="text"
                  value={xAxisLabel}
                  onChange={(e) => setXAxisLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="x"
                />
              </div>
              <div className="w-40">
                <label htmlFor="yAxis" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Y-Axis Name
                </label>
                <input
                  id="yAxis"
                  type="text"
                  value={yAxisLabel}
                  onChange={(e) => setYAxisLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="y"
                />
              </div>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              Change the axis names and they will update in real-time
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto mb-6">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-50">
              Axis Ranges
            </h2>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div>
                <label htmlFor="minX" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Min X
                </label>
                <input
                  id="minX"
                  type="number"
                  value={minX}
                  onChange={(e) => setMinX(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="maxX" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Max X
                </label>
                <input
                  id="maxX"
                  type="number"
                  value={maxX}
                  onChange={(e) => setMaxX(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="minY" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Min Y
                </label>
                <input
                  id="minY"
                  type="number"
                  value={minY}
                  onChange={(e) => setMinY(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="maxY" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Max Y
                </label>
                <input
                  id="maxY"
                  type="number"
                  value={maxY}
                  onChange={(e) => setMaxY(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              Set the range for each axis (changes take effect immediately)
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto flex justify-center">
          <DrawingBoard
            key={`${minX}-${maxX}-${minY}-${maxY}`}
            tools={['point', 'segment', 'circle', 'triangle', 'arrow', 'curve', 'polygon', 'text', 'rectangle', 'doubleArrow','select']}
            buttons={['undo', 'redo', 'clear', 'downloadPNG']} //, 'downloadJSON'
            initialState={initialDrawingState}
            readOnlyInitial={false}
            containerId="jxgbox-main"
            boardPixelSize={boardPixelSize}
            boundingBox={boardSize}
            onDownloadPNG={handleDownloadPNG}
            onDownloadJSON={handleDownloadJSON}
            xAxisLabel={xAxisLabel}
            yAxisLabel={yAxisLabel}
          />
        </div>

        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
              Features
            </h2>
            <ul className="space-y-2 text-zinc-700 dark:text-zinc-300">
              <li>• Draw geometric shapes using JSXGraph</li>
              <li>• Undo/Redo functionality</li>
              <li>• Clear canvas to start fresh</li>
              <li>• Export your drawing as PNG image</li>
              <li>• Export your drawing as JSON (for later restoration)</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
