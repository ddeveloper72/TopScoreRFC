const router = require('express').Router();
const ctrl = require('../controllers/matchController');

router.get('/', ctrl.getMatches);
router.get('/:id', ctrl.getMatchById);
router.post('/', ctrl.createMatch);
router.put('/:id', ctrl.updateMatch);
router.delete('/:id', ctrl.deleteMatch);

module.exports = router;
