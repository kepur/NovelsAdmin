import api from './api'

// Fetch all convert histories
export const fetchConvertHistories = () => {
  return api.get('convert_histories')
}

// Create a new convert history
export const createConvertHistory = (data: {
  chapter_id: number
  target_language_id: number
  is_translated: boolean
  is_audio_generated: boolean
  is_video_generated: boolean
}) => {
  return api.post('convert_histories', data)
}

// Update an existing convert history
export const updateConvertHistory = (id: number, data: any) => {
  return api.put(`convert_histories/${id}`, data)
}

// Delete a convert history
export const deleteConvertHistory = (id: number) => {
  return api.delete(`convert_histories/${id}`)
}
