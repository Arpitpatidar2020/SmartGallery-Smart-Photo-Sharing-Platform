const Group = require('../models/Group');
const Image = require('../models/Image');
const cloudinary = require('../config/cloudinary');

// @desc    Get all groups
// @route   GET /api/groups
exports.getAllGroups = async (req, res, next) => {
  try {
    const groups = await Group.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // Add image count for each group
    const groupsWithCounts = await Promise.all(
      groups.map(async (group) => {
        const imageCount = await Image.countDocuments({
          group: group._id,
          status: 'published',
        });
        return { ...group.toObject(), imageCount };
      })
    );

    res.json(groupsWithCounts);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single group
// @route   GET /api/groups/:id
exports.getGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id).populate('createdBy', 'name');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.json(group);
  } catch (error) {
    next(error);
  }
};

// @desc    Create group
// @route   POST /api/groups
exports.createGroup = async (req, res, next) => {
  try {
    const { name, isPublic, password } = req.body;
    let thumbnail = '';
    let thumbnailPublicId = '';

    // Upload thumbnail if provided
    if (req.file) {
      const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const result = await cloudinary.uploader.upload(fileBase64, {
        folder: 'smartgallery/thumbnails',
        resource_type: 'image',
      });
      thumbnail = result.secure_url;
      thumbnailPublicId = result.public_id;
    }

    const groupData = {
      name,
      thumbnail,
      thumbnailPublicId,
      isPublic: isPublic === 'true' || isPublic === true,
      createdBy: req.user._id,
    };

    if (!groupData.isPublic && password) {
      groupData.password = password;
    }

    const group = await Group.create(groupData);

    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
};

// @desc    Update group
// @route   PUT /api/groups/:id
exports.updateGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const { name, isPublic, password } = req.body;

    if (name) group.name = name;
    if (isPublic !== undefined) {
      group.isPublic = isPublic === 'true' || isPublic === true;
    }
    if (!group.isPublic && password) {
      group.password = password;
    }

    // Update thumbnail if new file provided
    if (req.file) {
      if (group.thumbnailPublicId) {
        await cloudinary.uploader.destroy(group.thumbnailPublicId);
      }
      const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const result = await cloudinary.uploader.upload(fileBase64, {
        folder: 'smartgallery/thumbnails',
        resource_type: 'image',
      });
      group.thumbnail = result.secure_url;
      group.thumbnailPublicId = result.public_id;
    }

    await group.save();

    res.json(group);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete group and all its images
// @route   DELETE /api/groups/:id
exports.deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Delete all images from Cloudinary
    const images = await Image.find({ group: group._id });
    for (const img of images) {
      if (img.publicId) {
        await cloudinary.uploader.destroy(img.publicId);
      }
    }

    // Delete thumbnail from Cloudinary
    if (group.thumbnailPublicId) {
      await cloudinary.uploader.destroy(group.thumbnailPublicId);
    }

    // Delete all images from DB
    await Image.deleteMany({ group: group._id });

    // Delete group
    await Group.findByIdAndDelete(group._id);

    res.json({ message: 'Group and all images deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify group password
// @route   POST /api/groups/:id/verify-password
exports.verifyGroupPassword = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id).select('+password');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.isPublic) {
      return res.json({ message: 'Group is public, no password needed' });
    }

    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const isMatch = await group.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect group password' });
    }

    res.json({ message: 'Password verified successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add folder to group
// @route   POST /api/groups/:id/folders
exports.addFolder = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Folder name is required' });
    }

    // Check if folder already exists
    const exists = group.folders.some((f) => f.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      return res.status(400).json({ message: 'Folder already exists' });
    }

    group.folders.push({ name, isDefault: false });
    await group.save();

    res.json(group);
  } catch (error) {
    next(error);
  }
};

// @desc    Join group by password
// @route   POST /api/groups/join
exports.joinGroup = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Group password is required' });
    }

    const User = require('../models/User');
    const user = await User.findById(req.user._id);

    // Find all private groups to check password
    const privateGroups = await Group.find({ isPublic: false }).select('+password');
    
    let matchedGroup = null;
    for (const group of privateGroups) {
      const isMatch = await group.comparePassword(password);
      if (isMatch) {
        matchedGroup = group;
        break;
      }
    }

    if (!matchedGroup) {
      return res.status(404).json({ message: 'Invalid password or no such group exists' });
    }

    // Check if duplicate
    if (user.joinedGroups.includes(matchedGroup._id)) {
      return res.status(400).json({ message: 'Group already added to your list' });
    }

    user.joinedGroups.push(matchedGroup._id);
    await user.save();

    res.json({
      message: 'Group joined successfully',
      group: {
        _id: matchedGroup._id,
        name: matchedGroup.name,
        thumbnail: matchedGroup.thumbnail
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get groups joined by user
// @route   GET /api/groups/user-groups
exports.getUserGroups = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id).populate({
      path: 'joinedGroups',
      select: 'name thumbnail isPublic createdAt',
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add image count for each group
    const groupsWithCounts = await Promise.all(
      user.joinedGroups.map(async (group) => {
        const imageCount = await Image.countDocuments({
          group: group._id,
          status: 'published',
        });
        return { ...group.toObject(), imageCount };
      })
    );

    res.json(groupsWithCounts);
  } catch (error) {
    next(error);
  }
};
// @desc    Update folder name
// @route   PUT /api/groups/:id/folders/:folderId
exports.updateFolder = async (req, res, next) => {
  try {
    const { id, folderId } = req.params;
    const { name } = req.body;

    if (!name) return res.status(400).json({ message: 'Folder name is required' });

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const folder = group.folders.id(folderId);
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    if (folder.isDefault) {
      return res.status(400).json({ message: 'Cannot rename default folders' });
    }

    const oldName = folder.name;
    folder.name = name;

    // Update all images associated with this folder
    await Image.updateMany({ group: id, folder: oldName }, { folder: name });

    await group.save();
    res.json(group);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete folder
// @route   DELETE /api/groups/:id/folders/:folderId
exports.deleteFolder = async (req, res, next) => {
  try {
    const { id, folderId } = req.params;

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const folder = group.folders.id(folderId);
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    if (folder.isDefault) {
      return res.status(400).json({ message: 'Cannot delete default folders' });
    }

    const folderName = folder.name;

    // Remove folder from the array
    group.folders.pull(folderId);

    // Update images to move to "All Photos"
    await Image.updateMany({ group: id, folder: folderName }, { folder: 'All Photos' });

    await group.save();
    res.json(group);
  } catch (error) {
    next(error);
  }
};
