const express = require('express');
const router = express.Router();
const {
    getAllGames,
    getGameById,
    createGame,
    updateGame,
    deleteGame,
    deleteAllGames,
    getGameStats
} = require('../controllers/gameController');

// GET /api/games/stats - Get game statistics
router.get('/stats', getGameStats);

// GET /api/games - Get all games
router.get('/', getAllGames);

// GET /api/games/:id - Get a single game by ID
router.get('/:id', getGameById);

// POST /api/games - Create a new game
router.post('/', createGame);

// PUT /api/games/:id - Update a game
router.put('/:id', updateGame);

// DELETE /api/games/:id - Delete a single game
router.delete('/:id', deleteGame);

// DELETE /api/games - Delete all games (be careful with this endpoint!)
router.delete('/', deleteAllGames);

module.exports = router;
