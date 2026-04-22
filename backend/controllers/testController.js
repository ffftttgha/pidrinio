const TestResult = require('../models/TestResult');
const User = require('../models/User');

exports.submit = async (req, res) => {
  try {
    const { resultCategory } = req.body;
    const userId = req.user.id;
    const newResult = new TestResult({ userId, resultCategory });
    await newResult.save();
    await User.findByIdAndUpdate(userId, {
      $inc: { testsTaken: 1 },
      $set: { lastResult: resultCategory }
    });
    res.json({ msg: 'Результат сохранён' });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.getHistory = async (req, res) => {
  try {
    const results = await TestResult.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).send('Server error');
  }
};