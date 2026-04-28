const express = require('express');
const router = express.Router();
const {
  getAllGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  verifyGroupPassword,
  addFolder,
  updateFolder,
  deleteFolder,
  joinGroup,
  getUserGroups,
} = require('../controllers/groupController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { uploadSingle } = require('../middleware/upload');

router.get('/', getAllGroups);
router.get('/user-groups', auth, getUserGroups);
router.post('/join', auth, joinGroup);
router.get('/:id', getGroup);
router.post('/', auth, admin, uploadSingle, createGroup);
router.put('/:id', auth, admin, uploadSingle, updateGroup);
router.delete('/:id', auth, admin, deleteGroup);
router.post('/:id/verify-password', verifyGroupPassword);
router.post('/:id/folders', auth, admin, addFolder);
router.put('/:id/folders/:folderId', auth, admin, updateFolder);
router.delete('/:id/folders/:folderId', auth, admin, deleteFolder);

module.exports = router;
