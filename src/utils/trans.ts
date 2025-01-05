import api from './api'

// Fetch all translations
export const fetchMachineTranslations = (params:{
  page: number
  per_page: number
  search: string
}
) => {
  return api.get('machine_translations',{ params })
}

// Fetch all translationsChoices
export const fetchMachineTransChoices= () => {
  return api.get('machine_translations_choices')
}
// Create a new translation
export const createMachineTranslation = (data: {
  chapter_id: number
  source_language: string
  target_language: string
  trans_engine: string
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
