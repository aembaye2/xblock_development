import DrawingBoard from "@/components/DrawingBoard";

export default function ToolsDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
      <main className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
            Drawing Tools Configuration Examples
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Different tool configurations for different use cases
          </p>
        </div>
        
        <div className="space-y-12">
          {/* Basic Tools */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
              Basic Tools
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Simple shapes - great for beginners
            </p>
            <DrawingBoard tools="basic" />
          </section>

          {/* Geometric Tools */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
              Geometric Shapes
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              All basic geometric shapes
            </p>
            <DrawingBoard tools="geometric" />
          </section>

          {/* Arrows Only */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
              Arrows & Lines
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Perfect for diagrams and flowcharts
            </p>
            <DrawingBoard tools="arrows" />
          </section>

          {/* Custom Selection */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
              Custom: Curves Only
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Just points and curves for artistic drawing
            </p>
            <DrawingBoard tools={["point", "curve"]} />
          </section>

          {/* All Tools */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
              All Tools
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Everything available
            </p>
            <DrawingBoard tools="all" />
          </section>
        </div>
      </main>
    </div>
  );
}
