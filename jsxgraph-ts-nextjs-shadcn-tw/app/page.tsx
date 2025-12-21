import DrawingBoard from "@/components/DrawingBoard";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
      <main className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
            Interactive Drawing Board
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Configurable for OpenEdX XBlocks and educational platforms
          </p>
        </div>
        
        {/* All tools are: "point", "segment", "triangle", "circle", "arrow" */}
        {/* All buttons are: "undo", "redo", "clear", "downloadPNG", "downloadJSON" */}
        <DrawingBoard 
          tools={["point", "segment", "triangle","circle", "arrow", "curve"]}
          buttons={["undo", "redo", "clear", "downloadPNG", "downloadJSON" ]}
        />
        
        <div className="text-center mt-8 text-zinc-600 dark:text-zinc-400">
          <p className="text-lg font-semibold mb-4">📚 Explore More:</p>
          <div className="flex justify-center gap-4">
            <a href="/examples" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              View Examples
            </a>
            <a href="/openedx-demo" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold">
              OpenEdX Demo 🎓
            </a>
            <a href="/tools-demo" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
              All Tools
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
