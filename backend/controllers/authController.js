const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { login, password } = req.body;
        if (!login || !password) return res.status(400).json({ msg: 'Заполните все поля' });
        if (login.length < 3) return res.status(400).json({ msg: 'Логин должен быть не менее 3 символов' });
        if (password.length < 6) return res.status(400).json({ msg: 'Пароль должен быть не менее 6 символов' });

        let user = await User.findOne({ login });
        if (user) return res.status(400).json({ msg: 'Пользователь с таким логином уже существует' });

        user = new User({ login, password });
        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) return res.status(500).json({ msg: 'Ошибка при создании токена' });
            res.json({
                token,
                user: {
                    id: user.id,
                    login: user.login,
                    testsTaken: user.testsTaken,
                    lastResult: user.lastResult,
                    createdAt: user.createdAt
                }
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Ошибка сервера' });
    }
};

exports.login = async (req, res) => {
    try {
        const { login, password } = req.body;
        if (!login || !password) return res.status(400).json({ msg: 'Заполните все поля' });

        const user = await User.findOne({ login });
        if (!user) return res.status(400).json({ msg: 'Неверный логин или пароль' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ msg: 'Неверный логин или пароль' });

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) return res.status(500).json({ msg: 'Ошибка при создании токена' });
            res.json({
                token,
                user: {
                    id: user.id,
                    login: user.login,
                    testsTaken: user.testsTaken,
                    lastResult: user.lastResult,
                    createdAt: user.createdAt
                }
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Ошибка сервера' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'Пользователь не найден' });
        res.json({
            id: user.id,
            login: user.login,
            testsTaken: user.testsTaken,
            lastResult: user.lastResult,
            createdAt: user.createdAt
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Ошибка сервера' });
    }
};