const express = require('express');
const router = express.Router();
const { getAll } = require('../controllers/questionController');

router.get('/', getAll);

module.exports = router;