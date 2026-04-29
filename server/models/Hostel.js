const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  validRollNumbers: [String]
});

module.exports = mongoose.model('Hostel', hostelSchema);