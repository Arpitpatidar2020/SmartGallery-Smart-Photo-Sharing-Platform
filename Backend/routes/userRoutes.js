const express = require('express');
const router = express.Router();
const {
  updateProfile,
  uploadProfileImage,
  removeProfileImage,
  storeFaceDescriptor,
  getStats,
  getAllUsers,
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { uploadSingle } = require('../middleware/upload');

router.get('/', auth, admin, getAllUsers);
router.put('/profile', auth, updateProfile);
router.post('/profile-image', auth, uploadSingle, uploadProfileImage);
router.delete('/profile-image', auth, removeProfileImage);
router.post('/profile/face-descriptor', auth, storeFaceDescriptor);
router.get('/stats', auth, admin, getStats);

module.exports = router;
