

import api from './api'

export const fetchSupportLangChoices = () => {
  return api.get('supportlang_choices')
}
export const fetchSupports = (params: {
  page: number
  per_page: number
  search: string
}) => {
  return api.get('supports', { params })
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

// Fetch all audio choices
export const fetchAudioStyleChoics = () => {
  return api.get('audio_style_choices')
}

// Fetch all audio styles
export const fetchAudioStyles = (params:{
  page:number;
  per_page:number;
  search:string;
}) => {
  return api.get('audio_styles',{params})
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


// Fetch all trans engines
export const fetchTransEngines = () => {
  return api.get('trans_engines')
}