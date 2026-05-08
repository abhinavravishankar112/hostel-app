const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// Get chat history with a specific user
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { from: req.user.id, to: req.params.userId },
        { from: req.params.userId, to: req.user.id }
      ]
    }).sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching messages' });
  }
});

module.exports = router;
