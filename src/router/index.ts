// src/router/index.ts

import { createRouter, createWebHistory } from 'vue-router'
import IndexView from '@/views/IndexView.vue'
import LoginView from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/index'
    },
    {
      path: '/index',
      name: 'index',
      component: IndexView,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'usermgm',
          name: 'usermgm',
          component: () => import('../views/user/UserMgm.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'userrole',
          name: 'userrole',
          component: () => import('../views/user/UserRole.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        // normal user
        {
          path: 'novelstyle',
          name: 'novelstyle',
          component: () => import('../views/novel/NovelStyle.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'novelmgm',
          name: 'novelmgm',
          component: () => import('../views/novel/NovelsMgm.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'novelchapter',
          name: 'novelchapter',
          component: () => import('../views/novel/NovelChapter.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'usercomment',
          name: 'usercomment',
          component: () => import('../views/user/UserComment.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'userpoint',
          name: 'userpoint',
          component: () => import('../views/user/UserPoint.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'userprofile',
          name: 'userprofile',
          component: () => import('../views/user/UserProfile.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'transconverthistory',
          name: 'transconverthistory',
          component: () => import('../views/trans/ConvertHistory.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'machinetrans',
          name: 'machinetrans',
          component: () => import('../views/trans/MachineTrans.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'usercorrection',
          name: 'usercorrection',
          component: () => import('../views/trans/UserCorrectionHistory.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'resourceaudiostyle',
          name: 'resourceaudiostyle',
          component: () => import('../views/resource/AudioStyle.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'resourcegenaudio',
          name: 'resourcegenaudio',
          component: () => import('../views/resource/GenAudio.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'resourcegenimage',
          name: 'resourcegenimage',
          component: () => import('../views/resource/GenImage.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'resourcegenvideo',
          name: 'resourcegenvideo',
          component: () => import('../views/resource/GenVideo.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'ollamaprompt',
          name: 'ollamaprompt',
          component: () => import('../views/OllamaPrompt.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'sdparam',
          name: 'sdparam',
          component: () => import('../views/StableDiffusionParam.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'loginhistory',
          name: 'loginhistory',
          component: () => import('../views/user/UserMgm.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'changepassword',
          name: 'changepassword',
          component: () => import('../views/user/ChangePwd.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'supportlang',
          name: 'supportlang',
          component: () => import('../views/SupportLang.vue'),
          meta: { requiresAuth: true }
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const { token, userRoles } = storeToRefs(authStore)

  authStore.loadStoredToken()

  console.log('star check router')

  if (to.meta.requiresAuth && !authStore.isAuthenticated()) {

    return next({ name: 'login' })
  }

  if (to.meta.requiresAdmin && !userRoles.value.includes('admin')) {
    return next({ name: 'home' }) 
  }


  if (authStore.isAuthenticated() && to.path === '/login') {
    return next({ name: 'home' })
  }

  next()
})

export default router
