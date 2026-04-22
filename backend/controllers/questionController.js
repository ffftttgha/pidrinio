const Question = require('../models/Question');

exports.getAll = async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (err) {
    res.status(500).send('Server error');
  }
};