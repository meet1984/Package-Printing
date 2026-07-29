const path = require('path');
const fs = require('fs');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const Template = require('../templates/template.model');

// We'll require the shared function. We can read it or import it.
// Since it's ES module syntax in frontend and CommonJS in backend, we need to adapt it.
// An easy way is to dynamically import it, or just replicate the function if dynamic import is tricky.
// Wait, the spec says "Extract the compositing logic ... into a single function ... never reimplement".
// We can use dynamic import() for the ES module since Node 24 supports it.

exports.renderMockup = async (req, res, next) => {
  try {
    const { templateId, transform } = req.body;
    if (!req.file || !templateId || !transform) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const template = await Template.findByPk(templateId);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Parse transform
    let transformObj = {};
    try {
      transformObj = JSON.parse(transform);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid transform JSON' });
    }

    // Save the uploaded design temporarily to disk, or we can just pass the buffer directly.
    // @napi-rs/canvas `loadImage` accepts Buffer!
    const designBuffer = req.file.buffer;

    // We need to pass the base image and shading image URLs as paths or buffers.
    // The URLs are like /uploads/filename.webp. We need to convert them to local paths.
    const getLocalPath = (url) => {
      if (!url) return null;
      const filename = url.split('/').pop();
      return path.join(__dirname, '../../../uploads', filename);
    };

    const templateConfig = {
      baseImageUrl: getLocalPath(template.baseImageUrl),
      printArea: template.printArea,
      shadingMapUrl: getLocalPath(template.shadingMapUrl)
    };

    // Dynamically import the shared ESM file
    const sharedModulePath = path.resolve(__dirname, '../../../../frontend/src/shared/utils/renderMockup.js');
    
    // We convert it to a file:// URL to properly import an absolute path on Windows/Linux
    const moduleUrl = 'file://' + sharedModulePath.replace(/\\/g, '/');
    const { renderMockupCanvas } = await import(moduleUrl);
    
    // Custom canvas API using @napi-rs/canvas
    const customCanvasAPI = {
      loadImage: async (src) => {
        if (typeof src === 'string') {
          // If it has local paths from getLocalPath, they won't start with /uploads anymore, they are C:\...
          // Read file to buffer first to ensure napi-rs handles it smoothly
          const buf = fs.readFileSync(src);
          return await loadImage(buf);
        }
        return await loadImage(src);
      },
      createCanvas: (w, h) => createCanvas(w, h)
    };

    // Render it using the exact same compositing logic as frontend
    const canvas = await renderMockupCanvas(
      templateConfig,
      designBuffer,
      transformObj,
      customCanvasAPI
    );

    // Save the final canvas to a file
    const filename = `mockup-${Date.now()}-${Math.round(Math.random() * 1E9)}.png`;
    const filepath = path.join(__dirname, '../../../uploads', filename);
    
    const buffer = await canvas.encode('png');
    fs.writeFileSync(filepath, buffer);

    res.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Render Error:", error);
    next(error);
  }
};
