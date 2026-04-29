const User = require('../models/User');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profile: req.body.profile },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getHostelMembers = async (req, res) => {
  try {
    const users = await User.find({ hostel: req.user.hostel }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Make sure the requested user is in the same hostel
    if (user.hostel !== req.user.hostel) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};