import api from './api'

// 评论 API
export const fetchComments = () => api.get('/comments')
export const createComment = (data: { chapter_id: number; user_id: number; content: string }) =>
  api.post('/comments', data)
export const deleteComment = (id: number) => api.delete(`/comments/${id}`)

// 收藏 API
export const fetchUserCollections = () => api.get('/user_collects')
export const createUserCollection = (data: { novel_id: number; user_id: number }) =>
  api.post('/user_collects', data)
export const deleteUserCollection = (id: number) => api.delete(`/user_collects/${id}`)

// 点赞 API
export const fetchUserLikes = () => api.get('/user_likes')
export const createUserLike = (data: { novel_id: number; user_id: number }) =>
  api.post('/user_likes', data)
export const deleteUserLike = (id: number) => api.delete(`/user_likes/${id}`)
