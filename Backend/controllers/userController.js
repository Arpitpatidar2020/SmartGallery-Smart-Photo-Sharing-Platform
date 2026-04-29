const User = require('../models/User');
const Group = require('../models/Group');
const Image = require('../models/Image');
const cloudinary = require('../config/cloudinary');

// @desc    Update user profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    const { name, email, password } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile image (metadata from direct upload)
// @route   POST /api/users/profile-image
exports.uploadProfileImage = async (req, res, next) => {
  try {
    const { url, publicId } = req.body;

    if (!url || !publicId) {
      return res.status(400).json({ message: 'URL and publicId are required' });
    }

    const user = await User.findById(req.user._id);

    // Delete old profile image from Cloudinary if exists
    if (user.profileImagePublicId) {
      await cloudinary.uploader.destroy(user.profileImagePublicId).catch(err => console.log('Cleanup failed:', err));
    }

    user.profileImage = url;
    user.profileImagePublicId = publicId;
    await user.save({ validateBeforeSave: false });

    res.json({
      profileImage: url,
      message: 'Profile image updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Store face descriptor
// @route   POST /api/users/profile/face-descriptor
exports.storeFaceDescriptor = async (req, res, next) => {
  try {
    const { descriptor } = req.body;

    if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return res.status(400).json({ message: 'Invalid face descriptor. Must be 128-d float array.' });
    }

    await User.findByIdAndUpdate(req.user._id, { faceDescriptor: descriptor });

    res.json({ message: 'Face descriptor stored successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/users/stats
exports.getStats = async (req, res, next) => {
  try {
    const [totalGroups, publishedImages, draftImages, activeAdmins] = await Promise.all([
      Group.countDocuments(),
      Image.countDocuments({ status: 'published' }),
      Image.countDocuments({ status: 'draft' }),
      User.countDocuments({ role: 'admin' }),
    ]);

    res.json({
      totalGroups,
      publishedImages,
      draftImages,
      activeAdmins,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove profile image
// @route   DELETE /api/users/profile-image
exports.removeProfileImage = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.profileImagePublicId) {
      return res.status(400).json({ message: 'No profile image to remove' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(user.profileImagePublicId);

    // Update user document
    user.profileImage = '';
    user.profileImagePublicId = '';
    await user.save({ validateBeforeSave: false });

    res.json({ message: 'Profile image removed successfully' });
  } catch (error) {
    next(error);
  }
};
// @desc    Get all users (Admin only)
// @route   GET /api/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select('-password -faceDescriptor')
      .sort({ createdAt: -1 });

    // Add a flag to indicate if face setup is complete
    const usersWithStatus = await Promise.all(users.map(async (u) => {
      const userObj = u.toObject();
      // We check the original document to see if faceDescriptor exists without fetching it in the list
      const fullUser = await User.findById(u._id).select('faceDescriptor');
      userObj.isFaceRegistered = !!(fullUser.faceDescriptor && fullUser.faceDescriptor.length === 128);
      return userObj;
    }));

    res.json(usersWithStatus);
  } catch (error) {
    next(error);
  }
};
