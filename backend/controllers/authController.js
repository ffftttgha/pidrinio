const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { login, password } = req.body;
    let user = await User.findOne({ login });
    if (user) return res.status(400).json({ msg: 'Пользователь уже существует' });
    user = new User({ login, password });
    await user.save();
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Ошибка при создании токена' });
      }
      res.json({ token, user: { id: user.id, login: user.login, testsTaken: user.testsTaken, lastResult: user.lastResult } });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Ошибка сервера' });
  }
};

exports.login = async (req, res) => {
  try {
    const { login, password } = req.body;
    const user = await User.findOne({ login });
    if (!user) return res.status(400).json({ msg: 'Неверные учётные данные' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: 'Неверные учётные данные' });
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Ошибка при создании токена' });
      }
      res.json({ token, user: { id: user.id, login: user.login, testsTaken: user.testsTaken, lastResult: user.lastResult } });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Ошибка сервера' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Ошибка сервера' });
  }
};