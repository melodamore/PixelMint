export const getLineIndices = (x0, y0, x1, y1, gridSize) => {
  const indices = [];
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  let sx = (x0 < x1) ? 1 : -1;
  let sy = (y0 < y1) ? 1 : -1;
  let err = dx - dy;

  while(true) {
    if (x0 >= 0 && x0 < gridSize && y0 >= 0 && y0 < gridSize) {
      indices.push(y0 * gridSize + x0);
    }

    if ((x0 === x1) && (y0 === y1)) break;
    let e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0  += sx; }
    if (e2 < dx) { err += dx; y0  += sy; }
  }
  return indices;
};

export const getRectIndices = (x0, y0, x1, y1, gridSize, fill = false) => {
  const indices = [];
  const minX = Math.min(x0, x1);
  const maxX = Math.max(x0, x1);
  const minY = Math.min(y0, y1);
  const maxY = Math.max(y0, y1);

  if (fill) {
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
          indices.push(y * gridSize + x);
        }
      }
    }
  } else {
    for (let x = minX; x <= maxX; x++) {
      if (x >= 0 && x < gridSize) {
        if (minY >= 0 && minY < gridSize) indices.push(minY * gridSize + x);
        if (maxY >= 0 && maxY < gridSize && minY !== maxY) indices.push(maxY * gridSize + x);
      }
    }
    for (let y = minY + 1; y < maxY; y++) {
      if (y >= 0 && y < gridSize) {
        if (minX >= 0 && minX < gridSize) indices.push(y * gridSize + minX);
        if (maxX >= 0 && maxX < gridSize && minX !== maxX) indices.push(y * gridSize + maxX);
      }
    }
  }
  return indices;
};

export const getCircleIndices = (xc, yc, r, gridSize, fill = false) => {
  const indices = [];

  if (fill) {
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        if (x*x + y*y <= r*r) {
          const cx = xc + x;
          const cy = yc + y;
          if (cx >= 0 && cx < gridSize && cy >= 0 && cy < gridSize) {
            indices.push(cy * gridSize + cx);
          }
        }
      }
    }
    return indices;
  }

  let x = 0;
  let y = r;
  let d = 3 - 2 * r;

  const addSymmetricPoints = (xc, yc, x, y) => {
    const points = [
      [xc + x, yc + y], [xc - x, yc + y], [xc + x, yc - y], [xc - x, yc - y],
      [xc + y, yc + x], [xc - y, yc + x], [xc + y, yc - x], [xc - y, yc - x]
    ];
    points.forEach(([px, py]) => {
      if (px >= 0 && px < gridSize && py >= 0 && py < gridSize) {
        indices.push(py * gridSize + px);
      }
    });
  };

  while (y >= x) {
    addSymmetricPoints(xc, yc, x, y);
    x++;
    if (d > 0) {
      y--;
      d = d + 4 * (x - y) + 10;
    } else {
      d = d + 4 * x + 6;
    }
  }
  return [...new Set(indices)];
};

export const getEllipseIndices = (xc, yc, rx, ry, gridSize, fill = false) => {
  const indices = [];

  if (fill) {
    for (let y = -ry; y <= ry; y++) {
      for (let x = -rx; x <= rx; x++) {
        if ((x*x)/(rx*rx) + (y*y)/(ry*ry) <= 1) {
          const cx = xc + x;
          const cy = yc + y;
          if (cx >= 0 && cx < gridSize && cy >= 0 && cy < gridSize) {
             indices.push(cy * gridSize + cx);
          }
        }
      }
    }
    return indices;
  }

  let dx, dy, d1, d2, x, y;
  x = 0;
  y = ry;

  d1 = (ry * ry) - (rx * rx * ry) + (0.25 * rx * rx);
  dx = 2 * ry * ry * x;
  dy = 2 * rx * rx * y;

  const addSymmetricPoints = (xc, yc, x, y) => {
    const points = [
      [xc + x, yc + y], [xc - x, yc + y], [xc + x, yc - y], [xc - x, yc - y]
    ];
    points.forEach(([px, py]) => {
      if (px >= 0 && px < gridSize && py >= 0 && py < gridSize) {
        indices.push(py * gridSize + px);
      }
    });
  };

  while (dx < dy) {
    addSymmetricPoints(xc, yc, x, y);
    if (d1 < 0) {
      x++;
      dx = dx + (2 * ry * ry);
      d1 = d1 + dx + (ry * ry);
    } else {
      x++;
      y--;
      dx = dx + (2 * ry * ry);
      dy = dy - (2 * rx * rx);
      d1 = d1 + dx - dy + (ry * ry);
    }
  }

  d2 = ((ry * ry) * ((x + 0.5) * (x + 0.5))) + ((rx * rx) * ((y - 1) * (y - 1))) - (rx * rx * ry * ry);

  while (y >= 0) {
    addSymmetricPoints(xc, yc, x, y);
    if (d2 > 0) {
      y--;
      dy = dy - (2 * rx * rx);
      d2 = d2 + (rx * rx) - dy;
    } else {
      y--;
      x++;
      dx = dx + (2 * ry * ry);
      dy = dy - (2 * rx * rx);
      d2 = d2 + dx - dy + (rx * rx);
    }
  }
  return [...new Set(indices)];
};

export const getPolygonIndices = (xc, yc, sides, radius, angleOffset, gridSize, fill = false) => {
  if (sides < 3) return [];
  const vertices = [];
  const angleStep = (2 * Math.PI) / sides;

  for (let i = 0; i < sides; i++) {
    const angle = i * angleStep + angleOffset;
    vertices.push([
      Math.round(xc + radius * Math.cos(angle)),
      Math.round(yc + radius * Math.sin(angle))
    ]);
  }

  if (fill) {
      // Very basic scanline fill for polygon
      let minY = gridSize, maxY = -1;
      for(let [, vy] of vertices) {
          if (vy < minY) minY = vy;
          if (vy > maxY) maxY = vy;
      }
      minY = Math.max(0, minY);
      maxY = Math.min(gridSize - 1, maxY);

      let indices = [];
      for(let y = minY; y <= maxY; y++) {
          let nodes = [];
          let j = sides - 1;
          for(let i = 0; i < sides; i++) {
              let [vxi, vyi] = vertices[i];
              let [vxj, vyj] = vertices[j];
              if ((vyi < y && vyj >= y) || (vyj < y && vyi >= y)) {
                  nodes.push(Math.round(vxi + (y - vyi) / (vyj - vyi) * (vxj - vxi)));
              }
              j = i;
          }
          nodes.sort((a,b) => a - b);
          for(let i=0; i<nodes.length; i+=2) {
              if (nodes[i] >= gridSize) break;
              if (nodes[i+1] > 0) {
                  if(nodes[i] < 0) nodes[i] = 0;
                  if(nodes[i+1] > gridSize) nodes[i+1] = gridSize;
                  for(let x=nodes[i]; x<=nodes[i+1]; x++) {
                      if (x>=0 && x<gridSize) indices.push(y*gridSize + x);
                  }
              }
          }
      }
      return [...new Set(indices)];
  }

  const indices = new Set();
  for (let i = 0; i < sides; i++) {
    const next = (i + 1) % sides;
    const line = getLineIndices(vertices[i][0], vertices[i][1], vertices[next][0], vertices[next][1], gridSize);
    line.forEach(idx => indices.add(idx));
  }
  return Array.from(indices);
};
