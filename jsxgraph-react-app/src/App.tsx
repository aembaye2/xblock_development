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
            Drawing Canvas for Econ Work
          </h1>
          {downloadMessage && (
            <p className="mt-4 text-green-600 dark:text-green-400 font-medium">
              {downloadMessage}
            </p>
          )}
        </div>

        <div className="max-w-3xl mx-auto mb-8">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
            <div className="flex gap-6 items-end justify-center">
              <div>
                <label htmlFor="xAxis" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 text-center">
                  X-Axis Name
                </label>
                <input
                  id="xAxis"
                  type="text"
                  value={xAxisLabel}
                  onChange={(e) => setXAxisLabel(e.target.value)}
                  className="w-48 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                  placeholder="x"
                />
              </div>
              <div>
                <label htmlFor="yAxis" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 text-center">
                  Y-Axis Name
                </label>
                <input
                  id="yAxis"
                  type="text"
                  value={yAxisLabel}
                  onChange={(e) => setYAxisLabel(e.target.value)}
                  className="w-48 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                  placeholder="y"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mb-8">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
            <div className="flex gap-3 items-end justify-center flex-wrap">
              <div>
                <label htmlFor="minX" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 text-center">
                  Min X
                </label>
                <input
                  id="minX"
                  type="number"
                  value={minX}
                  onChange={(e) => setMinX(Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                />
              </div>
              <div>
                <label htmlFor="maxX" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 text-center">
                  Max X
                </label>
                <input
                  id="maxX"
                  type="number"
                  value={maxX}
                  onChange={(e) => setMaxX(Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                />
              </div>
              <div>
                <label htmlFor="minY" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 text-center">
                  Min Y
                </label>
                <input
                  id="minY"
                  type="number"
                  value={minY}
                  onChange={(e) => setMinY(Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                />
              </div>
              <div>
                <label htmlFor="maxY" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 text-center">
                  Max Y
                </label>
                <input
                  id="maxY"
                  type="number"
                  value={maxY}
                  onChange={(e) => setMaxY(Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto flex justify-center">
          <DrawingBoard
            key={`${minX}-${maxX}-${minY}-${maxY}`}
            tools={['point', 'segment', 'circle', 'triangle', 'arrow', 'curve', 'polygon', 'text', 'rectangle', 'doubleArrow','select', 'delete2']}
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
