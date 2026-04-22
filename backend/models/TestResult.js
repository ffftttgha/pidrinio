const mongoose = require('mongoose');

const TestResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resultCategory: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TestResult', TestResultSchema);