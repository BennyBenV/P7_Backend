const Book = require('../models/Book');
const fs = require('fs');
const path = require('path');

// Récupérer tous les livres
exports.getAllBooks = async (req, res) => {
  try {
    // Cherches tous les livres dans la base de données
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des livres' });
  }
};

// Récupérer un livre par son id
exports.getBookById = async (req, res) => {
  // Récupérer l'ID du livre à partir des paramètres de la requête
  const bookId = req.params.id;

  try {
    // Cherches le livre dans la base de données par son ID
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ msg: 'Livre non trouvé' });
    }
    res.json(book);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
};



//création d'un nouvezu livre
exports.createBook = async (req, res, next) => {
  try {
    // On récupère les données du livre
    const bookObject = JSON.parse(req.body.book);

    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
    });
    await book.save();
    res.status(201).json({ message: "Objet enregistré !", book });
  } catch (error) {
    res.status(400).json({ error });
  }
};



// Récupérer les 3 livres ayant la meilleure note moyenne
exports.getBestRatedBooks = async (req, res, next) => {
  try {
    const bestRatedBooks = await Book.find()
      .sort({ averageRating: -1 }) // Tri par ordre décroissant de la note moyenne
      .limit(3); // Limite à 3 résultats

    res.json(bestRatedBooks);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};



// notation livre
exports.rateBook = async (req, res, next) => {
  const bookId = req.params.id;
  const userId = req.auth.userId;
  const rating = req.body.rating;
  try {
    const book = await Book.findById(bookId);
    // vérification si l'utilisateur a déjà noté le livre
    const ratingIndex = book.ratings.findIndex(
      (rating) => rating.userId === userId
    );
    if (ratingIndex === -1) {
      book.ratings.push({ userId, grade: rating });
    } else {
      book.ratings[ratingIndex].grade = rating;
    }
    const averageRating =
      book.ratings.reduce((sum, rating) => sum + rating.grade, 0) /
      book.ratings.length;
    book.averageRating = averageRating;
    await book.save();
    res.status(200).json(book);
  } catch (error) {
    res.status(400).json({ error });
  }

};

//supprimer livre
exports.deleteBook = async (req, res, next) => {
  const bookId = req.params.id;

  try {
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé.' });
    }

    if (book.imageUrl) {
      // Récupérer le chemin de l'image à partir de l'URL stockée
      const imagePath = path.join(__dirname, '..', 'images', book.imageUrl.split('/images/')[1]);

      // Supprimer le fichier image
      fs.unlink(imagePath, err => {
        if (err) {
          console.error('Erreur lors de la suppression de l\'image :', err);
        }
      });
    }

    // Supprimer le livre de la base de données
    await Book.findByIdAndDelete(bookId);

    res.json({ message: 'Livre supprimé avec succès.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

//mettre à jour un livre
exports.updateBook = async (req, res, next) => {
  const bookObject = req.file
    ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename
        }`,
    }
    : { ...req.body };
  delete bookObject._userId;
  try {
    const book = await Book.findOne({ _id: req.params.id });
    if (book.userId !== req.auth.userId) {
      return res.status(403).json({ error: "Non autorisé !" });
    }
    await Book.updateOne(
      { _id: req.params.id },
      { ...bookObject, _id: req.params.id }
    );
    res.status(200).json({ message: "Objet modifié !" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

