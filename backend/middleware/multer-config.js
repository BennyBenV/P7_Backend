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
    callback(null, 'images'); // Répertoire où les fichiers sont stockés temporairement
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_').split('.')[0];
    const timestamp = Date.now();
    const extension = MIME_TYPES[file.mimetype] || 'jpg'; // Extension par défaut si le MIME type n'est pas trouvé
    callback(null, `${name}_${timestamp}.tmp`);
  }
});

// Middleware multer pour le téléchargement des fichiers
const upload = multer({ storage: storage }).single('image');

// Middleware pour l'optimisation des images
const optimizeImage = async (req, res, next) => {
  if (!req.file) {
    return next(); // Si aucun fichier n'est présent, passer au middleware suivant
  }

  const { path: tempPath, filename } = req.file;
  const optimizedFilename = filename.replace('.tmp', '.webp');
  const outputFilePath = path.join('images', optimizedFilename);

  try {
    sharp.cache(false);
    // Utilisation de sharp pour la conversion de l'image en format webp et la compression
    await sharp(tempPath)
      .webp({ quality: 80 })
      .toFile(outputFilePath);

    // Supprimer l'image temporaire originale
    fs.unlink(tempPath, err => {
      if (err) {
        console.error('Erreur lors de la suppression du fichier temporaire :', err);
      }
    });

    // Ajouter le chemin optimisé de l'image à req.file
    req.file.path = outputFilePath;
    req.file.filename = optimizedFilename;

    next();
  } catch (error) {
    console.error('Erreur lors du traitement de l\'image :', error);
    res.status(500).json({ error: 'Erreur lors du traitement de l\'image' });
  }
};

module.exports = { upload, optimizeImage };
