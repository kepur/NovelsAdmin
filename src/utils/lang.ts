// src/services/supports.ts

import api from './api'

export const fetchSupports = () => {
  return api.get('supports')
}

export const createSupport = (data: { language_code: string; language_name: string }) => {
  return api.post('supports', data)
}

export const updateSupport = (id: number, data: any) => {
  return api.put(`supports/${id}`, data)
}

export const deleteSupport = (id: number) => {
  return api.delete(`supports/${id}`)
}

// Fetch all audio styles
export const fetchAudioStyles = () => {
  return api.get('audio_styles')
}

// Create a new audio style
export const createAudioStyle = (data: {
  language_code_id: number
  style_name: string
  voice_type: string
}) => {
  return api.post('audio_styles', data)
}

// Update an existing audio style
export const updateAudioStyle = (id: number, data: any) => {
  return api.put(`audio_styles/${id}`, data)
}

// Delete an audio style
export const deleteAudioStyle = (id: number) => {
  return api.delete(`audio_styles/${id}`)
}
