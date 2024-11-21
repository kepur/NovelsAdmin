import api from '@/utils/api'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import router from '@/router' // 确保引入 Vue Router 实例

export const useAuthStore = defineStore('auth', () => {
  const user = ref<string | null>(null)
  const token = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)

  // 用户登录
  const login = async (username: string, password: string): Promise<void> => {
    try {
      const response = await api.post('/login', { username, password })

      if (response.data.access_token && response.data.message.includes('Logged in')) {
        token.value = response.data.access_token
        refreshToken.value = response.data.refresh_token
        user.value = username

        // 存储 token 到 localStorage
        localStorage.setItem('token', token.value || '')
        localStorage.setItem('refreshToken', refreshToken.value || '')

        // 跳转到首页
        router.push('/')
      } else {
        throw new Error(response.data.message || 'Login failed, no token returned')
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw new Error('Login failed')
    }
  }

  // 用户注销
  const logout = async (): Promise<void> => {
    try {
      if (token.value) {
        await api.post(
          '/logout/revoke_access_token',
          {},
          {
            headers: { Authorization: `Bearer ${token.value}` }
          }
        )
      }
      if (refreshToken.value) {
        await api.post(
          '/logout/revoke_refresh_token',
          {},
          {
            headers: { Authorization: `Bearer ${refreshToken.value}` }
          }
        )
      }

      clearAuth()
      router.push('/login') // 注销后跳转到登录页面
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // 刷新 token
  const refreshAccessToken = async (): Promise<void> => {
    try {
      const response = await api.post('/refresh', { refresh_token: refreshToken.value })
      token.value = response.data.access_token
      localStorage.setItem('token', token.value || '')
    } catch (error) {
      console.error('Failed to refresh token:', error)
      throw new Error('Failed to refresh token')
    }
  }

  // 自动加载存储的 token
  const loadStoredToken = (): void => {
    const storedToken = localStorage.getItem('token')
    const storedRefreshToken = localStorage.getItem('refreshToken')
    if (storedToken && storedRefreshToken) {
      token.value = storedToken
      refreshToken.value = storedRefreshToken
      console.log(storedRefreshToken, storedToken)
    }
  }

  // 清除认证信息
  const clearAuth = (): void => {
    token.value = null
    refreshToken.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  }

  // 检查是否认证
  const isAuthenticated = (): boolean => !!token.value

  return {
    user,
    token,
    refreshToken,
    login,
    logout,
    refreshAccessToken,
    loadStoredToken,
    clearAuth,
    isAuthenticated
  }
})
