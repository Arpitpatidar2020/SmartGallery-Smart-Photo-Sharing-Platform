import axios from 'axios';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'qwikpic';

/**
 * Uploads a file directly to Cloudinary using an unsigned preset OR a backend signature.
 * @param {File} file - The file to upload
 * @param {String} folder - Optional Cloudinary folder path
 * @param {Object} signedData - Optional { signature, timestamp, apiKey } for signed upload
 * @returns {Promise<Object>} - Cloudinary response data (url, public_id, etc.)
 */
export const uploadToCloudinary = async (file, folder = 'qwikpic', signedData = null) => {
  if (!CLOUD_NAME) {
    throw new Error('Cloudinary Cloud Name is not configured in environment variables.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  if (signedData) {
    // Signed Upload (Supports up to 100MB)
    formData.append('api_key', signedData.apiKey);
    formData.append('timestamp', signedData.timestamp);
    formData.append('signature', signedData.signature);
  } else {
    // Unsigned Upload (Supports ~10MB)
    formData.append('upload_preset', UPLOAD_PRESET);
  }

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData
    );
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || 'Failed to upload to Cloudinary';
    console.error('Cloudinary Upload Error Details:', error.response?.data); // Exact error from Cloudinary
    throw new Error(errorMsg);
  }
};
