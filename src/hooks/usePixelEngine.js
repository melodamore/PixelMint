import { useState, useEffect, useRef, useCallback } from 'react';
import { createLayer, getSymIndices } from '../utils/canvasUtils';
import { getLineIndices, getRectIndices, getCircleIndices, getEllipseIndices, getPolygonIndices } from '../utils/drawingUtils';
import { getContiguousFillIndices, getGlobalFillIndices } from '../utils/fillUtils';
import { getDitherValue } from '../utils/ditherUtils';
import { getRectangleSelection, getLassoSelection, getMagicWandSelection } from '../utils/selectionUtils';
import { flipHorizontal, flipVertical, rotate90, rotate180, rotate270 } from '../utils/transformUtils';

export const usePixelEngine = () => {
  const [gridSize, setGridSize] = useState(16);
  const [color, setColor] = useState('#10b981');
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  // Menus
  const [activeMenu, setActiveMenu] = useState(null); // 'grid', 'sym', 'toolOptions', 'palette', null
  const [showLayers, setShowLayers] = useState(false);
  const [dangerAction, setDangerAction] = useState(null); // { type, payload }

  // Modes & Tools
  const [symmetry, setSymmetry] = useState('none'); // none, horizontal, vertical, both
  const [isAnimMode, setIsAnimMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Advanced Tools
  const [activeTool, setActiveTool] = useState('pencil'); // pencil, eraser, fill, line, rect, circle, ellipse, polygon, select_rect, select_lasso, select_wand, move
  const [toolOptions, setToolOptions] = useState({
    fillMode: 'contiguous', // contiguous, global
    fillTolerance: 0,
    ditherMode: 'none', // none, bayer, random, checker, stripes
    ditherAmount: 0.5,
    shapeFill: false,
    polygonSides: 5,
    polygonAngle: 0
  });
  const [selectionMask, setSelectionMask] = useState([]); // Array of indices currently selected
  const [clipboard, setClipboard] = useState(null); // { width, height, pixels }
  const [draftLayer, setDraftLayer] = useState(null); // Used for previewing shapes/selections. { pixels: array }

  const [dragStartPos, setDragStartPos] = useState(null); // { x, y } in grid coords
  const [dragCurrentPos, setDragCurrentPos] = useState(null); // { x, y } in grid coords
  const [lassoPoints, setLassoPoints] = useState([]); // Array of {x, y} for lasso selection

  // Data Engine: frames[f].layers[l] = { pixels, visible }
  const [frames, setFrames] = useState([ { layers: [createLayer(16)] } ]);
  const [currF, setCurrF] = useState(0);
  const [currL, setCurrL] = useState(0);
  const [history, setHistory] = useState([]);

  // Zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const lastTouch = useRef(null);

  // Refs for optimized drawing
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(isDrawing);
  const isPlayingRef = useRef(isPlaying);

  // Keep refs in sync
  useEffect(() => { isDrawingRef.current = isDrawing; }, [isDrawing]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  // Auto-Save / Recovery
  useEffect(() => {
    try {
      const savedProject = localStorage.getItem('pixelmint_autosave');
      if (savedProject) {
        const parsed = JSON.parse(savedProject);
        if (parsed.frames && parsed.gridSize) {
          // Setting state in initial useEffect to load saved data is an established pattern,
          // though modern react recommends different approaches, this is fine for this app.
          setTimeout(() => {
             setFrames(parsed.frames);
             setGridSize(parsed.gridSize);
          }, 0);
        }
      }
    } catch (e) {
      console.warn("Failed to load auto-save", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('pixelmint_autosave', JSON.stringify({ frames, gridSize }));
    } catch (e) {
      console.warn("Failed to save auto-save", e);
    }
  }, [frames, gridSize]);

  // Animation Loop
  useEffect(() => {
    let interval;
    if (isPlaying && isAnimMode) {
      interval = setInterval(() => setCurrF(f => (f + 1) % frames.length), 200); // 5fps
    }
    return () => clearInterval(interval);
  }, [isPlaying, isAnimMode, frames.length]);

  const saveState = useCallback(() => {
    setHistory(prev => [...prev, JSON.stringify(frames)].slice(-10));
  }, [frames]);

  const applyGridSize = useCallback((size) => {
    setGridSize(size);
    setFrames([{ layers: [createLayer(size)] }]);
    setCurrF(0);
    setCurrL(0);
    setHistory([]);
    setZoom(1);
    setPan({x:0, y:0});
    setDangerAction(null);
    setActiveMenu(null);
  }, []);

  const activeToolRef = useRef(activeTool);
  useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);

  const commitDraft = useCallback(() => {
    if (!draftLayer) return;
    setFrames(prev => {
      const currentFrame = prev[currF];
      const targetLayer = currentFrame.layers[currL];
      if (!targetLayer.visible) return prev;

      const newPixels = [...targetLayer.pixels];
      draftLayer.pixels.forEach((c, idx) => {
        if (c !== 'transparent') newPixels[idx] = c;
      });

      const newLayers = [...currentFrame.layers];
      newLayers[currL] = { ...targetLayer, pixels: newPixels };

      const newFrames = [...prev];
      newFrames[currF] = { ...currentFrame, layers: newLayers };
      return newFrames;
    });
    setDraftLayer(null);
  }, [draftLayer, currF, currL]);

  const paintPixel = useCallback((index) => {
    if (!isDrawingRef.current || isPlayingRef.current) return;

    const tool = activeToolRef.current;

    // Non-dragging tools logic
    if (['fill', 'select_wand'].includes(tool)) {
        if (!isDrawingRef.current) return; // Only trigger once on mouse down
        setFrames(prev => {
            const currentFrame = prev[currF];
            const targetLayer = currentFrame.layers[currL];
            if (!targetLayer.visible) return prev;

            let indicesToAffect = [];

            if (tool === 'fill') {
                 if (toolOptions.fillMode === 'global') {
                     indicesToAffect = getGlobalFillIndices(targetLayer.pixels, targetLayer.pixels[index], toolOptions.fillTolerance);
                 } else {
                     indicesToAffect = getContiguousFillIndices(index, targetLayer.pixels, color, toolOptions.fillTolerance, gridSize);
                 }

                 if(indicesToAffect.length === 0) return prev;
                 const newPixels = [...targetLayer.pixels];
                 indicesToAffect.forEach(idx => {
                     const x = idx % gridSize;
                     const y = Math.floor(idx / gridSize);
                     if(getDitherValue(x, y, toolOptions.ditherMode, toolOptions.ditherAmount)) {
                        newPixels[idx] = color;
                     }
                 });
                 const newLayers = [...currentFrame.layers];
                 newLayers[currL] = { ...targetLayer, pixels: newPixels };
                 const newFrames = [...prev];
                 newFrames[currF] = { ...currentFrame, layers: newLayers };
                 return newFrames;
            } else if (tool === 'select_wand') {
                 indicesToAffect = getMagicWandSelection(index, targetLayer.pixels, toolOptions.fillTolerance, gridSize);
                 // Selection changes shouldn't trigger history save automatically here, usually handled separately,
                 // but for simplicity we'll just update state
                 setTimeout(() => setSelectionMask(indicesToAffect), 0);
                 return prev;
            }
            return prev;
        });
        setIsDrawing(false); // Stop "drawing" immediately for click tools
        return;
    }

    if (!['pencil', 'eraser'].includes(tool)) return; // Other tools handled in move/up

    setFrames(prev => {
      // Shallow copy optimization
      const currentFrame = prev[currF];
      const targetLayer = currentFrame.layers[currL];

      if (!targetLayer.visible) return prev;

      const indicesToPaint = getSymIndices(index, gridSize, symmetry);
      const paintColor = tool === 'eraser' ? 'transparent' : color;

      // Check if we actually need to paint
      const needsPainting = indicesToPaint.some(idx => targetLayer.pixels[idx] !== paintColor);
      if (!needsPainting) return prev;

      const newPixels = [...targetLayer.pixels];
      indicesToPaint.forEach(idx => {
        const x = idx % gridSize;
        const y = Math.floor(idx / gridSize);
        if(tool === 'eraser' || getDitherValue(x, y, toolOptions.ditherMode, toolOptions.ditherAmount)) {
             newPixels[idx] = paintColor;
        }
      });

      const newLayers = [...currentFrame.layers];
      newLayers[currL] = { ...targetLayer, pixels: newPixels };

      const newFrames = [...prev];
      newFrames[currF] = { ...currentFrame, layers: newLayers };

      return newFrames;
    });
  }, [currF, currL, color, gridSize, symmetry, toolOptions]);

  const updateDraftShape = useCallback((startPos, currentPos) => {
       const tool = activeToolRef.current;
       let indices = [];
       if(tool === 'line') {
           indices = getLineIndices(startPos.x, startPos.y, currentPos.x, currentPos.y, gridSize);
       } else if (tool === 'rect' || tool === 'select_rect') {
           indices = getRectIndices(startPos.x, startPos.y, currentPos.x, currentPos.y, gridSize, toolOptions.shapeFill || tool === 'select_rect');
       } else if (tool === 'circle') {
           const r = Math.round(Math.hypot(currentPos.x - startPos.x, currentPos.y - startPos.y));
           indices = getCircleIndices(startPos.x, startPos.y, r, gridSize, toolOptions.shapeFill);
       } else if (tool === 'ellipse') {
           const rx = Math.abs(currentPos.x - startPos.x);
           const ry = Math.abs(currentPos.y - startPos.y);
           indices = getEllipseIndices(startPos.x, startPos.y, rx, ry, gridSize, toolOptions.shapeFill);
       } else if (tool === 'polygon') {
           const r = Math.round(Math.hypot(currentPos.x - startPos.x, currentPos.y - startPos.y));
           indices = getPolygonIndices(startPos.x, startPos.y, toolOptions.polygonSides, r, toolOptions.polygonAngle, gridSize, toolOptions.shapeFill);
       } else if (tool === 'select_lasso') {
           // lasso updates draft live just for visual feedback of the line
           const pts = lassoPoints;
           if(pts.length > 0) {
              const last = pts[pts.length-1];
              indices = getLineIndices(last.x, last.y, currentPos.x, currentPos.y, gridSize);
           }
       }

       if (tool.startsWith('select_')) {
           // Selection preview
           if (tool === 'select_lasso') {
                // Just add to a local set for visual preview, full shape calculated on end
                setDraftLayer(prev => {
                    const newDraft = prev ? [...prev.pixels] : Array(gridSize*gridSize).fill('transparent');
                    indices.forEach(idx => {
                         if(idx >= 0 && idx < gridSize*gridSize) newDraft[idx] = 'rgba(255,255,255,0.5)';
                    });
                    return { pixels: newDraft };
                });
           } else {
               const draftPixels = Array(gridSize * gridSize).fill('transparent');
               indices.forEach(idx => {
                  if(idx >= 0 && idx < gridSize*gridSize) draftPixels[idx] = 'rgba(255,255,255,0.5)';
               });
               setDraftLayer({ pixels: draftPixels });
           }
       } else {
           // Shape preview
           const draftPixels = Array(gridSize * gridSize).fill('transparent');
           let finalIndices = [];
           indices.forEach(idx => {
               const sym = getSymIndices(idx, gridSize, symmetry);
               sym.forEach(sIdx => finalIndices.push(sIdx));
           });

           finalIndices.forEach(idx => {
               if(idx >= 0 && idx < gridSize*gridSize) {
                   const x = idx % gridSize;
                   const y = Math.floor(idx / gridSize);
                   if(getDitherValue(x, y, toolOptions.ditherMode, toolOptions.ditherAmount)) {
                        draftPixels[idx] = color;
                   }
               }
           });
           setDraftLayer({ pixels: draftPixels });
       }
  }, [gridSize, symmetry, color, toolOptions, lassoPoints]);

  const startInteraction = useCallback((clientX, clientY) => {
      if(isPlayingRef.current) return;
      saveState();
      setIsDrawing(true);

      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (clientX - rect.left - rect.width / 2 - pan.x * zoom) / zoom + rect.width / 2;
        const y = (clientY - rect.top - rect.height / 2 - pan.y * zoom) / zoom + rect.height / 2;

        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
          const col = Math.floor((x / rect.width) * gridSize);
          const row = Math.floor((y / rect.height) * gridSize);
          const idx = row * gridSize + col;

          const tool = activeToolRef.current;

          if (['line', 'rect', 'circle', 'ellipse', 'polygon', 'select_rect'].includes(tool)) {
              setDragStartPos({x: col, y: row});
              setDragCurrentPos({x: col, y: row});
              updateDraftShape({x: col, y: row}, {x: col, y: row});
          } else if (tool === 'select_lasso') {
              setLassoPoints([{x: col, y: row}]);
              setDraftLayer({ pixels: Array(gridSize*gridSize).fill('transparent') });
          } else if (idx >= 0 && idx < gridSize * gridSize) {
              paintPixel(idx);
          }
        }
      }
  }, [saveState, zoom, pan, gridSize, paintPixel, updateDraftShape]);

  const moveInteraction = useCallback((clientX, clientY) => {
      if (!isDrawingRef.current) return;

      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (clientX - rect.left - rect.width / 2 - pan.x * zoom) / zoom + rect.width / 2;
        const y = (clientY - rect.top - rect.height / 2 - pan.y * zoom) / zoom + rect.height / 2;

        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
          const col = Math.floor((x / rect.width) * gridSize);
          const row = Math.floor((y / rect.height) * gridSize);
          const idx = row * gridSize + col;

          const tool = activeToolRef.current;

          if (['line', 'rect', 'circle', 'ellipse', 'polygon', 'select_rect'].includes(tool)) {
              if (dragStartPos && (dragCurrentPos?.x !== col || dragCurrentPos?.y !== row)) {
                  setDragCurrentPos({x: col, y: row});
                  updateDraftShape(dragStartPos, {x: col, y: row});
              }
          } else if (tool === 'select_lasso') {
              setLassoPoints(prev => {
                  const last = prev[prev.length-1];
                  if(last && last.x === col && last.y === row) return prev;
                  const newPts = [...prev, {x: col, y: row}];
                  updateDraftShape(null, {x: col, y: row}); // passes null start, uses lassoPoints
                  return newPts;
              });
          } else if (idx >= 0 && idx < gridSize * gridSize) {
             paintPixel(idx);
          }
        }
      }
  }, [zoom, pan, gridSize, paintPixel, dragStartPos, dragCurrentPos, updateDraftShape]);

  const endInteraction = useCallback(() => {
    setIsDrawing(false);
    lastTouch.current = null;

    const tool = activeToolRef.current;

    if (['line', 'rect', 'circle', 'ellipse', 'polygon'].includes(tool)) {
        commitDraft();
    } else if (tool === 'select_rect' && dragStartPos && dragCurrentPos) {
        setSelectionMask(getRectangleSelection(dragStartPos.x, dragStartPos.y, dragCurrentPos.x, dragCurrentPos.y, gridSize));
        setDraftLayer(null);
    } else if (tool === 'select_lasso' && lassoPoints.length > 0) {
        setSelectionMask(getLassoSelection(lassoPoints, gridSize));
        setLassoPoints([]);
        setDraftLayer(null);
    }

    setDragStartPos(null);
    setDragCurrentPos(null);
  }, [commitDraft, gridSize, lassoPoints, dragStartPos, dragCurrentPos]);


  // Touch logic - optimized with bounding client rect
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
       startInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [startInteraction]);

  const handleTouchMove = useCallback((e) => {
    // Prevent default scrolling when drawing
    if (e.cancelable) e.preventDefault();

    if (e.touches.length === 1) {
       moveInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [moveInteraction]);

  const handleTouchEnd = useCallback(() => {
    endInteraction();
  }, [endInteraction]);

  // Transform Actions
  const applyTransform = useCallback((transformType) => {
      saveState();
      setFrames(prev => {
          const currentFrame = prev[currF];
          const targetLayer = currentFrame.layers[currL];
          if (!targetLayer.visible) return prev;

          let newPixels = [...targetLayer.pixels];

          if(selectionMask.length > 0) {
              // Extract selection
              // For simplicity, transformations within selection currently only support full layer flips easily
              // A true local selection transform is complex. We'll fallback to full layer for now if requested,
              // or skip. We'll do full layer.
          }

          if(transformType === 'flipH') newPixels = flipHorizontal(newPixels, gridSize);
          if(transformType === 'flipV') newPixels = flipVertical(newPixels, gridSize);
          if(transformType === 'rot90') newPixels = rotate90(newPixels, gridSize);
          if(transformType === 'rot180') newPixels = rotate180(newPixels, gridSize);
          if(transformType === 'rot270') newPixels = rotate270(newPixels, gridSize);

          const newLayers = [...currentFrame.layers];
          newLayers[currL] = { ...targetLayer, pixels: newPixels };
          const newFrames = [...prev];
          newFrames[currF] = { ...currentFrame, layers: newLayers };
          return newFrames;
      });
  }, [currF, currL, gridSize, selectionMask, saveState]);

  // Selection Actions
  const deleteSelection = useCallback(() => {
      if(selectionMask.length === 0) return;
      saveState();
      setFrames(prev => {
          const currentFrame = prev[currF];
          const targetLayer = currentFrame.layers[currL];
          if (!targetLayer.visible) return prev;

          const newPixels = [...targetLayer.pixels];
          selectionMask.forEach(idx => {
             newPixels[idx] = 'transparent';
          });

          const newLayers = [...currentFrame.layers];
          newLayers[currL] = { ...targetLayer, pixels: newPixels };
          const newFrames = [...prev];
          newFrames[currF] = { ...currentFrame, layers: newLayers };
          return newFrames;
      });
  }, [currF, currL, selectionMask, saveState]);

  return {
    // State
    gridSize, color, isDrawing, showGrid, activeMenu, showLayers,
    dangerAction, symmetry, isAnimMode, isPlaying, frames, currF,
    currL, history, zoom, pan, activeTool, toolOptions, selectionMask, clipboard, draftLayer,
    dragStartPos, dragCurrentPos, lassoPoints,

    // Refs
    canvasRef,

    // Setters
    setColor, setShowGrid, setActiveMenu, setShowLayers,
    setDangerAction, setSymmetry, setIsAnimMode, setIsPlaying,
    setFrames, setCurrF, setCurrL, setHistory, setZoom, setPan, setIsDrawing,
    setActiveTool, setToolOptions, setSelectionMask, setClipboard, setDraftLayer,
    setDragStartPos, setDragCurrentPos, setLassoPoints,

    // Actions
    saveState, applyGridSize, paintPixel, applyTransform, deleteSelection,
    startInteraction, moveInteraction, endInteraction,

    // Handlers
    handleTouchStart, handleTouchMove, handleTouchEnd
  };
};
