const hexToRgb = (hex) => {
  if (hex === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  return { r, g, b, a: 255 };
};

const colorDistance = (c1, c2) => {
  if (c1 === c2) return 0;
  if (c1 === 'transparent' || c2 === 'transparent') return 255; // Max distance if one is transparent and other is not
  const rgb1 = hexToRgb(c1);
  const rgb2 = hexToRgb(c2);
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  ) / 441.672; // Normalize by max distance sqrt(255^2 * 3)
};

export const getContiguousFillIndices = (startIndex, pixels, targetColor, tolerance, gridSize) => {
  const startColor = pixels[startIndex];
  if (colorDistance(startColor, targetColor) <= tolerance) return []; // Already filled or within tolerance

  const indices = [];
  const visited = new Set();
  const queue = [startIndex];

  while (queue.length > 0) {
    const curr = queue.shift();
    if (visited.has(curr)) continue;

    visited.add(curr);

    if (colorDistance(pixels[curr], startColor) <= tolerance) {
      indices.push(curr);

      const x = curr % gridSize;
      const y = Math.floor(curr / gridSize);

      if (x > 0) queue.push(curr - 1); // Left
      if (x < gridSize - 1) queue.push(curr + 1); // Right
      if (y > 0) queue.push(curr - gridSize); // Up
      if (y < gridSize - 1) queue.push(curr + gridSize); // Down
    }
  }

  return indices;
};

export const getGlobalFillIndices = (pixels, startColor, tolerance) => {
  const indices = [];
  for (let i = 0; i < pixels.length; i++) {
    if (colorDistance(pixels[i], startColor) <= tolerance) {
      indices.push(i);
    }
  }
  return indices;
};
