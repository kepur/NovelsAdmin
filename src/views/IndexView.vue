<script lang="ts" setup>
import { useAuthStore } from '@/stores/auth'
import {
  Avatar,
  Notebook,
  Headset,
  Setting,
  Film,
  Opportunity,
  UserFilled,
  Switch,
  HomeFilled
} from '@element-plus/icons-vue'
const authStore = useAuthStore()

import { ElMessage } from 'element-plus'

const handleLogout = async () => {
  try {
    await authStore.logout()
    ElMessage.success('Logout successful')
  } catch (error) {
    ElMessage.error('Logout failed')
  }
}
</script>
<template>
  <div class="index">
    <div class="left">
      <h2>Stories Managment</h2>
      <el-menu
        active-text-color="#ffd04b"
        background-color="#545c64"
        class="el-menu-vertical-demo"
        default-active="2"
        text-color="#fff"
        :router="true"
      >
        <el-sub-menu index="1">
          <template #title>
            <el-icon><Avatar /></el-icon>
            <span>User Mgmt</span>
          </template>
          <el-menu-item index="/index/usercollect">UserCollect</el-menu-item>
          <el-menu-item index="/index/userlike">UserLike</el-menu-item>
          <el-menu-item index="/index/userpoint">UserPoint</el-menu-item>
          <!-- <el-menu-item index="/index/userrole">FollowAuthor</el-menu-item> -->
        </el-sub-menu>
        <el-sub-menu index="2">
          <template #title>
            <el-icon><Notebook /></el-icon>
            <span>Novel Mgmt</span>
          </template>
          <el-menu-item index="/index/novelstyle">NovelStyle</el-menu-item>
          <el-menu-item index="/index/novelmgm">Novel manager</el-menu-item>
          <el-menu-item index="/index/novelchapter">NovelChapter</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="3">
          <template #title>
            <el-icon><Film /></el-icon>
            <span>MachineTransContent</span>
          </template>
          <el-menu-item index="/index/machinetrans">MachineTransContent</el-menu-item>
          <el-menu-item index="/index/transconverthistory">ConvertHistory</el-menu-item>
          <el-menu-item index="/index/usercorrection">UserCorrectionHistory</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="4">
          <template #title>
            <el-icon><Headset /></el-icon>
            <span>Resource Mgmt</span>
          </template>
          <el-menu-item index="/index/resourcegenimage">GenFictionImage</el-menu-item>
          <el-menu-item index="/index/resourceaudiostyle">AudioStyle</el-menu-item>
          <el-menu-item index="/index/resourcegenaudio">GenAudio</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="5">
          <template #title>
            <el-icon><Opportunity /></el-icon>
            <span>Ai-Models</span>
          </template>
          <el-menu-item index="/index/ollamaprompt">OllamaPrompt</el-menu-item>
          <el-menu-item index="/index/sdparam">StableDiffusionParam</el-menu-item>
          <el-menu-item index="/index/resourcegenvideo">GenNovelVideo</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="6">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>System Mgmt</span>
          </template>
          <el-menu-item index="/index/usercomment">Comment</el-menu-item>
          <el-menu-item index="/index/userrole">UserRole</el-menu-item>
          <el-menu-item index="/index/usermgm">User Mgm</el-menu-item>
          <!-- <el-menu-item index="/index/userrole">User Login Ip</el-menu-item> -->
          <el-menu-item index="/index/supportlang">SupportConvertLang</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>
    <div class="right">
      <div class="top">
        <el-menu
          :ellipsis="false"
          class="el-menu-demo"
          mode="horizontal"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          :router="true"
        >
          <el-menu-item index="/index/loginhistory">
            <el-icon><Switch /></el-icon>
            LogintHistory
          </el-menu-item>
          <!-- <el-menu-item index="2">
            <el-icon><HomeFilled /></el-icon>
            Home
          </el-menu-item> -->
          <el-sub-menu index="2">
            <template #title>
              <el-icon><UserFilled /></el-icon>
              Admin
            </template>
            <el-menu-item index="/index/userprofile">UserProfile</el-menu-item>
            <el-menu-item index="/index/changepassword">changePassword</el-menu-item>
            <el-menu-item @click="handleLogout">LoginOut</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>
      <div class="content">
        <RouterView></RouterView>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.index {
  width: 100vw;
  height: 100vh;
  display: flex;
  .left {
    .el-menu {
      border-right: none;
    }
    ::v-deep .el-sub-menu__title__span {
      text-align: left;
    }
    width: 200px;
    background-color: #7b8a9c;
    color: white;
    h2 {
      font-size: 18px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      text-align: center;
      height: 60px;
      line-height: 60px;
    }
  }
  .right {
    flex: 1;
    display: flex;
    flex-direction: column;
    .top {
      height: 60px;
      background-color: #666b70;
      display: flex;
      justify-content: flex-end;
      border-bottom-width: none;
    }
    .content {
      flex: 1;
      padding: 5px;
    }
  }
}
</style>
