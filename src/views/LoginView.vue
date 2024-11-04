<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus'
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus' // 引入 ElMessage 组件
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const errorMessage = ref('')
const router = useRouter()
const activeName = ref('first')

const formData = reactive({
  loginId: '',
  loginPwd: ''
})

// 验证用户名
const validateLoginId = (rule: any, value: any, callback: any) => {
  if (value === '') {
    // 如果用户名为空，则调用 callback 并传入错误信息
    callback(new Error('Please input username'))
  } else {
    // 如果验证通过，调用 callback 不传参数
    callback()
  }
}

// 验证密码
const validateLoginPwd = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('Please input password'))
  } else {
    callback()
  }
}

// 验证规则对象
const rules = reactive<FormRules>({
  loginId: [{ validator: validateLoginId, trigger: 'blur' }],
  loginPwd: [{ validator: validateLoginPwd, trigger: 'blur' }]
})

// 登录逻辑
const submitForm = async () => {
  try {
    if (!formData.loginId || !formData.loginPwd) {
      errorMessage.value = '请填写用户名和密码'
      return
    }
    await authStore.login(formData.loginId, formData.loginPwd)
    // 登录成功后显示成功提示，并重定向到受保护页面
    ElMessage.success('登录成功') // 添加登录成功提示
    if (authStore.isAuthenticated()) {
      router.push('/index') // 登录成功后重定向到受保护的页面
    }
  } catch (error) {
    errorMessage.value = '登录失败，请重试' + error
    ElMessage.error(errorMessage.value) // 使用 ElMessage 弹出提示
  }
}
</script>

<template>
  <div class="login">
    <div class="box">
      <h2>AI Story System Login</h2>
      <el-form :model="formData" :rules="rules" size="small" status-icon label-width="100px">
        <el-form-item label="Username:" prop="loginId">
          <el-input v-model="formData.loginId"></el-input>
        </el-form-item>
        <el-form-item label="Password:" prop="loginPwd">
          <el-input v-model="formData.loginPwd" type="password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">Login</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(to bottom, #1e1e1e, #b7babd);
  display: flex;
  justify-content: center;
  align-items: center;

  .box {
    width: 400px;
    padding: 20px;
    border: 1px solid #fff;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.7);

    h2 {
      color: #fff;
      font-size: 20px;
      margin-bottom: 20px;
      text-align: center; // 单独居中 h2
    }

    ::v-deep .el-form-item__label {
      color: #fff;
    }
  }
}
</style>
