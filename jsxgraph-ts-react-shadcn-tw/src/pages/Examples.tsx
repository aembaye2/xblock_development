import DrawingBoard from "@/components/DrawingBoard";

export default function ExamplesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
      <main className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
            DrawingBoard Configuration Examples
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Different configurations for various use cases
          </p>
        </div>

        <div className="space-y-12">
          {/* Example 1: Minimal OpenEdX Configuration */}
          <section>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              1. Minimal Configuration (OpenEdX XBlock)
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Only essential tools and actions. Perfect for embedded exercises.
            </p>
            <DrawingBoard 
              tools={["point", "segment"]}
              buttons={["undo", "redo"]}
            />
          </section>

          {/* Example 2: Assessment Mode */}
          <section>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              2. Assessment Mode
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              No clear button to prevent accidental deletion during graded work.
            </p>
            <DrawingBoard 
              tools={["point", "segment", "circle", "triangle"]}
              buttons={["undo", "redo", "downloadPNG", "downloadJSON"]}
            />
          </section>

          {/* Example 3: Geometry Class */}
          <section>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              3. Geometry Exercise
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Focus on triangles and circles for geometry lessons.
            </p>
            <DrawingBoard 
              tools={["point", "triangle", "circle"]}
              buttons={["undo", "redo", "clear"]}
            />
          </section>

          {/* Example 4: Full Featured */}
          <section>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              4. Full Featured Mode
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              All tools and buttons available for creative work.
            </p>
            <DrawingBoard 
              tools="all"
              buttons={["undo", "redo", "clear", "downloadPNG", "downloadJSON"]}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
