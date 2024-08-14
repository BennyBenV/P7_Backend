const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { upload, optimizeImage } = require('../middleware/multer-config');
const bookController = require('../controllers/bookController');

router.post('/', auth, upload, optimizeImage, bookController.createBook);
router.get('/', bookController.getAllBooks);
router.get('/bestrating', bookController.getBestRatedBooks);
router.get('/:id', bookController.getBookById);
router.put('/:id', auth, upload, optimizeImage, bookController.updateBook);
router.delete('/:id', auth, bookController.deleteBook);
router.post("/:id/rating", auth, bookController.rateBook);

module.exports = router;
