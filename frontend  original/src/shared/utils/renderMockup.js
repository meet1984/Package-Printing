

/**
 * Core compositing function for mockups.
 * Shared between Admin Live Preview and End-User Generator.
 * 
 * @param {Object} templateConfig - The template object { baseImageUrl, printArea: {x,y,width,height,rotation}, shadingMapUrl }
 * @param {string|HTMLImageElement} designImage - URL or Image element of the user's design
 * @param {Object} transform - The user's transform { x, y, scale, rotation }
 * @returns {Promise<HTMLCanvasElement>} - The rendered canvas
 */
export async function renderMockupCanvas(templateConfig, designImage, transform, customCanvasAPI = null) {
  // Load images
  const loadImage = async (src) => {
    if (customCanvasAPI && customCanvasAPI.loadImage) {
      return customCanvasAPI.loadImage(src);
    }
    
    return new Promise((resolve, reject) => {
      if (src instanceof HTMLImageElement) return resolve(src);
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Important for CORS if loading from full URLs
      
      const url = src;
      
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  };

  const [baseImg, designImg] = await Promise.all([
    loadImage(templateConfig.baseImageUrl),
    loadImage(designImage)
  ]);

  let shadingImg = null;
  if (templateConfig.shadingMapUrl) {
    try {
      shadingImg = await loadImage(templateConfig.shadingMapUrl);
    } catch (e) {
      console.warn("Failed to load shading map");
    }
  }

  // Set up canvas to match base image dimensions
  const canvas = customCanvasAPI && customCanvasAPI.createCanvas
    ? customCanvasAPI.createCanvas(baseImg.width, baseImg.height)
    : document.createElement('canvas');
    
  const ctx = canvas.getContext('2d');
  canvas.width = baseImg.width;
  canvas.height = baseImg.height;

  // 1. Draw base photo
  ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

  // 2. Draw design, clipped to print area
  const pa = templateConfig.printArea || { x: 0, y: 0, width: 1, height: 1, rotation: 0 };
  
  // Calculate print area pixel dimensions
  const paX = pa.x * canvas.width;
  const paY = pa.y * canvas.height;
  const paW = pa.width * canvas.width;
  const paH = pa.height * canvas.height;
  
  // Save context state before clipping
  ctx.save();
  
  // Create clipping path for the print area (respecting print area rotation)
  ctx.translate(paX + paW/2, paY + paH/2);
  ctx.rotate((pa.rotation || 0) * Math.PI / 180);
  ctx.beginPath();
  ctx.rect(-paW/2, -paH/2, paW, paH);
  ctx.clip();

  // Draw the design inside the clipped print area, applying user transforms
  const tf = transform || { x: 0, y: 0, scale: 1, rotation: 0 };
  
  // Center of print area is 0,0 now. Apply user translation and rotation.
  // Transform x,y are usually given relative to the print area width/height
  const userTx = (tf.x || 0) * paW;
  const userTy = (tf.y || 0) * paH;
  
  ctx.translate(userTx, userTy);
  ctx.rotate((tf.rotation || 0) * Math.PI / 180);
  
  // Scale the design to fit the print area initially (cover or contain strategy)
  // Let's use a "contain" or initial scale calculation
  const scaleX = paW / designImg.width;
  const scaleY = paH / designImg.height;
  const initialScale = Math.min(scaleX, scaleY);
  const finalScale = initialScale * (tf.scale || 1);
  
  ctx.scale(finalScale, finalScale);
  
  // Draw design centered
  ctx.drawImage(designImg, -designImg.width/2, -designImg.height/2, designImg.width, designImg.height);
  
  // 3. Shading pass (multiply blend) over the clipped area
  if (shadingImg) {
    ctx.globalCompositeOperation = 'multiply';
    // The shading image is typically the same size as the base image, but we are inside a transformed context.
    // So we reset the transform to draw the shading map exactly over the canvas.
    ctx.restore(); // Remove clipping and transform
    ctx.save(); // Save again before shading
    
    // Create clipping path again to only shade the design area
    ctx.translate(paX + paW/2, paY + paH/2);
    ctx.rotate((pa.rotation || 0) * Math.PI / 180);
    ctx.beginPath();
    ctx.rect(-paW/2, -paH/2, paW, paH);
    ctx.clip();
    ctx.rotate(-(pa.rotation || 0) * Math.PI / 180);
    ctx.translate(-(paX + paW/2), -(paY + paH/2));
    
    ctx.drawImage(shadingImg, 0, 0, canvas.width, canvas.height);
  } else {
    // If no shading map, do nothing. The user asked to remove the black shade line.
  }

  // Restore completely
  ctx.restore();
  
  // 4. Any foreground details could be added here if defined in templateConfig

  return canvas;
}
