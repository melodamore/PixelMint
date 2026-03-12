export const flipHorizontal = (pixels, gridSize) => {
  const newPixels = [...pixels];
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize / 2; x++) {
      const i1 = y * gridSize + x;
      const i2 = y * gridSize + (gridSize - 1 - x);
      const temp = newPixels[i1];
      newPixels[i1] = newPixels[i2];
      newPixels[i2] = temp;
    }
  }
  return newPixels;
};

export const flipVertical = (pixels, gridSize) => {
  const newPixels = [...pixels];
  for (let y = 0; y < gridSize / 2; y++) {
    for (let x = 0; x < gridSize; x++) {
      const i1 = y * gridSize + x;
      const i2 = (gridSize - 1 - y) * gridSize + x;
      const temp = newPixels[i1];
      newPixels[i1] = newPixels[i2];
      newPixels[i2] = temp;
    }
  }
  return newPixels;
};

export const rotate90 = (pixels, gridSize) => {
  const newPixels = Array(gridSize * gridSize).fill('transparent');
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const srcIdx = y * gridSize + x;
      const destIdx = x * gridSize + (gridSize - 1 - y);
      newPixels[destIdx] = pixels[srcIdx];
    }
  }
  return newPixels;
};

export const rotate180 = (pixels, gridSize) => {
  const newPixels = Array(gridSize * gridSize).fill('transparent');
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const srcIdx = y * gridSize + x;
      const destIdx = (gridSize - 1 - y) * gridSize + (gridSize - 1 - x);
      newPixels[destIdx] = pixels[srcIdx];
    }
  }
  return newPixels;
};

export const rotate270 = (pixels, gridSize) => {
  const newPixels = Array(gridSize * gridSize).fill('transparent');
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const srcIdx = y * gridSize + x;
      const destIdx = (gridSize - 1 - x) * gridSize + y;
      newPixels[destIdx] = pixels[srcIdx];
    }
  }
  return newPixels;
};

// Nearest-neighbor scaling, assumes scaleFactor is an integer > 0
export const scalePixelPerfect = (pixels, srcGridSize, scaleFactor) => {
  const newGridSize = srcGridSize * scaleFactor;
  const newPixels = Array(newGridSize * newGridSize).fill('transparent');

  for (let y = 0; y < srcGridSize; y++) {
    for (let x = 0; x < srcGridSize; x++) {
      const color = pixels[y * srcGridSize + x];
      if (color !== 'transparent') {
        // Fill the scaled block
        for (let dy = 0; dy < scaleFactor; dy++) {
          for (let dx = 0; dx < scaleFactor; dx++) {
            const destX = x * scaleFactor + dx;
            const destY = y * scaleFactor + dy;
            newPixels[destY * newGridSize + destX] = color;
          }
        }
      }
    }
  }
  return { newPixels, newGridSize };
};
