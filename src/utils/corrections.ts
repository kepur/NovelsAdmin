import api from './api'

// Fetch all corrections
export const fetchUserCorrections = () => {
  return api.get('user_corrections')
}

// Create a new correction
export const createUserCorrection = (data: {
  machine_translation_id: number
  corrected_content: string
}) => {
  return api.post('user_corrections', data)
}

// Update an existing correction
export const updateUserCorrection = (id: number, data: any) => {
  return api.put(`user_corrections/${id}`, data)
}

// Delete a correction
export const deleteUserCorrection = (id: number) => {
  return api.delete(`user_corrections/${id}`)
}
