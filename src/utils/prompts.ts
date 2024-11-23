// src/services/generations.ts

import api from './api'

// OllamaPrompt API
export const fetchOllamaPrompts = () => api.get('/ollama_prompts')
export const fetchOllamaPromptById = (id: number) => api.get(`/ollama_prompts/${id}`)
export const createOllamaPrompt = (data: { prompt_type: string; prompt_text: string }) =>
  api.post('/ollama_prompts', data)
export const updateOllamaPrompt = (
  id: number,
  data: { prompt_type?: string; prompt_text?: string }
) => api.put(`/ollama_prompts/${id}`, data)
export const deleteOllamaPrompt = (id: number) => api.delete(`/ollama_prompts/${id}`)

// StableDiffusionParam API
export const fetchStableDiffusionParams = () => api.get('/stable_diffusion_params')
export const fetchStableDiffusionParamById = (id: number) =>
  api.get(`/stable_diffusion_params/${id}`)
export const createStableDiffusionParam = (data: {
  ollama_prompt_id: number
  positive_prompt?: string
  negative_prompt?: string
  model_choice?: string
  steps?: number
}) => api.post('/stable_diffusion_params', data)
export const updateStableDiffusionParam = (
  id: number,
  data: {
    positive_prompt?: string
    negative_prompt?: string
    model_choice?: string
    steps?: number
  }
) => api.put(`/stable_diffusion_params/${id}`, data)
export const deleteStableDiffusionParam = (id: number) =>
  api.delete(`/stable_diffusion_params/${id}`)
