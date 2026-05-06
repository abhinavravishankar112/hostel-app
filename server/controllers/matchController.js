const MatchRequest = require('../models/MatchRequest');
const User = require('../models/User');

exports.sendRequest = async (req, res) => {
  try {
    const toUser = await User.findById(req.params.id);
    if (!toUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Can't send request to yourself
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }

    // Must be in the same hostel
    if (toUser.hostel !== req.user.hostel) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if request already exists between these two users
    const existingRequest = await MatchRequest.findOne({
      $or: [
        { from: req.user.id, to: req.params.id },
        { from: req.params.id, to: req.user.id }
      ]
    });
    if (existingRequest) {
      return res.status(400).json({ message: 'A request already exists between you two' });
    }

    // Check if either user is already matched
    const alreadyMatched = await MatchRequest.findOne({
      $or: [
        { from: req.user.id, status: 'accepted' },
        { to: req.user.id, status: 'accepted' },
        { from: req.params.id, status: 'accepted' },
        { to: req.params.id, status: 'accepted' }
      ]
    });
    if (alreadyMatched) {
      return res.status(400).json({ message: 'One or both users are already matched' });
    }

    const request = new MatchRequest({
      from: req.user.id,
      to: req.params.id
    });

    await request.save();
    res.status(201).json(request);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const request = await MatchRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only the recipient can accept
    if (request.to.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is no longer pending' });
    }

    request.status = 'accepted';
    await request.save();
    res.json(request);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const request = await MatchRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only the recipient can reject
    if (request.to.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is no longer pending' });
    }

    request.status = 'rejected';
    await request.save();
    res.json(request);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    const request = await MatchRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only the sender can cancel
    if (request.from.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending requests' });
    }

    await request.deleteOne();
    res.json({ message: 'Request cancelled' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getIncomingRequests = async (req, res) => {
  try {
    const requests = await MatchRequest.find({
      to: req.user.id,
      status: { $in: ['pending', 'accepted'] }
    }).populate('from', '-password');
    res.json(requests);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getSentRequests = async (req, res) => {
  try {
    const requests = await MatchRequest.find({ from: req.user.id })
      .populate('to', '-password')
    res.json(requests)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}