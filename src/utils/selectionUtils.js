import { getRectIndices, getLineIndices } from './drawingUtils';
import { getContiguousFillIndices } from './fillUtils';

export const getRectangleSelection = (x0, y0, x1, y1, gridSize) => {
  return getRectIndices(x0, y0, x1, y1, gridSize, true); // true for fill
};

export const getLassoSelection = (points, gridSize) => {
  if (points.length < 3) return [];

  // Get perimeter indices using lines between consecutive points
  const perimeterSet = new Set();
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const lineIndices = getLineIndices(p1.x, p1.y, p2.x, p2.y, gridSize);
    lineIndices.forEach(idx => perimeterSet.add(idx));
  }

  // Scanline fill
  let minY = gridSize, maxY = -1;
  points.forEach(p => {
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  });
  minY = Math.max(0, minY);
  maxY = Math.min(gridSize - 1, maxY);

  const fillIndices = new Set();
  for (let y = minY; y <= maxY; y++) {
    let nodes = [];
    let j = points.length - 1;
    for (let i = 0; i < points.length; i++) {
      let pi = points[i];
      let pj = points[j];
      if ((pi.y < y && pj.y >= y) || (pj.y < y && pi.y >= y)) {
        nodes.push(Math.round(pi.x + (y - pi.y) / (pj.y - pi.y) * (pj.x - pi.x)));
      }
      j = i;
    }
    nodes.sort((a, b) => a - b);
    for (let i = 0; i < nodes.length; i += 2) {
      if (nodes[i] >= gridSize) break;
      if (nodes[i + 1] > 0) {
        if (nodes[i] < 0) nodes[i] = 0;
        if (nodes[i + 1] > gridSize) nodes[i + 1] = gridSize;
        for (let x = nodes[i]; x <= nodes[i + 1]; x++) {
          if (x >= 0 && x < gridSize) fillIndices.add(y * gridSize + x);
        }
      }
    }
  }

  // Combine perimeter and fill
  return Array.from(new Set([...perimeterSet, ...fillIndices]));
};

export const getMagicWandSelection = (startIndex, pixels, tolerance, gridSize) => {
  // Use contiguous fill logic to get selected indices based on tolerance
  const startColor = pixels[startIndex];
  if (startColor === 'transparent' && tolerance === 0) {
      // Small optimization: if clicking transparent with 0 tolerance, just return the contiguous transparent area
      return getContiguousFillIndices(startIndex, pixels, 'transparent', 0, gridSize);
  }

  // Create a dummy target color that is guaranteed to be different
  const dummyTarget = startColor === '#ffffff' ? '#000000' : '#ffffff';
  return getContiguousFillIndices(startIndex, pixels, dummyTarget, tolerance, gridSize);
};
