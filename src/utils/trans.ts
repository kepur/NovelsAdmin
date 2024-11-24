import api from './api'

// Fetch all translations
export const fetchMachineTranslations = () => {
  return api.get('machine_translations')
}

// Create a new translation
export const createMachineTranslation = (data: {
  chapter_id: number
  translated_content: string
  source_language: string
  target_language: string
  translation_engine: string
}) => {
  return api.post('machine_translations', data)
}

// Update an existing translation
export const updateMachineTranslation = (id: number, data: any) => {
  return api.put(`machine_translations/${id}`, data)
}

// Delete a translation
export const deleteMachineTranslation = (id: number) => {
  return api.delete(`machine_translations/${id}`)
}
