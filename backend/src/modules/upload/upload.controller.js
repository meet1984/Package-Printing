const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // Generate unique filename
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
    const filepath = path.join(__dirname, '../../../uploads', filename);

    // Compress and convert to webp using sharp
    await sharp(req.file.buffer)
      .webp({ quality: 80 })
      .resize({ width: 1200, withoutEnlargement: true }) // Max width 1200px
      .toFile(filepath);

    // Return the public URL
    const url = `/uploads/${filename}`;
    
    res.status(200).json({ url });
  } catch (error) {
    next(error);
  }
};
