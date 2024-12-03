<template>
  <div>
    <el-button type="primary" @click="openDialog(null)">Add New Novel</el-button>
    <el-table :data="novels" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60"></el-table-column>
      <el-table-column prop="name" label="Name"></el-table-column>
      <el-table-column prop="description" label="Description">
        <template #default="scope">
          <div class="two-line-ellipsis">{{ scope.row.description }}</div>
        </template>
      </el-table-column>
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
import { fetchSupports } from '@/utils/lang'
import { fetchUsers } from '@/utils/user'
import { useAuthStore } from '@/stores/auth'

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
const formRef = ref()

const languages = ref<{ id: number; language_name: string }[]>([])
const users = ref<{ id: number; username: string }[]>([])
const userMap = ref<{ [key: number]: string }>({})

const rules = {
  name: [{ required: true, message: 'Please enter Novel Name', trigger: 'blur' }],
  language: [{ required: true, message: 'Please select Language', trigger: 'change' }]
}

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.userRoles.includes('admin'))

const loadNovels = async () => {
  loading.value = true
  try {
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

const loadLanguages = async () => {
  try {
    const response = await fetchSupports()
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

const loadUsers = async () => {
  try {
    const response = await fetchUsers()
    if (Array.isArray(response.data)) {
      users.value = response.data.map((user: any) => ({
        id: user.id,
        username: user.username
      }))
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

const openDialog = (novel: Novel | null) => {
  if (novel) {
    formData.value = { ...novel }
  } else {
    formData.value = { id: null, name: '', description: '', author_id: null, language: null } // author_id: null
  }
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  try {
    const valid = await formRef.value.validate()
    if (valid) {
      if (formData.value.id) {
        await updateNovel(formData.value.id, {
          name: formData.value.name,
          description: formData.value.description,
          language: formData.value.language,
          author_id: formData.value.author_id
        })
        ElMessage.success('Novel updated successfully')
      } else {
        await createNovel({
          name: formData.value.name,
          description: formData.value.description,
          language: formData.value.language!,
          author_id: formData.value.author_id ?? undefined // 将 null 转换为 undefined
        })
        ElMessage.success('Novel added successfully')
      }
      dialogVisible.value = false
      loadNovels()
    } else {
      ElMessage.error('Please fill in the required fields')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Failed to submit novel')
  }
}

const deleteNovel = async (id: number) => {
  try {
    await deleteNovelAPI(id)
    ElMessage.success('Novel deleted successfully')
    loadNovels()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Failed to delete novel')
  }
}

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

.two-line-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 3em;
  line-height: 1.5em;
}
</style>
