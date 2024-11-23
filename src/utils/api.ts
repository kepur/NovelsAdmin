// src/services/api.ts
import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { storeToRefs } from 'pinia'
import { baseURL_dev } from '@/config/baseConfig'
import router from '@/router' // 导入路由

const api = axios.create({
  baseURL: baseURL_dev // 基础 API 地址
})

// 请求拦截器，自动添加 JWT token 到请求头
api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  const { token } = storeToRefs(authStore)

  // 如果请求中没有自定义 Authorization 头，则自动添加访问 token
  if (!config.headers.Authorization && token.value && typeof token.value === 'string') {
    config.headers.Authorization = `Bearer ${token.value}`
  }
  return config
})

// 响应拦截器，处理 401 错误
api.interceptors.response.use(
  (response) => {
    // 请求成功，直接返回响应
    return response
  },
  (error) => {
    const authStore = useAuthStore()
    const { clearAuth } = authStore

    // 检查错误响应状态码是否为 401
    if (error.response && error.response.status === 401) {
      // 清除本地身份验证状态
      clearAuth()
      // 重定向到登录页面
      router.push('/login')
    }
    // 返回被拒绝的 Promise，以便在需要的地方继续处理错误
    return Promise.reject(error)
  }
)

export default api
