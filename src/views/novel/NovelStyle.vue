<template>
  <div>
    <el-button type="primary" @click="openDialog(null)">Add New Novel Style</el-button>
    <el-table :data="styles" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60"></el-table-column>
      <el-table-column prop="name" label="Name"></el-table-column>
      <el-table-column label="Actions" width="180">
        <template #default="scope">
          <el-button size="small" @click="openDialog(scope.row)">Edit</el-button>
          <el-button size="small" type="danger" @click="deleteStyle(scope.row.id)"
            >Delete</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="Novel Style">
      <el-form :model="formData" ref="formRef" :rules="rules" label-width="120px">
        <el-form-item label="Name" prop="name">
          <el-input v-model="formData.name" placeholder="Enter Novel Style Name"></el-input>
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
import { fetchStyles, createStyle, updateStyle, deleteStyle as deleteStyleAPI } from '@/utils/novel'

interface NovelStyle {
  id: number | null
  name: string
}

const styles = ref<NovelStyle[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const formData = ref<NovelStyle>({
  id: null,
  name: ''
})
const formRef = ref() //

const rules = {
  name: [{ required: true, message: 'Please enter Novel Style Name', trigger: 'blur' }]
}

const loadStyles = async () => {
  loading.value = true
  try {
    const response = await fetchStyles()
    if (Array.isArray(response.data.styles)) {
      styles.value = response.data.styles
    } else {
      ElMessage.error('Invalid data format received from API')
    }
  } catch (error) {
    ElMessage.error('Failed to load novel styles')
  } finally {
    loading.value = false
  }
}

// 打开对话框
const openDialog = (style: NovelStyle | null) => {
  if (style) {
    formData.value = { ...style }
  } else {
    formData.value = { id: null, name: '' }
  }
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (formData.value.id) {
          await updateStyle(formData.value.id, {
            name: formData.value.name
          })
          ElMessage.success('Novel style updated successfully')
        } else {
          await createStyle({
            name: formData.value.name
          })
          ElMessage.success('Novel style added successfully')
        }
        dialogVisible.value = false
        loadStyles()
      } catch (error) {
        ElMessage.error('Failed to submit novel style')
      }
    } else {
      ElMessage.error('Please fill in the required fields')
    }
  })
}

const deleteStyle = async (id: number) => {
  try {
    await deleteStyleAPI(id)
    ElMessage.success('Novel style deleted successfully')
    loadStyles()
  } catch (error) {
    ElMessage.error('Failed to delete novel style')
  }
}

onMounted(() => {
  loadStyles()
})
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
