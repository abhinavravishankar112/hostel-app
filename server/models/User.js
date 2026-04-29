const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  hostel: { type: String, required: true },
  profile: {
    age: Number,
    course: String,
    year: Number,
    bio: String,
    sleepSchedule: {
      type: String,
      enum: ['early bird', 'night owl', 'flexible']
    },
    studyHabits: {
      type: String,
      enum: ['quiet studier', 'group studier', 'flexible']
    },
    socialStyle: {
      type: String,
      enum: ['introverted', 'extroverted', 'mixed']
    },
    hobbies: [String],
    instagram: String,
    profilePic: String
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);