const router = require('express').Router();
const ctrl = require('../controllers/matchController');

// Match CRUD operations
router.get('/', ctrl.getMatches);
router.get('/:id', ctrl.getMatchById);
router.post('/', ctrl.createMatch);
router.put('/:id', ctrl.updateMatch);
router.delete('/:id', ctrl.deleteMatch);

// Match Events CRUD operations
router.post('/:id/events', ctrl.addMatchEvent);           // Add new event
router.get('/:id/events', ctrl.getMatchEvents);           // Get all events for match
router.put('/:id/events/:eventId', ctrl.updateMatchEvent); // Update specific event
router.delete('/:id/events/:eventId', ctrl.deleteMatchEvent); // Delete specific event

module.exports = router;
