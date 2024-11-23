<template>
  <div>
    <el-button type="primary" @click="openDialog(null)">Add New Novel</el-button>
    <el-table :data="novels" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60"></el-table-column>
      <el-table-column prop="name" label="Name"></el-table-column>
      <el-table-column prop="description" label="Description"></el-table-column>
      <el-table-column prop="author_name" label="Author"></el-table-column>
      <el-table-column prop="language_name" label="Language"></el-table-column>
      <el-table-column prop="created_at" label="Created At"></el-table-column>
      <el-table-column label="Actions" width="180">
        <template #default="scope">
          <el-button size="small" @click="openDialog(scope.row)">Edit</el-button>
          <el-button size="small" type="danger" @click="deleteNovel(scope.row.id)"
            >Delete</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" title="Novel">
      <el-form :model="formData" ref="formRef" :rules="rules" label-width="120px">
        <!-- Name -->
        <el-form-item label="Name" prop="name">
          <el-input v-model="formData.name" placeholder="Enter Novel Name"></el-input>
        </el-form-item>
        <!-- Description -->
        <el-form-item label="Description" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="Enter Description"
          ></el-input>
        </el-form-item>
        <!-- Language -->
        <el-form-item label="Language" prop="language">
          <el-select v-model="formData.language" placeholder="Select Language">
            <el-option
              v-for="lang in languages"
              :key="lang.id"
              :label="lang.language_name"
              :value="lang.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- Author (仅管理员可见) -->
        <el-form-item v-if="isAdmin" label="Author" prop="author_id">
          <el-select v-model="formData.author_id" placeholder="Select Author">
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="user.username"
              :value="user.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitForm">Confirm</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchNovels, createNovel, updateNovel, deleteNovel as deleteNovelAPI } from '@/utils/novel'
import { fetchSupports } from '@/utils/lang' // 更新为您的 supports.ts 文件路径
import { fetchUsers } from '@/utils/user' // 更新为您的 users.ts 文件路径
import { useAuthStore } from '@/stores/auth'

// 定义小说数据的接口
interface Novel {
  id: number | null
  name: string
  description?: string
  author_id?: number | null
  author_name?: string
  language?: number | null
  language_name?: string
  created_at?: string
}

// 响应式引用数据和状态
const novels = ref<Novel[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const formData = ref<Novel>({
  id: null,
  name: '',
  description: '',
  author_id: null,
  language: null
})
const formRef = ref() // 表单实例的引用

const languages = ref<{ id: number; language_name: string }[]>([]) // 所有可用的语言
const users = ref<{ id: number; username: string }[]>([]) // 所有用户
const userMap = ref<{ [key: number]: string }>({}) // author_id 到 username 的映射

// 验证规则
const rules = {
  name: [{ required: true, message: 'Please enter Novel Name', trigger: 'blur' }],
  language: [{ required: true, message: 'Please select Language', trigger: 'change' }]
}

// 用户权限
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.userRoles.includes('admin'))

// 加载小说数据
const loadNovels = async () => {
  loading.value = true
  try {
    // 指定需要的字段
    const response = await fetchNovels([
      'id',
      'name',
      'description',
      'author_id',
      'language',
      'language_name',
      'created_at'
    ])
    if (Array.isArray(response.data.novels)) {
      // 为每个小说添加 author_name
      novels.value = response.data.novels.map((novel: Novel) => {
        return {
          ...novel,
          author_name: userMap.value[novel.author_id || 0] || 'Unknown'
        }
      })
    } else {
      ElMessage.error('Invalid data format received from API')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Failed to load novels')
  } finally {
    loading.value = false
  }
}

// 加载所有语言
const loadLanguages = async () => {
  try {
    const response = await fetchSupports()
    // 数据在 response.data.supports 中
    if (Array.isArray(response.data.supports)) {
      languages.value = response.data.supports.map((lang: any) => ({
        id: lang.id,
        language_name: lang.language_name
      }))
    } else {
      ElMessage.error('Invalid data format received from API')
    }
  } catch (error) {
    ElMessage.error('Failed to load languages')
  }
}

// 加载所有用户
const loadUsers = async () => {
  try {
    const response = await fetchUsers()
    // 数据是一个数组
    if (Array.isArray(response.data)) {
      users.value = response.data.map((user: any) => ({
        id: user.id,
        username: user.username
      }))
      // 构建 author_id 到 username 的映射
      userMap.value = {}
      users.value.forEach((user) => {
        userMap.value[user.id] = user.username
      })
    } else {
      ElMessage.error('Invalid data format received from API')
    }
  } catch (error) {
    ElMessage.error('Failed to load users')
  }
}

// 打开对话框
const openDialog = (novel: Novel | null) => {
  if (novel) {
    formData.value = { ...novel }
  } else {
    formData.value = { id: null, name: '', description: '', author_id: null, language: null }
  }
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (formData.value.id) {
          // 更新现有小说
          await updateNovel(formData.value.id, {
            name: formData.value.name,
            description: formData.value.description,
            language: formData.value.language,
            author_id: formData.value.author_id
          })
          ElMessage.success('Novel updated successfully')
        } else {
          // 创建新小说
          await createNovel({
            name: formData.value.name,
            description: formData.value.description,
            language: formData.value.language!,
            author_id: formData.value.author_id
          })
          ElMessage.success('Novel added successfully')
        }
        dialogVisible.value = false
        loadNovels()
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || 'Failed to submit novel')
      }
    } else {
      ElMessage.error('Please fill in the required fields')
    }
  })
}

// 删除小说
const deleteNovel = async (id: number) => {
  try {
    await deleteNovelAPI(id)
    ElMessage.success('Novel deleted successfully')
    loadNovels()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Failed to delete novel')
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  await loadUsers()
  await loadLanguages()
  await loadNovels()
})
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
