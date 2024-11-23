<template>
  <div>
    <el-button type="primary" @click="openDialog()">Add User Point</el-button>
    <el-table :data="points" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60"></el-table-column>
      <el-table-column prop="username" label="User"></el-table-column>
      <el-table-column prop="points" label="Points"></el-table-column>
      <el-table-column prop="reason" label="Reason"></el-table-column>
      <el-table-column prop="created_at" label="Created At"></el-table-column>
      <el-table-column label="Actions" width="100">
        <template #default="scope">
          <el-button size="small" type="danger" @click="deletePoint(scope.row.id)"
            >Delete</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" title="Add User Point">
      <el-form :model="formData" ref="formRef" :rules="rules" label-width="120px">
        <!-- User -->
        <el-form-item label="User" prop="user_id">
          <el-select v-model="formData.user_id" placeholder="Select User">
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="user.username"
              :value="user.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- Points -->
        <el-form-item label="Points" prop="points">
          <el-input-number v-model="formData.points" :min="-10000" :max="10000"></el-input-number>
        </el-form-item>
        <!-- Reason -->
        <el-form-item label="Reason" prop="reason">
          <el-input v-model="formData.reason" placeholder="Enter reason"></el-input>
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
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchUserPoints, createUserPoint, deleteUserPoint } from '@/utils/user'
import { fetchUsers } from '@/utils/user'

interface UserPoint {
  id: number
  user_id: number
  username: string
  points: number
  reason: string
  created_at: string
}

const points = ref<UserPoint[]>([])
const users = ref<{ id: number; username: string }[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const formData = ref({
  user_id: null,
  points: 0,
  reason: ''
})
const formRef = ref()
const rules = {
  user_id: [{ required: true, message: 'Please select User', trigger: 'change' }],
  points: [{ required: true, message: 'Please enter points', trigger: 'blur' }],
  reason: [{ required: true, message: 'Please enter reason', trigger: 'blur' }]
}

const loadPoints = async () => {
  loading.value = true
  try {
    const response = await fetchUserPoints()
    if (Array.isArray(response.data.points)) {
      points.value = response.data.points
    } else {
      ElMessage.error('Invalid data format received from API')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Failed to load user points')
  } finally {
    loading.value = false
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
    } else {
      ElMessage.error('Invalid data format received from API')
    }
  } catch (error) {
    ElMessage.error('Failed to load users')
  }
}

const openDialog = () => {
  formData.value = {
    user_id: null,
    points: 0,
    reason: ''
  }
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        await createUserPoint({
          user_id: formData.value.user_id!,
          points: formData.value.points,
          reason: formData.value.reason
        })
        ElMessage.success('User point added successfully')
        dialogVisible.value = false
        loadPoints()
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || 'Failed to add user point')
      }
    } else {
      ElMessage.error('Please fill in the required fields')
    }
  })
}

const deletePoint = async (id: number) => {
  try {
    await deleteUserPoint(id)
    ElMessage.success('User point deleted successfully')
    loadPoints()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Failed to delete user point')
  }
}

onMounted(() => {
  loadPoints()
  loadUsers()
})
</script>

<style scoped></style>
