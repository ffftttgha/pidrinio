const express = require('express');
const router = express.Router();

const User = require('../models/User');
const TestResult = require('../models/TestResult');
const Profession = require('../models/Profession');

router.get('/', async (req, res) => {
    try {
        const usersCount = await User.countDocuments();
        const testsCount = await TestResult.countDocuments();
        const professionsCount = await Profession.countDocuments();

        res.json({
            users: usersCount,
            tests: testsCount,
            professions: professionsCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router;