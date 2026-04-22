const mongoose = require('mongoose');

const ProfessionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['it', 'design', 'science', 'business'], required: true },
  description: { type: String, required: true },
  skills: { type: String, required: true },
  education: { type: String, required: true },
  salary_range: String,
  demand: String,
  image_url: String
});

module.exports = mongoose.model('Profession', ProfessionSchema);