const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    thumbnailPublicId: {
      type: String,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    password: {
      type: String,
      select: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    folders: {
      type: [folderSchema],
      default: [
        { name: 'All Photos', isDefault: true },
        { name: 'Highlights', isDefault: true },
        { name: 'Favorites', isDefault: true },
      ],
    },
  },
  { timestamps: true }
);

// Hash group password before saving
groupSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

groupSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Group', groupSchema);
