import React, { useEffect, useState } from "react";
import { Button } from "@/canvas/components/ui/button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialBoundingBox: [number, number, number, number];
  initialXLabel: string;
  initialYLabel: string;
  initialTitle?: string;
  initialShowTitle?: boolean;
  onSave: (data: {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    xLabel: string;
    yLabel: string;
    title?: string;
    showTitle?: boolean;
  }) => void;
}

export default function AxisEditorDialog({
  isOpen,
  onClose,
  initialBoundingBox,
  initialXLabel,
  initialYLabel,
  initialTitle = "",
  initialShowTitle = false,
  onSave,
}: Props) {
  const [tab, setTab] = useState<"graph" | "x" | "y">("graph");

  // boundingBox is [left, top, right, bottom]
  const [left, setLeft] = useState<number>(initialBoundingBox[0]);
  const [top, setTop] = useState<number>(initialBoundingBox[1]);
  const [right, setRight] = useState<number>(initialBoundingBox[2]);
  const [bottom, setBottom] = useState<number>(initialBoundingBox[3]);

  const [xLabel, setXLabel] = useState<string>(initialXLabel);
  const [yLabel, setYLabel] = useState<string>(initialYLabel);

  // Dropdown preset handling: label presets and numeric presets
  const labelPresets = ["x", "y", "t", "Time", "Distance", "Custom..."];
  const numberPresets = ["-10", "-5", "0", "5", "10", "20", "Custom..."];

  const [xLabelChoice, setXLabelChoice] = useState<string>(labelPresets.includes(initialXLabel) ? initialXLabel : "Custom...");
  const [yLabelChoice, setYLabelChoice] = useState<string>(labelPresets.includes(initialYLabel) ? initialYLabel : "Custom...");
  const [xLabelCustom, setXLabelCustom] = useState<string>(labelPresets.includes(initialXLabel) ? "" : initialXLabel);
  const [yLabelCustom, setYLabelCustom] = useState<string>(labelPresets.includes(initialYLabel) ? "" : initialYLabel);

  const [xMinChoice, setXMinChoice] = useState<string>(numberPresets.includes(String(left)) ? String(left) : "Custom...");
  const [xMaxChoice, setXMaxChoice] = useState<string>(numberPresets.includes(String(right)) ? String(right) : "Custom...");
  const [yMinChoice, setYMinChoice] = useState<string>(numberPresets.includes(String(bottom)) ? String(bottom) : "Custom...");
  const [yMaxChoice, setYMaxChoice] = useState<string>(numberPresets.includes(String(top)) ? String(top) : "Custom...");
  const [xMinCustom, setXMinCustom] = useState<string>(numberPresets.includes(String(left)) ? "" : String(left));
  const [xMaxCustom, setXMaxCustom] = useState<string>(numberPresets.includes(String(right)) ? "" : String(right));
  const [yMinCustom, setYMinCustom] = useState<string>(numberPresets.includes(String(bottom)) ? "" : String(bottom));
  const [yMaxCustom, setYMaxCustom] = useState<string>(numberPresets.includes(String(top)) ? "" : String(top));

  const [title, setTitle] = useState<string>(initialTitle);
  const [showTitle, setShowTitle] = useState<boolean>(initialShowTitle);

  useEffect(() => {
    setLeft(initialBoundingBox[0]);
    setTop(initialBoundingBox[1]);
    setRight(initialBoundingBox[2]);
    setBottom(initialBoundingBox[3]);
    setXLabel(initialXLabel);
    setYLabel(initialYLabel);
    setTitle(initialTitle);
    setShowTitle(initialShowTitle);
    setXLabelChoice(labelPresets.includes(initialXLabel) ? initialXLabel : "Custom...");
    setYLabelChoice(labelPresets.includes(initialYLabel) ? initialYLabel : "Custom...");
    setXLabelCustom(labelPresets.includes(initialXLabel) ? "" : initialXLabel);
    setYLabelCustom(labelPresets.includes(initialYLabel) ? "" : initialYLabel);

    setXMinChoice(numberPresets.includes(String(initialBoundingBox[0])) ? String(initialBoundingBox[0]) : "Custom...");
    setXMaxChoice(numberPresets.includes(String(initialBoundingBox[2])) ? String(initialBoundingBox[2]) : "Custom...");
    setYMinChoice(numberPresets.includes(String(initialBoundingBox[3])) ? String(initialBoundingBox[3]) : "Custom...");
    setYMaxChoice(numberPresets.includes(String(initialBoundingBox[1])) ? String(initialBoundingBox[1]) : "Custom...");
    setXMinCustom(numberPresets.includes(String(initialBoundingBox[0])) ? "" : String(initialBoundingBox[0]));
    setXMaxCustom(numberPresets.includes(String(initialBoundingBox[2])) ? "" : String(initialBoundingBox[2]));
    setYMinCustom(numberPresets.includes(String(initialBoundingBox[3])) ? "" : String(initialBoundingBox[3]));
    setYMaxCustom(numberPresets.includes(String(initialBoundingBox[1])) ? "" : String(initialBoundingBox[1]));
  }, [initialBoundingBox, initialXLabel, initialYLabel, initialTitle, initialShowTitle]);

  if (!isOpen) return null;

  const handleSave = () => {
    const resolvedXLabel = xLabelChoice === "Custom..." ? xLabelCustom || xLabel : xLabelChoice || xLabel;
    const resolvedYLabel = yLabelChoice === "Custom..." ? yLabelCustom || yLabel : yLabelChoice || yLabel;

    const resolvedXMin = xMinChoice === "Custom..." ? Number(xMinCustom || left) : Number(xMinChoice);
    const resolvedXMax = xMaxChoice === "Custom..." ? Number(xMaxCustom || right) : Number(xMaxChoice);
    const resolvedYMin = yMinChoice === "Custom..." ? Number(yMinCustom || bottom) : Number(yMinChoice);
    const resolvedYMax = yMaxChoice === "Custom..." ? Number(yMaxCustom || top) : Number(yMaxChoice);

    onSave({ xMin: resolvedXMin, xMax: resolvedXMax, yMin: resolvedYMin, yMax: resolvedYMax, xLabel: resolvedXLabel, yLabel: resolvedYLabel, title, showTitle });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg p-4 w-96">
        <h3 className="text-lg font-semibold mb-3">Grapher Options</h3>

        <div className="mb-3">
          <div className="flex gap-2 border-b pb-2">
            <button className={`px-3 py-1 ${tab === 'graph' ? 'border-b-2 border-blue-500' : ''}`} onClick={() => setTab('graph')}>Graph Settings</button>
            <button className={`px-3 py-1 ${tab === 'x' ? 'border-b-2 border-blue-500' : ''}`} onClick={() => setTab('x')}>X-Axis</button>
            <button className={`px-3 py-1 ${tab === 'y' ? 'border-b-2 border-blue-500' : ''}`} onClick={() => setTab('y')}>Y-Axis</button>
          </div>
        </div>

        {tab === 'graph' && (
          <div>
            <label className="text-sm">Title</label>
            <input className="w-full border p-1 rounded-md mb-2" value={title} onChange={(e) => setTitle(e.target.value)} />
            <label className="flex items-center gap-2 text-sm mb-2"><input type="checkbox" checked={showTitle} onChange={(e) => setShowTitle(e.target.checked)} /> Display title below axis</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-sm">X Minimum</label>
              <div>
                <select className="border p-1 rounded-md w-full" value={xMinChoice} onChange={(e) => setXMinChoice(e.target.value)}>
                  {numberPresets.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                {xMinChoice === 'Custom...' && (
                  <input className="border p-1 rounded-md mt-1 w-full" value={xMinCustom} onChange={(e) => setXMinCustom(e.target.value)} />
                )}
              </div>

              <label className="text-sm">X Maximum</label>
              <div>
                <select className="border p-1 rounded-md w-full" value={xMaxChoice} onChange={(e) => setXMaxChoice(e.target.value)}>
                  {numberPresets.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                {xMaxChoice === 'Custom...' && (
                  <input className="border p-1 rounded-md mt-1 w-full" value={xMaxCustom} onChange={(e) => setXMaxCustom(e.target.value)} />
                )}
              </div>

              <label className="text-sm">Y Minimum</label>
              <div>
                <select className="border p-1 rounded-md w-full" value={yMinChoice} onChange={(e) => setYMinChoice(e.target.value)}>
                  {numberPresets.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                {yMinChoice === 'Custom...' && (
                  <input className="border p-1 rounded-md mt-1 w-full" value={yMinCustom} onChange={(e) => setYMinCustom(e.target.value)} />
                )}
              </div>

              <label className="text-sm">Y Maximum</label>
              <div>
                <select className="border p-1 rounded-md w-full" value={yMaxChoice} onChange={(e) => setYMaxChoice(e.target.value)}>
                  {numberPresets.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                {yMaxChoice === 'Custom...' && (
                  <input className="border p-1 rounded-md mt-1 w-full" value={yMaxCustom} onChange={(e) => setYMaxCustom(e.target.value)} />
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'x' && (
          <div>
            <label className="text-sm">Label</label>
            <div className="mb-2">
              <select className="border p-1 rounded-md w-full" value={xLabelChoice} onChange={(e) => setXLabelChoice(e.target.value)}>
                {labelPresets.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              {xLabelChoice === 'Custom...' && (
                <input className="w-full border p-1 rounded-md mt-1" value={xLabelCustom} onChange={(e) => setXLabelCustom(e.target.value)} />
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="text-sm">Minimum</label>
              <div>
                <select className="border p-1 rounded-md w-full" value={xMinChoice} onChange={(e) => setXMinChoice(e.target.value)}>
                  {numberPresets.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                {xMinChoice === 'Custom...' && (
                  <input className="border p-1 rounded-md mt-1 w-full" value={xMinCustom} onChange={(e) => setXMinCustom(e.target.value)} />
                )}
              </div>

              <label className="text-sm">Maximum</label>
              <div>
                <select className="border p-1 rounded-md w-full" value={xMaxChoice} onChange={(e) => setXMaxChoice(e.target.value)}>
                  {numberPresets.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                {xMaxChoice === 'Custom...' && (
                  <input className="border p-1 rounded-md mt-1 w-full" value={xMaxCustom} onChange={(e) => setXMaxCustom(e.target.value)} />
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'y' && (
          <div>
            <label className="text-sm">Label</label>
            <div className="mb-2">
              <select className="border p-1 rounded-md w-full" value={yLabelChoice} onChange={(e) => setYLabelChoice(e.target.value)}>
                {labelPresets.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              {yLabelChoice === 'Custom...' && (
                <input className="w-full border p-1 rounded-md mt-1" value={yLabelCustom} onChange={(e) => setYLabelCustom(e.target.value)} />
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="text-sm">Minimum</label>
              <div>
                <select className="border p-1 rounded-md w-full" value={yMinChoice} onChange={(e) => setYMinChoice(e.target.value)}>
                  {numberPresets.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                {yMinChoice === 'Custom...' && (
                  <input className="border p-1 rounded-md mt-1 w-full" value={yMinCustom} onChange={(e) => setYMinCustom(e.target.value)} />
                )}
              </div>

              <label className="text-sm">Maximum</label>
              <div>
                <select className="border p-1 rounded-md w-full" value={yMaxChoice} onChange={(e) => setYMaxChoice(e.target.value)}>
                  {numberPresets.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                {yMaxChoice === 'Custom...' && (
                  <input className="border p-1 rounded-md mt-1 w-full" value={yMaxCustom} onChange={(e) => setYMaxCustom(e.target.value)} />
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}
