export const PRESET_PALETTES = {
  'default': ['#10b981', '#f43f5e', '#3b82f6', '#fbbf24', '#a855f7', '#ffffff', '#000000', 'transparent'],
  'nes': [
    '#7c0800', '#0000bc', '#007400', '#fc9838', '#bcbcfc', '#fcfcfc', '#000000', 'transparent',
    '#000050', '#0018b8', '#5000b8', '#940084', '#a80020', '#a81000', '#881400', '#503000',
    '#007800', '#006800', '#005800', '#004058', '#000000', '#000000', '#000000', '#000000',
    '#bcbcbc', '#0078f8', '#0058f8', '#6844fc', '#d800cc', '#e40058', '#f83800', '#e45c10',
    '#ac7c00', '#00b800', '#00a800', '#00a844', '#008888', '#000000', '#000000', '#000000',
    '#f8f8f8', '#3cbcfc', '#6888fc', '#9878f8', '#f878f8', '#f85898', '#f87858', '#fca044',
    '#f8b800', '#b8f818', '#58d854', '#58f898', '#00e8d8', '#787878', '#000000', '#000000',
    '#fcfcfc', '#a4e4fc', '#b8b8f8', '#d8b8f8', '#f8b8f8', '#f8a4c0', '#f0d0b0', '#fce0a8',
    '#f8d878', '#d8f878', '#b8f8b8', '#b8f8d8', '#00fcfc', '#f8d8f8', '#000000', '#000000'
  ],
  'gameboy': ['#0f380f', '#306230', '#8bac0f', '#9bbc0f', 'transparent'],
  'pico8': [
    '#000000', '#1d2b53', '#7e2553', '#008751', '#ab5236', '#5f574f', '#c2c3c7', '#fff1e8',
    '#ff004d', '#ffa300', '#ffec27', '#00e436', '#29adff', '#83769c', '#ff77a8', '#ffccaa',
    'transparent'
  ]
};

export const getSavedPalettes = () => {
  try {
    const data = localStorage.getItem('pixelmint_palettes');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

export const savePalette = (name, colors) => {
  try {
    const current = getSavedPalettes();
    current[name] = colors;
    localStorage.setItem('pixelmint_palettes', JSON.stringify(current));
    return true;
  } catch {
    return false;
  }
};

export const deletePalette = (name) => {
    try {
        const current = getSavedPalettes();
        delete current[name];
        localStorage.setItem('pixelmint_palettes', JSON.stringify(current));
        return true;
    } catch {
        return false;
    }
}
