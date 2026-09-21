export interface WindowGeometry {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WorkspaceSize {
  w: number;
  h: number;
}

export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

export function fitWindow(rect: WindowGeometry, bounds: WorkspaceSize, minWidth = 320, minHeight = 220): WindowGeometry {
  const w = clamp(rect.w, Math.min(minWidth, bounds.w), bounds.w);
  const h = clamp(rect.h, Math.min(minHeight, bounds.h), bounds.h);
  return { w, h, x: clamp(rect.x, 0, bounds.w - w), y: clamp(rect.y, 0, bounds.h - h) };
}

export function resizeWindow(
  rect: WindowGeometry,
  direction: ResizeDirection,
  dx: number,
  dy: number,
  bounds: WorkspaceSize,
  minWidth = 320,
  minHeight = 220,
  aspectRatio?: number,
): WindowGeometry {
  if (aspectRatio && direction.length === 2) {
    const growsX = direction.includes('e') ? dx : -dx;
    const growsY = direction.includes('s') ? dy : -dy;
    const heightDelta = (growsX * aspectRatio + growsY) / (aspectRatio ** 2 + 1);
    const right = rect.x + rect.w;
    const bottom = rect.y + rect.h;
    const maxWidth = direction.includes('e') ? bounds.w - rect.x : right;
    const maxHeight = direction.includes('s') ? bounds.h - rect.y : bottom;
    const largestHeight = Math.min(maxHeight, maxWidth / aspectRatio);
    const smallestHeight = Math.min(Math.max(minHeight, minWidth / aspectRatio), largestHeight);
    const h = clamp(rect.h + heightDelta, smallestHeight, largestHeight);
    const w = h * aspectRatio;
    return {
      x: direction.includes('w') ? right - w : rect.x,
      y: direction.includes('n') ? bottom - h : rect.y,
      w,
      h,
    };
  }

  let { x, y, w, h } = rect;
  const minimumW = Math.min(minWidth, bounds.w);
  const minimumH = Math.min(minHeight, bounds.h);

  if (direction.includes('e')) w = clamp(rect.w + dx, minimumW, bounds.w - x);
  if (direction.includes('s')) h = clamp(rect.h + dy, minimumH, bounds.h - y);
  if (direction.includes('w')) {
    x = clamp(rect.x + dx, 0, rect.x + rect.w - minimumW);
    w = rect.x + rect.w - x;
  }
  if (direction.includes('n')) {
    y = clamp(rect.y + dy, 0, rect.y + rect.h - minimumH);
    h = rect.y + rect.h - y;
  }
  return { x, y, w, h };
}
