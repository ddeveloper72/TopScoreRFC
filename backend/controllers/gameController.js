const Game = require('../models/Game');

// Get all games
const getAllGames = async (req, res) => {
    try {
        const games = await Game.find().sort({ createdAt: -1 });
        res.json(games);
    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).json({ message: 'Error fetching games', error: error.message });
    }
};

// Get a single game by ID
const getGameById = async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }
        res.json(game);
    } catch (error) {
        console.error('Error fetching game:', error);
        res.status(500).json({ message: 'Error fetching game', error: error.message });
    }
};

// Create a new game
const createGame = async (req, res) => {
    try {
        const gameData = {
            homeTeam: req.body.homeTeam,
            awayTeam: req.body.awayTeam,
            status: req.body.status || 'active',
            gameTime: req.body.gameTime || '00:00',
            scoreHistory: req.body.scoreHistory || []
        };

        const game = new Game(gameData);
        const savedGame = await game.save();

        res.status(201).json(savedGame);
    } catch (error) {
        console.error('Error creating game:', error);
        res.status(400).json({ message: 'Error creating game', error: error.message });
    }
};

// Update a game
const updateGame = async (req, res) => {
    try {
        const game = await Game.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        res.json(game);
    } catch (error) {
        console.error('Error updating game:', error);
        res.status(400).json({ message: 'Error updating game', error: error.message });
    }
};

// Delete a game
const deleteGame = async (req, res) => {
    try {
        const game = await Game.findByIdAndDelete(req.params.id);

        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        res.json({ message: 'Game deleted successfully' });
    } catch (error) {
        console.error('Error deleting game:', error);
        res.status(500).json({ message: 'Error deleting game', error: error.message });
    }
};

// Delete all games
const deleteAllGames = async (req, res) => {
    try {
        const result = await Game.deleteMany({});
        res.json({
            message: `Successfully deleted ${result.deletedCount} games`
        });
    } catch (error) {
        console.error('Error deleting all games:', error);
        res.status(500).json({ message: 'Error deleting all games', error: error.message });
    }
};

// Get game statistics
const getGameStats = async (req, res) => {
    try {
        const totalGames = await Game.countDocuments();
        const completedGames = await Game.countDocuments({ status: 'completed' });
        const activeGames = await Game.countDocuments({ status: 'active' });

        // Calculate average scores
        const games = await Game.find({ status: 'completed' });
        let totalHomeScore = 0;
        let totalAwayScore = 0;

        games.forEach(game => {
            totalHomeScore += game.homeTeam.score;
            totalAwayScore += game.awayTeam.score;
        });

        const averageHomeScore = completedGames > 0 ? Math.round(totalHomeScore / completedGames) : 0;
        const averageAwayScore = completedGames > 0 ? Math.round(totalAwayScore / completedGames) : 0;

        const stats = {
            totalGames,
            completedGames,
            activeGames,
            averageScore: {
                home: averageHomeScore,
                away: averageAwayScore
            }
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching game stats:', error);
        res.status(500).json({ message: 'Error fetching game stats', error: error.message });
    }
};

module.exports = {
    getAllGames,
    getGameById,
    createGame,
    updateGame,
    deleteGame,
    deleteAllGames,
    getGameStats
};
