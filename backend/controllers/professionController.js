const Profession = require('../models/Profession');

exports.getAll = async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};
    if (category && category !== 'all') filter.category = category;
    const professions = await Profession.find(filter);
    res.json(professions);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.getOne = async (req, res) => {
  try {
    const profession = await Profession.findById(req.params.id);
    if (!profession) return res.status(404).json({ msg: 'Профессия не найдена' });
    res.json(profession);
  } catch (err) {
    res.status(500).send('Server error');
  }
};