'use client';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';
import { convertJavaToJS, convertJSToJava, migrateOldFormat } from './helper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const createGrid = (h, w) => {
  return Array(Number.parseInt(h))
    .fill()
    .map(() => Array(Number.parseInt(w)).fill({ r: 0, g: 0, b: 0, a: 0 }));
};

export default function Home() {
  const [height, setHeight] = useState(20);
  const [width, setWidth] = useState(21);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState('draw');
  const [grid, setGrid] = useState(() => createGrid(height, width));
  const [javaString, setJavaString] = useState('');
  const [error, setError] = useState('');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [opacity, setOpacity] = useState(100);
  const [oldFormatInput, setOldFormatInput] = useState('');

  const hexToRgba = (hex, alpha = 255) => {
    const r = Number.parseInt(hex.slice(1, 3), 16);
    const g = Number.parseInt(hex.slice(3, 5), 16);
    const b = Number.parseInt(hex.slice(5, 7), 16);
    return { r, g, b, a: alpha };
  };

  const setGridSquare = (row, col) => {
    if (!isDrawing && !isMouseDown) return;

    const newGrid = grid.map((row) => [...row]);
    if (mode === 'erase') {
      newGrid[row][col] = { r: 0, g: 0, b: 0, a: 0 };
    } else {
      const rgbaColor = hexToRgba(currentColor, Math.round(opacity * 2.55));
      newGrid[row][col] = rgbaColor;
    }
    setGrid(newGrid);
  };

  const [isMouseDown, setIsMouseDown] = useState(false);

  const handleMouseDown = () => {
    setIsMouseDown(true);
    setIsDrawing(true);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setIsDrawing(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsMouseDown(false);
      setIsDrawing(false);
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mouseleave', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mouseleave', handleGlobalMouseUp);
    };
  }, []);

  useEffect(() => {
    setGrid(createGrid(Number.parseInt(height), Number.parseInt(width)));
  }, [height, width, createGrid]);

  const importJavaString = () => {
    try {
      if (!javaString.trim()) {
        setError('Please enter Java code to import');
        return;
      }

      const newGrid = convertJavaToJS(javaString);

      setHeight(newGrid.length);
      setWidth(newGrid[0].length);
      setTimeout(() => {
        setGrid(newGrid);
      }, 0);
      setError('');
    } catch (e) {
      setError(e.message || 'Error importing grid');
    }
  };

  const exportGridToJava = () => {
    const javaCode = convertJSToJava(grid);
    navigator.clipboard.writeText(javaCode);
    setJavaString(javaCode);
  };

  const clearGrid = () => {
    setGrid(createGrid(height, width));
  };

  const migrateOld = () => {
    try {
      if (!oldFormatInput.trim()) {
        setError('Please enter old format data to migrate');
        return;
      }

      const newGrid = migrateOldFormat(oldFormatInput);

      setHeight(newGrid.length);
      setWidth(newGrid[0].length);
      setTimeout(() => {
        setGrid(newGrid);
      }, 0);
      setError('');
    } catch (e) {
      setError(e.message || 'Error migrating old format');
    }
  };

  const getPixelStyle = (pixel) => {
    if (pixel.a === 0) {
      return {
        backgroundImage:
          'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
        backgroundSize: '10px 10px',
        backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
      };
    }
    return {
      backgroundColor: `rgba(${pixel.r}, ${pixel.g}, ${pixel.b}, ${
        pixel.a / 255
      })`,
    };
  };

  return (
    <div className="w-full max-w-[800px]">
      <div className="flex gap-2 mb-4">
        <Button
          onClick={() => setMode('draw')}
          variant={mode === 'draw' ? 'default' : 'outline'}
        >
          Draw
        </Button>
        <Button
          onClick={() => setMode('erase')}
          variant={mode === 'erase' ? 'default' : 'outline'}
        >
          Erase
        </Button>
        <Button onClick={clearGrid} variant="outline">
          Clear
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label htmlFor="color-picker">Color:</label>
          <Input
            id="color-picker"
            type="color"
            value={currentColor}
            onChange={(e) => setCurrentColor(e.target.value)}
            className="w-16 h-10 p-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="opacity">Opacity: {opacity}%</label>
          <Input
            id="opacity"
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={(e) => setOpacity(Number.parseInt(e.target.value))}
            className="w-32"
          />
        </div>
      </div>

      <div className="mb-4 border border-gray-300 p-2 overflow-auto">
        <div
          className="grid gap-0 w-max select-none"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${width}, 25px)`,
            gridTemplateRows: `repeat(${height}, 25px)`,
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          {grid.map((rows, rowIndex) => {
            return rows.map((pixel, colIndex) => (
              <div
                key={`row-${rowIndex}-col-${colIndex}`}
                style={getPixelStyle(pixel)}
                className="border border-gray-300 w-[25px] h-[25px] cursor-pointer"
                onMouseDown={() => setGridSquare(rowIndex, colIndex)}
                onMouseOver={() => setGridSquare(rowIndex, colIndex)}
              ></div>
            ));
          })}
        </div>
      </div>

      <div className="flex space-x-4 my-4">
        <div className="flex items-center">
          <label className="mr-2">Width:</label>
          <Input
            type="number"
            value={width}
            onChange={(e) => setWidth(Number.parseInt(e.target.value) || 1)}
            className="w-20"
            min="1"
          />
        </div>
        <div className="flex items-center">
          <label className="mr-2">Height:</label>
          <Input
            type="number"
            value={height}
            onChange={(e) => setHeight(Number.parseInt(e.target.value) || 1)}
            className="w-20"
            min="1"
          />
        </div>
      </div>

      <div className="my-4">
        <label className="block mb-2">Old Format (0s and 1s):</label>
        <Textarea
          value={oldFormatInput}
          onChange={(e) => setOldFormatInput(e.target.value)}
          className="w-full min-h-[100px]"
          placeholder="Paste your old format here (0s and 1s)"
        />
        <Button onClick={migrateOld} className="mt-2">
          Migrate Old Format
        </Button>
      </div>

      <div className="my-4">
        <label className="block mb-2">Java Code:</label>
        <Textarea
          value={javaString}
          onChange={(e) => setJavaString(e.target.value)}
          className="w-full min-h-[100px]"
        />
        {error ? <p className="text-red-500 mt-1">{error}</p> : ''}

        <div className="flex gap-2 mt-2">
          <Button onClick={importJavaString}>Import from Java</Button>
          <Button onClick={exportGridToJava}>Export to Java</Button>
        </div>
      </div>
    </div>
  );
}
