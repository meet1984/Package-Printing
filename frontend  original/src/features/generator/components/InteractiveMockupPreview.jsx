import React, { useRef, useState, useEffect } from 'react';
import { getImageUrl } from '../../../shared/utils/getImageUrl';

export default function InteractiveMockupPreview({ 
  face, 
  designDataUrl, 
  transform, 
  onTransformChange,
  isSideBySide = false
}) {
  const containerRef = useRef(null);
  const designImgRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeData, setResizeData] = useState({ centerX: 0, centerY: 0, startDist: 0, startScale: 1 });
  const [baseImgSize, setBaseImgSize] = useState({ width: 1, height: 1 });
  const [designImgSize, setDesignImgSize] = useState({ width: 1, height: 1 });
  const [bounds, setBounds] = useState({ width: 1, height: 1 });

  // Load natural dimensions of base image
  useEffect(() => {
    if (!face.baseImageUrl) return;
    const img = new Image();
    img.src = getImageUrl(face.baseImageUrl);
    img.onload = () => {
      setBaseImgSize({ width: img.naturalWidth || 1, height: img.naturalHeight || 1 });
    };
  }, [face.baseImageUrl]);

  // Load natural dimensions of design image
  useEffect(() => {
    if (!designDataUrl) return;
    const img = new Image();
    img.src = designDataUrl;
    img.onload = () => {
      setDesignImgSize({ width: img.naturalWidth || 1, height: img.naturalHeight || 1 });
    };
  }, [designDataUrl]);

  // Compute rendered bounds to perfectly wrap the image via object-contain logic
  useEffect(() => {
    const updateBounds = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const containerAspect = rect.width / rect.height;
      const imgAspect = baseImgSize.width / baseImgSize.height;
      
      let w, h;
      if (containerAspect > imgAspect) {
        // Container is wider than image, fit to height
        h = rect.height;
        w = h * imgAspect;
      } else {
        // Container is taller than image, fit to width
        w = rect.width;
        h = w / imgAspect;
      }
      setBounds({ width: w, height: h });
    };

    // Need a tiny delay for container layout if it just mounted or toggled side-by-side
    const timer = setTimeout(updateBounds, 10);
    window.addEventListener('resize', updateBounds);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateBounds);
    };
  }, [baseImgSize, isSideBySide]);

  // Handle Dragging
  const handleMouseDown = (e) => {
    if (!designDataUrl) return;
    e.preventDefault(); 
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (isResizing) {
      const currentDist = Math.sqrt(Math.pow(e.clientX - resizeData.centerX, 2) + Math.pow(e.clientY - resizeData.centerY, 2));
      const scaleRatio = currentDist / resizeData.startDist;
      
      const constraints = face.constraints || { minScale: 0.1, maxScale: 3 };
      let newScale = resizeData.startScale * scaleRatio;
      newScale = Math.max(constraints.minScale, Math.min(constraints.maxScale, newScale));
      
      onTransformChange({
        ...transform,
        scale: newScale
      });
      return;
    }

    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    const pa = face.printArea || { width: 1, height: 1 };
    const paScreenW = bounds.width * pa.width;
    const paScreenH = bounds.height * pa.height;
    
    // Convert screen pixel delta to percentage of print area
    const deltaPctX = deltaX / paScreenW;
    const deltaPctY = deltaY / paScreenH;
    
    onTransformChange({
      ...transform,
      x: transform.x + deltaPctX,
      y: transform.y + deltaPctY
    });
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation(); 
    if (!designImgRef.current) return;
    
    const rect = designImgRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const dist = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));
    
    setIsResizing(true);
    setResizeData({ centerX, centerY, startDist: dist, startScale: transform.scale || 1 });
  };

  // Add scroll-to-zoom for extra convenience
  useEffect(() => {
    const imgEl = designImgRef.current;
    if (!imgEl) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const zoomSensitivity = 0.05;
      const delta = e.deltaY < 0 ? zoomSensitivity : -zoomSensitivity;
      const constraints = face.constraints || { minScale: 0.1, maxScale: 3 };
      
      let newScale = (transform.scale || 1) + delta;
      newScale = Math.max(constraints.minScale, Math.min(constraints.maxScale, newScale));
      
      if (newScale !== transform.scale) {
        onTransformChange({ ...transform, scale: newScale });
      }
    };

    imgEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => imgEl.removeEventListener('wheel', handleWheel);
  }, [transform, face.constraints, onTransformChange]);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeData, transform, onTransformChange]);

  const pa = face.printArea || { x: 0, y: 0, width: 1, height: 1, rotation: 0 };
  
  const paBaseW = baseImgSize.width * pa.width;
  const paBaseH = baseImgSize.height * pa.height;
  
  const scaleX = paBaseW / designImgSize.width;
  const scaleY = paBaseH / designImgSize.height;
  const initialScale = Math.min(scaleX, scaleY);
  const finalScale = initialScale * (transform.scale || 1);

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-transparent"
      ref={containerRef}
    >
      <div 
        className="relative shadow-sm"
        style={{ width: bounds.width, height: bounds.height }}
      >
         {/* 1. Base Image */}
         <img 
           src={getImageUrl(face.baseImageUrl)} 
           alt="Base" 
           className="w-full h-full absolute inset-0 pointer-events-none" 
           style={{ opacity: designDataUrl ? 1 : 0.7 }}
         />

         {/* 2. Print Area Clipping Box */}
         {designDataUrl && (
           <div 
             className="absolute"
             style={{
               left: `${pa.x * 100}%`,
               top: `${pa.y * 100}%`,
               width: `${pa.width * 100}%`,
               height: `${pa.height * 100}%`,
               transform: `rotate(${pa.rotation || 0}deg)`,
               overflow: 'hidden',
               // Add a subtle border when dragging for better UX
               border: isDragging ? '1px dashed rgba(59, 130, 246, 0.5)' : 'none'
             }}
           >
             <div 
               className="absolute w-full h-full"
               style={{
                 left: 0,
                 top: 0,
                 transform: `translate(${transform.x * 100}%, ${transform.y * 100}%) rotate(${transform.rotation || 0}deg)`,
               }}
             >
               <div 
                 ref={designImgRef}
                 className={`absolute ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${isResizing ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-blue-300'}`}
                 onMouseDown={handleMouseDown}
                 style={{
                   left: '50%',
                   top: '50%',
                   width: `${(designImgSize.width * finalScale / paBaseW) * 100}%`,
                   height: `${(designImgSize.height * finalScale / paBaseH) * 100}%`,
                   transform: `translate(-50%, -50%)`,
                   userSelect: 'none',
                   WebkitUserDrag: 'none'
                 }}
               >
                 <img 
                   src={designDataUrl} 
                   className="w-full h-full object-contain pointer-events-none"
                   alt="Design"
                 />
                 
                 {/* Resize Handle */}
                 <div 
                   onMouseDown={handleResizeStart}
                   className="absolute -bottom-2 -right-2 w-5 h-5 bg-blue-500 rounded-full cursor-nwse-resize border-[3px] border-white shadow-md z-10 transition-transform hover:scale-125"
                 />
               </div>
             </div>
           </div>
         )}

         {/* 3. Shading Map Overlay */}
         {face.shadingMapUrl && (
           <img 
             src={getImageUrl(face.shadingMapUrl)}
             className="w-full h-full absolute inset-0 mix-blend-multiply pointer-events-none"
             alt="Shading Map"
           />
         )}

         {/* 4. Missing Design Hint */}
         {!designDataUrl && !isSideBySide && (
           <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-8 py-6 text-center shadow-lg transform scale-90 md:scale-100">
               <p className="text-gray-700 font-semibold text-lg">Upload your logo to see the preview</p>
               <p className="text-gray-500 text-sm mt-1">Your design will appear right here</p>
               <p className="text-blue-500 text-sm font-medium mt-2">You can drag it to position!</p>
             </div>
           </div>
         )}
      </div>
    </div>
  );
}
