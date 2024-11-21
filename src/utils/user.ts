import api from './api'

// 用户 API
export const fetchUsers = () => api.get('/users')
export const createUser = (data: { username: string; email: string; password: string }) =>
  api.post('/users', data)
export const updateUser = (id: number, data: { username: string; email: string }) =>
  api.put(`/users/${id}`, data)
export const deleteUser = (id: number) => api.delete(`/users/${id}`)

// 用户权限 API
export const fetchRoles = () => api.get('/roles')
export const createRole = (data: { name: string; description: string }) => api.post('/roles', data)
export const deleteRole = (id: number) => api.delete(`/roles/${id}`)
export const fetchPermissions = () => api.get('/permissions')
