const User = require('../models/User');
const { computeCompatibility } = require('../utils/compatibility');

const ENUM_FIELDS = ['sleepSchedule', 'studyHabits', 'socialStyle'];

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateMe = async (req, res) => {
  if (!req.body.profile) {
    return res.status(400).json({ message: 'Profile data is required' });
  }

  try {
    const profile = { ...req.body.profile };

    // Unselected dropdowns arrive as '' — store them as unset rather than an invalid enum
    for (const field of ENUM_FIELDS) {
      if (profile[field] === '') profile[field] = undefined;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profile },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getHostelMembers = async (req, res) => {
  try {
    const [me, users] = await Promise.all([
      User.findById(req.user.id).select('profile').lean(),
      User.find({ hostel: req.user.hostel }).select('-password').lean()
    ]);

    const members = users.map((member) => {
      if (member._id.toString() === req.user.id) return member;
      // The breakdown is only shown on the profile page, so keep the list light
      const { breakdown, ...compatibility } = computeCompatibility(me?.profile, member.profile);
      return { ...member, compatibility };
    });

    res.json(members);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Make sure the requested user is in the same hostel
    if (user.hostel !== req.user.hostel) {
      return res.status(403).json({ message: 'Access denied' });
    }
    // Nothing to compare against on your own profile
    if (user._id.toString() === req.user.id) {
      return res.json(user);
    }

    const me = await User.findById(req.user.id).select('profile').lean();
    res.json({ ...user, compatibility: computeCompatibility(me?.profile, user.profile) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};