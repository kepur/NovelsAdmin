import api from './api'

// Fetch all convert histories
export const fetchConvertHistories = (params:{
  page:number;
  per_page:number;
  search:string
}) => {
  return api.get('convert_histories',{params})
}


// Update an existing convert history
export const updateConvertHistory = (id: number, data: any) => {
  return api.put(`convert_histories/${id}`, data)
}

// Delete a convert history
export const deleteConvertHistory = (id: number) => {
  return api.delete(`convert_histories/${id}`)
}
