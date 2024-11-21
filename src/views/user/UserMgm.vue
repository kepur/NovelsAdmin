<template>
  <div>
    <el-page-header content="User Management" style="margin-bottom: 20px" />

    <el-button type="primary" @click="showAddDialog = true">Add User</el-button>

    <el-table :data="users" style="margin-top: 20px; width: 100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="username" label="Username" />
      <el-table-column prop="email" label="Email" />
      <el-table-column label="Actions" align="right" width="180">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">Edit</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row.id)"
            >Delete</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- Add/Edit Dialog -->
    <el-dialog title="Add User" v-model:visible="showAddDialog">
      <el-form :model="newUser" label-width="100px">
        <el-form-item label="Username">
          <el-input v-model="newUser.username" />
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="newUser.email" />
        </el-form-item>
        <el-form-item label="Password">
          <el-input type="password" v-model="newUser.password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">Cancel</el-button>
        <el-button type="primary" @click="saveUser">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { fetchUsers, createUser, deleteUser } from '@/utils/user'

interface User {
  id: number
  username: string
  email: string
}

const users = ref<User[]>([])
const showAddDialog = ref(false)
const newUser = ref({ username: '', email: '', password: '' })

const loadUsers = async () => {
  try {
    const response = await fetchUsers()
    users.value = response.data.users // 假设返回 { users: [...] }
  } catch (error) {
    console.error('Failed to fetch users:', error)
  }
}

const saveUser = async () => {
  try {
    await createUser(newUser.value)
    showAddDialog.value = false
    loadUsers()
  } catch (error) {
    console.error('Failed to create user:', error)
  }
}

const handleDelete = async (id: number) => {
  try {
    await deleteUser(id)
    loadUsers()
  } catch (error) {
    console.error('Failed to delete user:', error)
  }
}

onMounted(loadUsers)
</script>

<style scoped>
.el-table {
  margin-top: 20px;
}
</style>
