import { DrawingModeHandler, DrawingContext } from './types';

// Track active input overlay to ensure only one at a time
let activeInput: HTMLInputElement | null = null;

/**
 * Create a transient input over the board and commit text to JSXGraph when done
 */
function spawnTextInput(x: number, y: number, e: MouseEvent, context: DrawingContext) {
  // Clean up any existing input first
  if (activeInput) {
    activeInput.remove();
    activeInput = null;
  }

  const container = context.board?.containerObj as HTMLElement | undefined;
  if (!container) return;

  // Compute position relative to the board container
  const rect = container.getBoundingClientRect();
  const left = e.clientX - rect.left;
  const top = e.clientY - rect.top;

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Type and hit Enter';
  input.style.position = 'absolute';
  input.style.left = `${left}px`;
  input.style.top = `${top}px`;
  input.style.transform = 'translate(-4px, -60%)';
  input.style.fontSize = '16px';
  input.style.padding = '4px 6px';
  input.style.border = '1px solid #cbd5e1';
  input.style.borderRadius = '6px';
  input.style.boxShadow = '0 2px 6px rgba(0,0,0,0.12)';
  input.style.background = '#fff';
  input.style.zIndex = '1000';
  input.style.pointerEvents = 'auto';
  input.style.width = '160px';

  // Prevent board-level mouse handlers from re-triggering when interacting with the input
  const stopBoardEvents = (ev: Event) => ev.stopPropagation();
  input.addEventListener('mousedown', stopBoardEvents);
  input.addEventListener('click', stopBoardEvents);
  input.addEventListener('dblclick', stopBoardEvents);

  // Ensure container is positioned so absolute children align correctly
  if (!container.style.position || container.style.position === 'static') {
    container.style.position = 'relative';
  }
  container.appendChild(input);
  // Defer focus to ensure the element is attached before focusing
  requestAnimationFrame(() => input.focus());
  activeInput = input;

  const commit = () => {
    const value = input.value?.trim();
    input.remove();
    activeInput = null;
    if (!value) return;

    const textElement = context.board.create('text', [x, y, value], {
      fontSize: 16,
      color: '#1f2937',
      fixed: false, // Allow dragging
      anchorX: 'left',
      anchorY: 'top',
      cssStyle: 'font-family: Arial, sans-serif; font-weight: 500;',
      highlight: true,
      highlightStrokeColor: '#3b82f6',
      highlightStrokeWidth: 2,
    });

    context.undoStackRef.current.push([textElement]);
    context.redoStackRef.current = [];
    context.setVersion((v) => v + 1);
    context.setIsDrawing(false);
    context.setCurrentShape(null);
    context.setStartPoint(null);
  };

  const cancel = () => {
    input.remove();
    activeInput = null;
    context.setIsDrawing(false);
    context.setCurrentShape(null);
    context.setStartPoint(null);
  };

  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      commit();
    } else if (ev.key === 'Escape') {
      ev.preventDefault();
      cancel();
    }
  });

  input.addEventListener('blur', () => {
    // Commit on blur if there is text; otherwise just cancel
    if (input.value.trim()) {
      commit();
    } else {
      cancel();
    }
  });
}

/**
 * Text Drawing Mode Handler
 * Places a transient input at the click position; commits to board on Enter/blur
 */
export const textHandler: DrawingModeHandler = {
  handleMouseDown: (e: MouseEvent, context: DrawingContext) => {
    const coords = context.getMouseCoords(e);
    if (!coords) return;

    const x = coords.usrCoords[1];
    const y = coords.usrCoords[2];

    context.setIsDrawing(true);
    spawnTextInput(x, y, e, context);
  },

  handleMouseMove: () => {
    // No live preview needed for text
  },

  handleMouseUp: () => {
    // Text commit is handled via Enter/blur; nothing on mouse up
  },

  cleanup: (context: DrawingContext) => {
    if (activeInput) {
      activeInput.remove();
      activeInput = null;
    }
    context.setCurrentShape(null);
    context.setIsDrawing(false);
    context.setStartPoint(null);
  },
};
