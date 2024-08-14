const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Définir les types MIME autorisés et leurs extensions de fichier correspondantes
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Configuration du stockage des fichiers avec multer
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_').split('.')[0];
    const timestamp = Date.now();
    callback(null, `${name}_${timestamp}.tmp`);
  }
});

// Middleware multer pour le téléchargement des fichiers
const upload = multer({ storage: storage }).single('image');

// Middleware pour l'optimisation des images
const optimizeImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const { path: tempPath, filename } = req.file;
  const optimizedFilename = filename.replace('.tmp', '.webp');
  const outputFilePath = path.join('images', optimizedFilename);

  try {
    // utilisation de sharp pour la convertion de l'image en format webp et la compresser
    await sharp(tempPath)
      .webp({ quality: 80 })
      .toFile(outputFilePath);

    // Supprimer l'image temporaire originale
    fs.unlinkSync(tempPath);

    // Ajouter le chemin optimisé de l'image à req.file
    req.file.path = outputFilePath;
    req.file.filename = optimizedFilename;

    next();
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Error processing image' });
  }
};

module.exports = { upload, optimizeImage };
