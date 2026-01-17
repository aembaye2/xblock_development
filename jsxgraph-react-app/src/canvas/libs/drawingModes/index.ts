// Export all drawing mode handlers
export { pointHandler } from './point';
export { segmentHandler } from './segment';
export { arrowHandler } from './arrow';
export { doubleArrowHandler } from './doubleArrow';
export { rectangleHandler } from './rectangle';
export { circleHandler } from './circle';
export { triangleHandler, handleTriangleEscape } from './triangle';
export { curveHandler } from './curve';
export { textHandler } from './text';
export { polygonHandler } from './polygon';
export { selectHandler } from './select';
export { delete2Handler } from './delete2';

// Export types
export type { DrawingMode, Point, DrawingModeHandler, DrawingContext } from './types';

// Export a map of handlers
import { pointHandler } from './point';
import { segmentHandler } from './segment';
import { arrowHandler } from './arrow';
import { doubleArrowHandler } from './doubleArrow';
import { rectangleHandler } from './rectangle';
import { circleHandler } from './circle';
import { triangleHandler } from './triangle';
import { curveHandler } from './curve';
import { textHandler } from './text';
import { polygonHandler } from './polygon';
import { selectHandler } from './select';
import { delete2Handler } from './delete2';
import { DrawingMode, DrawingModeHandler } from './types';

export const drawingModeHandlers: Record<NonNullable<DrawingMode>, DrawingModeHandler> = {
  point: pointHandler,
  segment: segmentHandler,
  arrow: arrowHandler,
  doubleArrow: doubleArrowHandler,
  rectangle: rectangleHandler,
  circle: circleHandler,
  triangle: triangleHandler,
  curve: curveHandler,
  text: textHandler,
  polygon: polygonHandler,
  select: selectHandler,
  delete2: delete2Handler,
};
