const mongoose = require('mongoose');

const TestResultSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    profession: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TestResult', TestResultSchema);