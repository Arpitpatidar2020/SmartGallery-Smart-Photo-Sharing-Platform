const Image = require('../models/Image');
const User = require('../models/User');
const Group = require('../models/Group');
const cloudinary = require('../config/cloudinary');

// @desc    Get images for a group (with filter/pagination)
// @route   GET /api/images/group/:groupId
exports.getGroupImages = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { folder, status, page = 1, limit = 30, search, favorited } = req.query;

    // Check permissions
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Allow if public, OR if user is admin, OR if user has joined this group
    const isPublic = group.isPublic;
    const isAdmin = req.user?.role === 'admin';
    const hasJoined = req.user?.joinedGroups?.some(id => id.toString() === groupId.toString());

    if (!isPublic && !isAdmin && !hasJoined) {
      return res.status(403).json({ message: 'Access denied. Please join this group first.' });
    }

    const query = { group: groupId };
    if (favorited === 'true') {
      query.favoritedBy = req.user._id;
    } else if (folder && folder !== 'All Photos') {
      query.folder = folder;
    }
    if (status) query.status = status;
    if (search) {
      query.originalFilename = { $regex: search, $options: 'i' };
    }

    const total = await Image.countDocuments(query);
    const images = await Image.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('uploadedBy', 'name');

    res.json({
      images,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload single image
// @route   POST /api/images/upload
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const { groupId, folder = 'All Photos', status = 'published' } = req.body;

    if (!groupId) {
      return res.status(400).json({ message: 'Group ID is required' });
    }

    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: `smartgallery/groups/${groupId}`,
      resource_type: 'image',
    });

    const image = await Image.create({
      url: result.secure_url,
      publicId: result.public_id,
      group: groupId,
      folder,
      status,
      width: result.width,
      height: result.height,
      size: result.bytes,
      originalFilename: req.file.originalname,
      uploadedBy: req.user._id,
    });

    res.status(201).json(image);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload multiple images (one-shot)
// @route   POST /api/images/upload-bulk
exports.uploadBulk = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    const { groupId, folder = 'All Photos', status = 'published' } = req.body;

    if (!groupId) {
      return res.status(400).json({ message: 'Group ID is required' });
    }

    const uploadedImages = [];
    const errors = [];

    for (const file of req.files) {
      try {
        const fileBase64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        const result = await cloudinary.uploader.upload(fileBase64, {
          folder: `smartgallery/groups/${groupId}`,
          resource_type: 'image',
        });

        const image = await Image.create({
          url: result.secure_url,
          publicId: result.public_id,
          group: groupId,
          folder,
          status,
          width: result.width,
          height: result.height,
          size: result.bytes,
          originalFilename: file.originalname,
          uploadedBy: req.user._id,
        });

        uploadedImages.push(image);
      } catch (err) {
        errors.push({ file: file.originalname, error: err.message });
      }
    }

    res.status(201).json({
      message: `${uploadedImages.length} images uploaded successfully`,
      images: uploadedImages,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update image (status, folder)
// @route   PUT /api/images/:id
exports.updateImage = async (req, res, next) => {
  try {
    const { status, folder, faceDescriptors } = req.body;
    const update = {};
    if (status) update.status = status;
    if (folder) update.folder = folder;
    if (faceDescriptors) update.faceDescriptors = faceDescriptors;

    const image = await Image.findByIdAndUpdate(req.params.id, update, { new: true });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json(image);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete image
// @route   DELETE /api/images/:id
exports.deleteImage = async (req, res, next) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete from Cloudinary
    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    await Image.findByIdAndDelete(req.params.id);

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete multiple images
// @route   POST /api/images/delete-bulk
exports.deleteBulk = async (req, res, next) => {
  try {
    const { imageIds } = req.body;
    if (!imageIds || !Array.isArray(imageIds)) {
      return res.status(400).json({ message: 'Image IDs array is required' });
    }

    const images = await Image.find({ _id: { $in: imageIds } });

    // Delete from Cloudinary
    for (const img of images) {
      if (img.publicId) {
        await cloudinary.uploader.destroy(img.publicId);
      }
    }

    await Image.deleteMany({ _id: { $in: imageIds } });

    res.json({ message: `${images.length} images deleted successfully` });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favorite
// @route   POST /api/images/:id/favorite
exports.toggleFavorite = async (req, res, next) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const userId = req.user._id;
    const index = image.favoritedBy.indexOf(userId);

    if (index > -1) {
      image.favoritedBy.splice(index, 1);
    } else {
      image.favoritedBy.push(userId);
    }

    await image.save();

    res.json({
      isFavorited: index === -1,
      message: index === -1 ? 'Added to favorites' : 'Removed from favorites',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's favorite images
// @route   GET /api/images/favorites
exports.getFavorites = async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;

    const total = await Image.countDocuments({
      favoritedBy: req.user._id,
      status: 'published',
    });

    const images = await Image.find({
      favoritedBy: req.user._id,
      status: 'published',
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      images,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get images matching user's face
// @route   GET /api/images/my-images
exports.getMyImages = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.faceDescriptor || user.faceDescriptor.length === 0) {
      return res.status(400).json({
        message: 'No face descriptor found. Please upload a profile photo with your face visible.',
      });
    }

    // Check if user has joined any groups
    if (!user.joinedGroups || user.joinedGroups.length === 0) {
      return res.json({
        images: [],
        pagination: { total: 0, page: 1, pages: 0 },
        message: 'You have not joined any groups yet. Join a group to see your matched photos.',
      });
    }

    const { page = 1, limit = 30 } = req.query;
    const threshold = 0.5; // Euclidean distance threshold

    // Fetch images ONLY from user's joined groups that have face descriptors
    const allImages = await Image.find({
      status: 'published',
      group: { $in: user.joinedGroups },
      'faceDescriptors.0': { $exists: true },
    });

    // Compare descriptors
    const matchedImages = allImages.filter((image) => {
      return image.faceDescriptors.some((descriptor) => {
        const distance = euclideanDistance(user.faceDescriptor, descriptor);
        return distance < threshold;
      });
    });

    // Paginate results
    const total = matchedImages.length;
    const startIndex = (page - 1) * limit;
    const paginatedImages = matchedImages.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      images: paginatedImages,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all published images (for user portal)
// @route   GET /api/images/all-published
exports.getAllPublished = async (req, res, next) => {
  try {
    const { page = 1, limit = 30, search, group } = req.query;

    const query = { status: 'published' };
    if (search) {
      query.originalFilename = { $regex: search, $options: 'i' };
    }
    if (group) {
      query.group = group;
    }

    const total = await Image.countDocuments(query);
    const images = await Image.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('group', 'name');

    res.json({
      images,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Euclidean distance for face comparison
function euclideanDistance(arr1, arr2) {
  if (arr1.length !== arr2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    sum += Math.pow(arr1[i] - arr2[i], 2);
  }
  return Math.sqrt(sum);
}
