const User = require('../models/User');
const Hostel = require('../models/Hostel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { name, email, password, rollNumber, hostel } = req.body;

  try {
    // Check if hostel exists
    const hostelDoc = await Hostel.findOne({ name: hostel });
    if (!hostelDoc) {
      return res.status(400).json({ message: 'Hostel not found' });
    }
    // TODO: Re-enable roll number validation later
    // if (!hostelDoc.validRollNumbers.includes(rollNumber)) {
    //   return res.status(400).json({ message: 'Invalid roll number for this hostel' });
    // }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { rollNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or roll number' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      rollNumber,
      hostel
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, hostel: user.hostel },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, hostel: user.hostel } });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, hostel: user.hostel },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, hostel: user.hostel } });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};