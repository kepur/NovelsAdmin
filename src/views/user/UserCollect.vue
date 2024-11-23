<template>
  <div>
    <el-table :data="collects" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60"></el-table-column>
      <el-table-column prop="novel_name" label="Novel"></el-table-column>
      <el-table-column prop="username" label="User"></el-table-column>
      <el-table-column prop="collected_at" label="Collected At"></el-table-column>
      <el-table-column label="Actions" width="100">
        <template #default="scope">
          <el-button size="small" type="danger" @click="deleteCollect(scope.row.id)"
            >Delete</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchUserCollects, deleteUserCollect } from '@/utils/user'

interface UserCollect {
  id: number
  novel_id: number
  novel_name: string
  user_id: number
  username: string
  collected_at: string
}

const collects = ref<UserCollect[]>([])
const loading = ref(false)

const loadCollects = async () => {
  loading.value = true
  try {
    const response = await fetchUserCollects()
    if (Array.isArray(response.data.collects)) {
      collects.value = response.data.collects
    } else {
      ElMessage.error('Invalid data format received from API')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Failed to load collects')
  } finally {
    loading.value = false
  }
}

const deleteCollect = async (id: number) => {
  try {
    await deleteUserCollect(id)
    ElMessage.success('Collect deleted successfully')
    loadCollects()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Failed to delete collect')
  }
}

onMounted(() => {
  loadCollects()
})
</script>

<style scoped></style>
