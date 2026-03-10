import { useState, useEffect, useRef, useCallback } from 'react';
import { createLayer, getSymIndices } from '../utils/canvasUtils';

export const usePixelEngine = () => {
  const [gridSize, setGridSize] = useState(16);
  const [color, setColor] = useState('#10b981');
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  // Menus
  const [activeMenu, setActiveMenu] = useState(null); // 'grid', 'sym', null
  const [showLayers, setShowLayers] = useState(false);
  const [dangerAction, setDangerAction] = useState(null); // { type, payload }

  // Modes & Tools
  const [symmetry, setSymmetry] = useState('none'); // none, horizontal, vertical, both
  const [isAnimMode, setIsAnimMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

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

  const paintPixel = useCallback((index) => {
    if (!isDrawingRef.current || isPlayingRef.current) return;

    setFrames(prev => {
      // Shallow copy optimization
      const currentFrame = prev[currF];
      const targetLayer = currentFrame.layers[currL];

      if (!targetLayer.visible) return prev;

      const indicesToPaint = getSymIndices(index, gridSize, symmetry);

      // Check if we actually need to paint
      const needsPainting = indicesToPaint.some(idx => targetLayer.pixels[idx] !== color);
      if (!needsPainting) return prev;

      const newPixels = [...targetLayer.pixels];
      indicesToPaint.forEach(idx => {
        newPixels[idx] = color;
      });

      const newLayers = [...currentFrame.layers];
      newLayers[currL] = { ...targetLayer, pixels: newPixels };

      const newFrames = [...prev];
      newFrames[currF] = { ...currentFrame, layers: newLayers };

      return newFrames;
    });
  }, [currF, currL, color, gridSize, symmetry]);

  // Touch logic - optimized with bounding client rect
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      setIsDrawing(false);
      lastTouch.current = {
        dist: Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY),
        midX: (e.touches[0].clientX + e.touches[1].clientX)/2,
        midY: (e.touches[0].clientY + e.touches[1].clientY)/2
      };
    }
    else if (e.touches.length === 1 && !isPlayingRef.current) {
      saveState();
      setIsDrawing(true);

      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const touch = e.touches[0];

        // Adjust for zoom and pan to get relative coordinates
        const x = (touch.clientX - rect.left - rect.width / 2 - pan.x * zoom) / zoom + rect.width / 2;
        const y = (touch.clientY - rect.top - rect.height / 2 - pan.y * zoom) / zoom + rect.height / 2;

        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
          const col = Math.floor((x / rect.width) * gridSize);
          const row = Math.floor((y / rect.height) * gridSize);
          const idx = row * gridSize + col;

          if (idx >= 0 && idx < gridSize * gridSize) {
            paintPixel(idx);
          }
        }
      }
    }
  }, [saveState, paintPixel, gridSize, zoom, pan]);

  const handleTouchMove = useCallback((e) => {
    // Prevent default scrolling when drawing
    if (e.cancelable) e.preventDefault();

    if (e.touches.length === 2 && lastTouch.current) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      if (lastTouch.current.dist === 0) return;
      const midX = (e.touches[0].clientX + e.touches[1].clientX)/2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY)/2;

      setZoom(z => Math.min(Math.max(0.5, z * (dist / lastTouch.current.dist)), 5));
      setPan(p => ({
        x: p.x + (midX - lastTouch.current.midX) / zoom,
        y: p.y + (midY - lastTouch.current.midY) / zoom
      }));

      lastTouch.current = { dist, midX, midY };
    } else if (e.touches.length === 1 && isDrawingRef.current) {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const touch = e.touches[0];

        // Convert screen coordinates to canvas-relative taking into account zoom/pan
        const x = (touch.clientX - rect.left - rect.width / 2 - pan.x * zoom) / zoom + rect.width / 2;
        const y = (touch.clientY - rect.top - rect.height / 2 - pan.y * zoom) / zoom + rect.height / 2;

        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
          const col = Math.floor((x / rect.width) * gridSize);
          const row = Math.floor((y / rect.height) * gridSize);
          const idx = row * gridSize + col;

          if (idx >= 0 && idx < gridSize * gridSize) {
             paintPixel(idx);
          }
        }
      }
    }
  }, [paintPixel, gridSize, zoom, pan]);

  const handleTouchEnd = useCallback(() => {
    setIsDrawing(false);
    lastTouch.current = null;
  }, []);

  // Mouse fallback handlers
  const handleMouseDown = useCallback((idx) => {
    saveState();
    setIsDrawing(true);
    paintPixel(idx);
  }, [saveState, paintPixel]);

  const handleMouseEnter = useCallback((idx) => {
    paintPixel(idx);
  }, [paintPixel]);

  const handleMouseUp = useCallback(() => setIsDrawing(false), []);
  const handleMouseLeave = useCallback(() => setIsDrawing(false), []);

  return {
    // State
    gridSize, color, isDrawing, showGrid, activeMenu, showLayers,
    dangerAction, symmetry, isAnimMode, isPlaying, frames, currF,
    currL, history, zoom, pan,

    // Refs
    canvasRef,

    // Setters
    setColor, setShowGrid, setActiveMenu, setShowLayers,
    setDangerAction, setSymmetry, setIsAnimMode, setIsPlaying,
    setFrames, setCurrF, setCurrL, setHistory, setZoom, setPan, setIsDrawing,

    // Actions
    saveState, applyGridSize, paintPixel,

    // Handlers
    handleTouchStart, handleTouchMove, handleTouchEnd,
    handleMouseDown, handleMouseEnter, handleMouseUp, handleMouseLeave
  };
};
