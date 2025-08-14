const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client');
const authenticate = require('../middleware/auth');

router.post('/', authenticate, clientController.createClient);
router.get('/', authenticate, clientController.getClients);
router.get('/all', authenticate, clientController.getAllClients);

module.exports = router;