const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    publicId: {
      type: String,
      required: [true, 'Cloudinary public ID is required'],
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    folder: {
      type: String,
      default: 'All Photos',
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'published',
    },
    width: Number,
    height: Number,
    size: Number,
    originalFilename: String,
    faceDescriptors: {
      type: [[Number]],
      default: [],
    },
    favoritedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
imageSchema.index({ group: 1, folder: 1, status: 1 });
imageSchema.index({ favoritedBy: 1 });

module.exports = mongoose.model('Image', imageSchema);
