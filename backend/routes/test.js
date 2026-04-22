const express = require('express');
const router = express.Router();
const { submit, getHistory } = require('../controllers/testController');
const auth = require('../middleware/auth');

router.post('/submit', auth, submit);
router.get('/history', auth, getHistory);

module.exports = router;