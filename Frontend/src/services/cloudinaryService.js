import axios from 'axios';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'qwikpic';

/**
 * Uploads a file directly to Cloudinary using an unsigned preset.
 * @param {File} file - The file to upload
 * @param {String} folder - Optional Cloudinary folder path
 * @returns {Promise<Object>} - Cloudinary response data (url, public_id, etc.)
 */
export const uploadToCloudinary = async (file, folder = 'qwikpic') => {
  if (!CLOUD_NAME) {
    throw new Error('Cloudinary Cloud Name is not configured in environment variables.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData
    );
    return response.data;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to upload to Cloudinary');
  }
};
