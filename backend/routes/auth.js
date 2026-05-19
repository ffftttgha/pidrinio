const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');
const User = require('../models/User');
const TestResult = require('../models/TestResult');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);

// Публичная статистика сайта
router.get('/stats', async (req, res) => {
    try {
        const [usersCount, testsCount] = await Promise.all([
            User.countDocuments(),
            TestResult.countDocuments()
        ]);
        res.json({ usersCount, testsCount });
    } catch (err) {
        res.status(500).json({ msg: 'Ошибка сервера' });
    }
});

module.exports = router;