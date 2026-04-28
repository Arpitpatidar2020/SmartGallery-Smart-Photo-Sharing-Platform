import api from './api'

export const getAllGroups = () => api.get('/groups')
export const getGroup = (id) => api.get(`/groups/${id}`)
export const createGroup = (formData) =>
  api.post('/groups', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const updateGroup = (id, formData) =>
  api.put(`/groups/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteGroup = (id) => api.delete(`/groups/${id}`)
export const verifyGroupPassword = (id, password) =>
  api.post(`/groups/${id}/verify-password`, { password })
export const addFolder = (id, name) => api.post(`/groups/${id}/folders`, { name })
export const updateFolder = (id, folderId, name) => api.put(`/groups/${id}/folders/${folderId}`, { name })
export const deleteFolder = (id, folderId) => api.delete(`/groups/${id}/folders/${folderId}`)
export const getUserGroups = () => api.get('/groups/user-groups')
export const joinGroup = (password) => api.post('/groups/join', { password })
