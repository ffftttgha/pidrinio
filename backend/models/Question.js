const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{
    text: String,
    cat: { type: String, enum: ['it', 'design', 'science', 'business'] }
  }]
});

module.exports = mongoose.model('Question', QuestionSchema);