const BAYER_MATRIX_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
];

const CHECKERBOARD = [
  [0, 1],
  [1, 0]
];

const STRIPES = [
  [0, 1],
  [0, 1]
];

export const getDitherValue = (x, y, mode, amount = 0.5) => {
  if (mode === 'bayer') {
    const threshold = BAYER_MATRIX_4X4[y % 4][x % 4] / 16;
    return threshold < amount; // return true if we should draw the pixel
  } else if (mode === 'random') {
    return Math.random() < amount;
  } else if (mode === 'checker') {
    return CHECKERBOARD[y % 2][x % 2] === 1;
  } else if (mode === 'stripes') {
      return STRIPES[y % 2][x % 2] === 1;
  }
  return true; // no dithering, draw all
};
