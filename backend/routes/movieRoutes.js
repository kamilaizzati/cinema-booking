const express = require('express');
const router = express.Router();
const { 
  getMovies, 
  getMovieById, 
  createMovie, 
  updateMovie, 
  deleteMovie 
} = require('../controllers/movieController');

const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getMovies);

router.route('/:id')
  .get(getMovieById);

router.route('/')
  .post(createMovie);

router.route('/:id')
  .put(updateMovie)
  .delete (deleteMovie);

module.exports = router;