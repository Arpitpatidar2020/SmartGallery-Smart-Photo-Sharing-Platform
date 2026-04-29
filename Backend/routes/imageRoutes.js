const express = require('express');
const router = express.Router();
const {
  getGroupImages,
  uploadImage,
  uploadBulk,
  updateImage,
  deleteImage,
  deleteBulk,
  toggleFavorite,
  getFavorites,
  getMyImages,
  getAllPublished,
  getCloudinarySignature,
} = require('../controllers/imageController');
const { auth, optionalAuth } = { 
  auth: require('../middleware/auth'), 
  optionalAuth: require('../middleware/auth').optionalAuth 
};
const admin = require('../middleware/admin');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');

// User routes (must come before parameterized routes)
router.get('/favorites', auth, getFavorites);
router.get('/my-images', auth, getMyImages);
router.get('/all-published', auth, getAllPublished);
router.get('/signature', auth, getCloudinarySignature);

// Group images
router.get('/group/:groupId', optionalAuth, getGroupImages);

// Upload
router.post('/upload', auth, admin, uploadImage);
router.post('/upload-bulk', auth, admin, uploadBulk);

// Bulk delete
router.post('/delete-bulk', auth, admin, deleteBulk);

// Single image operations
router.put('/:id', auth, admin, updateImage);
router.delete('/:id', auth, admin, deleteImage);
router.post('/:id/favorite', auth, toggleFavorite);

module.exports = router;
