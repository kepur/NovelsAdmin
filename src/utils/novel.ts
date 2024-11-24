import api from './api'

// 获取所有小说，支持字段选择
export const fetchNovels = (fields?: string[]) => {
  return api.get('novels', {
    params: {
      fields: fields ? fields.join(',') : undefined
    }
  })
}

export const createNovel = (data: {
  name: string
  description?: string
  language: number
  author_id?: number
}) => {
  return api.post('novels', data)
}

export const updateNovel = (id: number, data: any) => {
  return api.put('novels/' + `${id}`, data)
}

export const deleteNovel = (id: number) => {
  return api.delete('novels/' + `${id}`)
}

export const fetchLanguages = () => {
  return api.get('supports')
}

export const fetchUsers = () => {
  return api.get('users')
}

// Fetch all chapters
export const fetchChapters = () => {
  return api.get('novel_chapters')
}

// Create a new chapter
export const createChapter = (data: {
  novel_id: number
  chapter_number: number
  title: string
  content: string
}) => {
  return api.post('novel_chapters', data)
}

// Fetch chapters for a specific novel
export const fetchChaptersByNovel = (novelId: number) => {
  return api.get(`novels/${novelId}/chapters`)
}

// Update an existing chapter
export const updateChapter = (id: number, data: any) => {
  return api.put(`novel_chapters/${id}`, data)
}

// Delete a chapter
export const deleteChapter = (id: number) => {
  return api.delete(`novel_chapters/${id}`)
}

// NovelStyles
export const fetchStyles = () => {
  return api.get('novel_styles')
}

export const createStyle = (data: { name: string; description?: string }) => {
  return api.post('novel_styles', data)
}

export const updateStyle = (id: number, data: any) => {
  return api.put(`novel_styles/${id}`, data)
}

export const deleteStyle = (id: number) => {
  return api.delete(`novel_styles/${id}`)
}
