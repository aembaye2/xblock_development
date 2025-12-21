import {
  Slash,
  Dot,
  Hexagon,
  RectangleHorizontal,
  Circle,
  Pencil,
  Spline,
  ChartSpline,
  MoveUpRight,
  MoveDiagonal,
  Type,
  MousePointer2,
  Triangle,
} from "lucide-react"

//import CoordIcon from "./coordicon.svg" // Import the SVG file as a React component

//import CoordIcon from "./CoordComp" // Import the SVG file as a React component
import coordicon from "./coordicon.png"

export const modes: any = [
  { mode: "point", icon: Dot, description: "Draw a point" },
  { mode: "line", icon: Slash, description: "Draw a line" },
  {mode: "singlearrowhead",
    icon: MoveUpRight,
    description: "Draw a single arrowhead",
  },
  {
    mode: "doublearrowhead",
    icon: MoveDiagonal,
    description: "Draw a double arrowhead",
  },
  { mode: "triangle", icon: Triangle, description: "Draw a triangle" },
  { mode: "polygon", icon: Hexagon, description: "Draw a polygon" },
  { mode: "rect", icon: RectangleHorizontal, description: "Draw a rectangle" },
  { mode: "circle", icon: Circle, description: "Draw a circle" },
  { mode: "freedraw", icon: Pencil, description: "Free draw" },
  {
    mode: "coordinate",
    icon: coordicon, //process.env.PUBLIC_URL + "./coordicon.svg",
    description: "Draw coordinates",
  },
  { mode: "curve", icon: Spline, description: "Draw a curve" },
  { mode: "curve4pts", icon: ChartSpline, description: "Draw a 4 pt curve" },
  { mode: "text", icon: Type, description: "Add text" },
  {
    mode: "transform",
    icon: MousePointer2,
    description: "Select & move shapes",
  },
]

//export default modes
