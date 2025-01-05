<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  fetchOllamaPrompts,
  createOllamaPrompt,
  updateOllamaPrompt,
  deleteOllamaPrompt
} from '@/utils/prompts'

// Define the interface for the prompt data
interface Prompt {
  id: number | null
  prompt_type: string
  prompt_text: string
  created_at?: string
  // Include other fields if necessary
}

// Reactive references for data and state
const prompts = ref<Prompt[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const formData = ref<Prompt>({
  id: null,
  prompt_type: '',
  prompt_text: ''
})
const formRef = ref() // Reference to the form instance

// Validation rules
const rules = {
  prompt_type: [{ required: true, message: 'Please enter Prompt Type', trigger: 'blur' }],
  prompt_text: [{ required: true, message: 'Please enter Prompt Text', trigger: 'blur' }]
}

// Function to load prompts from the backend
const loadPrompts = async () => {
  loading.value = true
  try {
    const response = await fetchOllamaPrompts()
    prompts.value = response.data
  } catch (error) {
    ElMessage.error('Failed to load prompts')
  } finally {
    loading.value = false
  }
}

// Function to open the dialog for creating or editing a prompt
const openDialog = (prompt: Prompt | null) => {
  if (prompt) {
    formData.value = { ...prompt }
  } else {
    formData.value = { id: null, prompt_type: '', prompt_text: '' }
  }
  dialogVisible.value = true
}

// Function to submit the form data to the backend
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (formData.value.id) {
          // Update existing prompt
          await updateOllamaPrompt(formData.value.id, {
            prompt_type: formData.value.prompt_type,
            prompt_text: formData.value.prompt_text
          })
          ElMessage.success('Prompt updated successfully')
        } else {
          // Create new prompt
          await createOllamaPrompt({
            prompt_type: formData.value.prompt_type,
            prompt_text: formData.value.prompt_text
          })
          ElMessage.success('Prompt created successfully')
        }
        dialogVisible.value = false
        loadPrompts()
      } catch (error) {
        ElMessage.error('Failed to submit prompt')
      }
    } else {
      ElMessage.error('Please fill in the required fields')
    }
  })
}

// Function to delete a prompt
const deletePrompt = async (id: number) => {
  try {
    await deleteOllamaPrompt(id)
    ElMessage.success('Prompt deleted successfully')
    loadPrompts()
  } catch (error) {
    ElMessage.error('Failed to delete prompt')
  }
}

// Load prompts when the component is mounted
onMounted(() => {
  loadPrompts()
})
</script>
<template>
  <div>
    <el-button type="primary" @click="openDialog(null)">Create New Prompt</el-button>
    <el-table :data="prompts" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60"></el-table-column>
      <el-table-column prop="prompt_type" label="Prompt Type"></el-table-column>
      <el-table-column prop="prompt_text" label="Prompt Text"></el-table-column>
      <el-table-column prop="created_at" label="Created At"></el-table-column>
      <!-- Include other fields if necessary -->
      <el-table-column label="Actions" width="180">
        <template #default="scope">
          <el-button size="small" @click="openDialog(scope.row)">Edit</el-button>
          <el-button size="small" type="danger" @click="deletePrompt(scope.row.id)"
            >Delete</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" title="Ollama Prompt">
      <el-form :model="formData" ref="formRef" :rules="rules" label-width="120px">
        <!-- Prompt Type -->
        <el-form-item label="Prompt Type" prop="prompt_type">
          <el-input v-model="formData.prompt_type"></el-input>
        </el-form-item>
        <!-- Prompt Text -->
        <el-form-item label="Prompt Text" prop="prompt_text">
          <el-input type="textarea" v-model="formData.prompt_text"></el-input>
        </el-form-item>
        <!-- Include other fields if necessary -->
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitForm">Confirm</el-button>
      </template>
    </el-dialog>
  </div>
</template>



<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
