<script lang="ts" setup>
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
      >
        <el-sub-menu index="1">
          <template #title>
            <el-icon><Avatar /></el-icon>
            <span>User Mgmt</span>
          </template>
          <el-menu-item index="1-1">role manager</el-menu-item>
          <el-menu-item index="1-2">Comment</el-menu-item>
          <el-menu-item index="1-3">UserCollect</el-menu-item>
          <el-menu-item index="1-4">UserLike</el-menu-item>
          <el-menu-item index="1-5">UserPoint</el-menu-item>
          <el-menu-item index="1-6">FollowAuthor</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="2">
          <template #title>
            <el-icon><Notebook /></el-icon>
            <span>Novel Mgmt</span>
          </template>
          <el-menu-item index="2-1">NovelStyle</el-menu-item>
          <el-menu-item index="2-2">Novel manager</el-menu-item>
          <el-menu-item index="2-3">NovelChapter</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="3">
          <template #title>
            <el-icon><Film /></el-icon>
            <span>MachineTransContent</span>
          </template>
          <el-menu-item index="3-1">MachineTransContent</el-menu-item>
          <el-menu-item index="3-2">ConvertHistory</el-menu-item>
          <el-menu-item index="3-3">UserCorrectionHistory</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="4">
          <template #title>
            <el-icon><Headset /></el-icon>
            <span>Resource Mgmt</span>
          </template>
          <el-menu-item index="4-1">GenFictionImage</el-menu-item>
          <el-menu-item index="4-2">AudioStyle</el-menu-item>
          <el-menu-item index="4-3">GenAudio</el-menu-item>
          <el-menu-item index="4-4">GenNovelVideo</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="5">
          <template #title>
            <el-icon><Opportunity /></el-icon>
            <span>Ai-Models</span>
          </template>
          <el-menu-item index="5-1">OllamaPrompt</el-menu-item>
          <el-menu-item index="5-2">StableDiffusionParam</el-menu-item>
          <el-menu-item index="5-3">GenNovelVideo</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="6">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>System Mgmt</span>
          </template>
          <el-menu-item index="6-1">Login History</el-menu-item>
          <el-menu-item index="6-2">User Login Ip</el-menu-item>
          <el-menu-item index="6-3">SupportConvertLang</el-menu-item>
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
        >
          <el-menu-item index="1">
            <el-icon><Switch /></el-icon>
            LogintHistory
          </el-menu-item>
          <el-menu-item index="2">
            <el-icon><HomeFilled /></el-icon>
            Home
          </el-menu-item>
          <el-sub-menu index="2">
            <template #title>
              <el-icon><UserFilled /></el-icon>
              Admin
            </template>
            <el-menu-item index="2-1">UserProfile</el-menu-item>
            <el-menu-item index="2-2">changePassword</el-menu-item>
            <el-menu-item index="2-3">LoginOut</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>
      <div class="content">3</div>
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
