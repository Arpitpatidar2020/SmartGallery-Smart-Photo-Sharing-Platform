import api from './api'

export const getGroupImages = (groupId, params) =>
  api.get(`/images/group/${groupId}`, { params })
export const uploadImage = (data) => api.post('/images/upload', data)
export const uploadBulk = (data) => api.post('/images/upload-bulk', data)
export const updateImage = (id, data) => api.put(`/images/${id}`, data)
export const deleteImage = (id) => api.delete(`/images/${id}`)
export const deleteBulkImages = (imageIds) => api.post('/images/delete-bulk', { imageIds })
export const toggleFavorite = (id) => api.post(`/images/${id}/favorite`)
export const getFavorites = (params) => api.get('/images/favorites', { params })
export const getMyImages = (params) => api.get('/images/my-images', { params })
export const getAllPublished = (params) => api.get('/images/all-published', { params })
export const getSignature = (folder) => api.get('/images/signature', { params: { folder } })
