import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import IndexView from '@/views/IndexView.vue'
import LoginView from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/auth'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/index',
      name: 'index',
      component: IndexView,
      children: [
        {
          path: 'novelstyle',
          name: 'novelstyle',
          component: () => import('../views/novel/NovelStyle.vue')
        },
        {
          path: 'novelmgm',
          name: 'novelmgm',
          component: () => import('../views/novel/NovelsMgm.vue')
        },
        {
          path: 'novelchapter',
          name: 'novelchapter',
          component: () => import('../views/novel/NovelChapter.vue')
        },
        {
          path: 'usercollect',
          name: 'usercollect',
          component: () => import('../views/user/UserCollect.vue')
        },
        {
          path: 'usercomment',
          name: 'usercomment',
          component: () => import('../views/user/UserComment.vue')
        },
        {
          path: 'userlike',
          name: 'userlike',
          component: () => import('../views/user/UserLike.vue')
        },
        {
          path: 'userpoint',
          name: 'userpoint',
          component: () => import('../views/user/UserPoint.vue')
        },
        {
          path: 'userprofile',
          name: 'userprofile',
          component: () => import('../views/user/UserProfile.vue')
        },
        {
          path: 'usermgm',
          name: 'usermgm',
          component: () => import('../views/user/UserMgm.vue')
        },
        {
          path: 'userrole',
          name: 'userrole',
          component: () => import('../views/user/UserRole.vue')
        },
        {
          path: 'transconverthistory',
          name: 'transconverthistory',
          component: () => import('../views/trans/ConvertHistory.vue')
        },
        {
          path: 'machinetrans',
          name: 'machinetrans',
          component: () => import('../views/trans/MachineTrans.vue')
        },
        {
          path: 'usercorrection',
          name: 'usercorrection',
          component: () => import('../views/trans/UserCorrectionHistory.vue')
        },
        {
          path: 'resourceaudiostyle',
          name: 'resourceaudiostyle',
          component: () => import('../views/resource/AudioStyle.vue')
        },
        {
          path: 'resourcegenaudio',
          name: 'resourcegenaudio',
          component: () => import('../views/resource/GenAudio.vue')
        },
        {
          path: 'resourcegenimage',
          name: 'resourcegenimage',
          component: () => import('../views/resource/GenImage.vue')
        },
        {
          path: 'resourcegenvideo',
          name: 'resourcegenvideo',
          component: () => import('../views/resource/GenVideo.vue')
        },
        {
          path: 'ollamaprompt',
          name: 'ollamaprompt',
          component: () => import('../views/OllamaPrompt.vue')
        },
        {
          path: 'sdparam',
          name: 'sdparam',
          component: () => import('../views/StableDiffusionParam.vue')
        },
        {
          path: 'loginhistory',
          name: 'loginhistory',
          component: () => import('../views/user/UserMgm.vue')
        },
        {
          path: 'userprofile',
          name: 'userprofile',
          component: () => import('../views/user/UserProfile.vue')
        },
        {
          path: 'changepassword',
          name: 'changepassword',
          component: () => import('../views/user/ChangePwd.vue')
        },
        {
          path: 'supportlang',
          name: 'supportlang',
          component: () => import('../views/SupportLang.vue')
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
  authStore.loadStoredToken()
  console.log('开始验证路由')
  if (!authStore.isAuthenticated() && to.path !== '/login') {
    return next({ name: 'login' })
  }
  // 如果用户已登录且访问登录页面，跳转到首页
  if (authStore.isAuthenticated() && to.path === '/login') {
    return next({ name: 'home' })
  }
  next()
})

export default router
