'use client';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState, useRef } from 'react';
import { convertJavaToJS, convertJSToJava } from './helper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Home() {
  const [height, setHeight] = useState(20);
  const [width, setWidth] = useState(21);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState('draw');
  const [grid, setGrid] = useState(() => createGrid(height, width));
  const [javaString, setJavaString] = useState('');
  const [error, setError] = useState('');

  function createGrid(h, w) {
    return Array(parseInt(h))
      .fill()
      .map(() => Array(parseInt(w)).fill(0));
  }

  const setGridSquare = (row, col) => {
    if (!isDrawing && !isMouseDown) return;

    const newGrid = grid.map((row) => [...row]);
    if (mode === 'erase') {
      newGrid[row][col] = 0;
    } else {
      newGrid[row][col] = 1;
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
    setGrid(createGrid(parseInt(height), parseInt(width)));
  }, [height, width]);

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
            return rows.map((col, colIndex) => (
              <div
                key={`row-${rowIndex}-col-${colIndex}`}
                style={{ backgroundColor: col === 0 ? 'white' : 'black' }}
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
            onChange={(e) => setWidth(parseInt(e.target.value) || 1)}
            className="w-20"
            min="1"
          />
        </div>
        <div className="flex items-center">
          <label className="mr-2">Height:</label>
          <Input
            type="number"
            value={height}
            onChange={(e) => setHeight(parseInt(e.target.value) || 1)}
            className="w-20"
            min="1"
          />
        </div>
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
