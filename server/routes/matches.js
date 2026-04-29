const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  sendRequest,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  getIncomingRequests,
  getSentRequests
} = require('../controllers/matchController');

router.post('/request/:id', auth, sendRequest);
router.put('/accept/:id', auth, acceptRequest);
router.put('/reject/:id', auth, rejectRequest);
router.delete('/cancel/:id', auth, cancelRequest);
router.get('/requests', auth, getIncomingRequests);
router.get('/sent', auth, getSentRequests);

module.exports = router;