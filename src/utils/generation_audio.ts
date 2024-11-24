// src/services/genAudios.ts

import api from './api'

// Fetch all GenAudios
export const fetchGenAudios = () => {
  return api.get('gen_audios')
}

// Fetch a single GenAudio by ID
export const fetchGenAudio = (id: number) => {
  return api.get(`gen_audios/${id}`)
}

// Create a new GenAudio
export const createGenAudio = (data: {
  chapter_id: number
  audio_style_id: number
  speech_rate: string
}) => {
  return api.post('gen_audios', data)
}

// Delete a GenAudio by ID
export const deleteGenAudio = (id: number) => {
  return api.delete(`gen_audios/${id}`)
}
