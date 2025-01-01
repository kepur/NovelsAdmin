import api from './api'

export const FetchGenImages=(params:{
    page:number;
    per_page:number;
    search:string;
})=>{
  return api.get('gen_imgs',{params})
}

export const fetchGenImage = (id: number) => {
    return api.get(`gen_imgs/${id}`)
}


// Create a new GenAudio
export const createGenImage = (data: {
    chapter_id: number
    num_segments: number
    sd_id: number
  }) => {
    return api.post('gen_imgs', data)
  }
  
  // Delete a GenAudio by ID
  export const deleteGenImage = (id: number) => {
    return api.delete(`gen_imgs/${id}`)
  }
  