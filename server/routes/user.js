const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getMe, updateMe, getHostelMembers, getUserById } = require('../controllers/userController');

router.get('/me', auth, getMe);
router.put('/me', auth, updateMe);
router.get('/hostel', auth, getHostelMembers);
router.get('/:id', auth, getUserById);

module.exports = router;