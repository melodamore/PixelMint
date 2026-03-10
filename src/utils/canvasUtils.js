export const createLayer = (gridSize) => ({
  pixels: Array(gridSize * gridSize).fill('transparent'),
  visible: true
});

export const getSymIndices = (index, size, mode) => {
  const x = index % size;
  const y = Math.floor(index / size);
  const indices = [index];

  if (mode === 'horizontal' || mode === 'both') {
    indices.push(y * size + (size - 1 - x));
  }
  if (mode === 'vertical' || mode === 'both') {
    indices.push((size - 1 - y) * size + x);
  }
  if (mode === 'both') {
    indices.push((size - 1 - y) * size + (size - 1 - x));
  }

  return [...new Set(indices)];
};
