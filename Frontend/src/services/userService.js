import api from './api'

export const updateProfile = (data) => api.put('/users/profile', data)
export const uploadProfileImage = (data) => 
  api.post('/users/profile-image', data)
export const deleteProfileImage = () => api.delete('/users/profile-image')
export const storeFaceDescriptor = (descriptor) =>
  api.post('/users/profile/face-descriptor', { descriptor })
export const getStats = () => api.get('/users/stats')
export const getAllUsers = () => api.get('/users')
