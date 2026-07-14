import React, { useRef, useState, useEffect } from 'react';

// printArea: { x, y, width, height, rotation } (all 0-1 except rotation in degrees)
export default function PrintAreaEditor({ imageUrl, printArea, onChange }) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragAction, setDragAction] = useState(null); // 'move', 'nw', 'ne', 'sw', 'se', 'rotate'
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startArea, setStartArea] = useState(null);

  // Initialize with defaults if null
  const area = printArea || { x: 0.25, y: 0.25, width: 0.5, height: 0.5, rotation: 0 };

  const handlePointerDown = (e, action) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    setDragAction(action);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartArea({ ...area });
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const dx = (e.clientX - startPos.x) / rect.width;
    const dy = (e.clientY - startPos.y) / rect.height;

    let newArea = { ...startArea };

    if (dragAction === 'move') {
      newArea.x += dx;
      newArea.y += dy;
    } else if (dragAction === 'se') {
      newArea.width += dx;
      newArea.height += dy;
    } else if (dragAction === 'nw') {
      newArea.x += dx;
      newArea.y += dy;
      newArea.width -= dx;
      newArea.height -= dy;
    } else if (dragAction === 'ne') {
      newArea.y += dy;
      newArea.width += dx;
      newArea.height -= dy;
    } else if (dragAction === 'sw') {
      newArea.x += dx;
      newArea.width -= dx;
      newArea.height += dy;
    } else if (dragAction === 'rotate') {
      // Calculate rotation based on center of the box
      const centerX = rect.left + (startArea.x + startArea.width / 2) * rect.width;
      const centerY = rect.top + (startArea.y + startArea.height / 2) * rect.height;
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      const startAngle = Math.atan2(startPos.y - centerY, startPos.x - centerX) * (180 / Math.PI);
      newArea.rotation = (startArea.rotation + (angle - startAngle)) % 360;
    }

    // Basic bounds clamping for width/height/x/y
    if (newArea.width < 0.05) newArea.width = 0.05;
    if (newArea.height < 0.05) newArea.height = 0.05;
    
    onChange(newArea);
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    setDragAction(null);
    e.target.releasePointerCapture(e.pointerId);
  };

  if (!imageUrl) return <div className="bg-gray-100 aspect-square flex items-center justify-center">No image</div>;

  console.log("PrintAreaEditor rendering with imageUrl:", imageUrl);

  return (
    <div 
      className="relative w-full overflow-hidden select-none touch-none bg-gray-100 rounded-lg"
      ref={containerRef}
    >
      {/* Container must scale height based on image aspect ratio naturally */}
      <img src={imageUrl} alt="Base Product" className="w-full h-auto block pointer-events-none" />
      
      {/* Editor Overlay */}
      <div 
        className="absolute border-2 border-blue-500 bg-blue-500/20 cursor-move shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
        style={{
          left: `${area.x * 100}%`,
          top: `${area.y * 100}%`,
          width: `${area.width * 100}%`,
          height: `${area.height * 100}%`,
          transform: `rotate(${area.rotation || 0}deg)`,
          transformOrigin: 'center',
        }}
        onPointerDown={(e) => handlePointerDown(e, 'move')}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Placeholder text indicating print area */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white font-bold drop-shadow-md text-sm md:text-base">PRINT AREA</span>
        </div>

        {/* Resize Handles */}
        <div 
          className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize -top-2 -left-2"
          onPointerDown={(e) => handlePointerDown(e, 'nw')}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
        <div 
          className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize -top-2 -right-2"
          onPointerDown={(e) => handlePointerDown(e, 'ne')}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
        <div 
          className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize -bottom-2 -left-2"
          onPointerDown={(e) => handlePointerDown(e, 'sw')}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
        <div 
          className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize -bottom-2 -right-2"
          onPointerDown={(e) => handlePointerDown(e, 'se')}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
        
        {/* Rotate Handle */}
        <div 
          className="absolute w-1 h-6 bg-blue-500 -top-8 left-1/2 -translate-x-1/2"
        />
        <div 
          className="absolute w-4 h-4 bg-yellow-400 border-2 border-blue-500 rounded-full cursor-crosshair -top-10 left-1/2 -translate-x-1/2"
          onPointerDown={(e) => handlePointerDown(e, 'rotate')}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      </div>
    </div>
  );
}
