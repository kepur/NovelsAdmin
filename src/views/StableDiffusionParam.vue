<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  fetchStableDiffusionParams,
  createStableDiffusionParam,
  updateStableDiffusionParam,
  deleteStableDiffusionParam,
  fetchOllamaPrompts
} from '@/utils/prompts'

// Define interfaces
interface StableDiffusionParam {
  id: number | null
  ollama_prompt_id: number | null
  positive_prompt: string
  negative_prompt: string
  model_choice: string
  steps: number | null
  created_at?: string
  ollama_prompt?: Prompt
}

interface Prompt {
  id: number
  prompt_type: string
  prompt_text: string
}

// Reactive references
const params = ref<StableDiffusionParam[]>([])
const ollamaPrompts = ref<Prompt[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const formData = ref<StableDiffusionParam>({
  id: null,
  ollama_prompt_id: null,
  positive_prompt: '',
  negative_prompt: '',
  model_choice: '',
  steps: null
})
const formRef = ref() // Form instance reference

// Validation rules
const rules = {
  ollama_prompt_id: [{ required: true, message: 'Please select an Ollama Prompt', trigger: 'change' }],
  positive_prompt: [{ required: true, message: 'Please enter a positive prompt', trigger: 'blur' }],
  negative_prompt: [{ required: true, message: 'Please enter a negative prompt', trigger: 'blur' }],
  model_choice: [{ required: true, message: 'Please enter the model choice', trigger: 'blur' }],
  steps: [{ required: true, message: 'Please enter the number of steps', trigger: 'blur' }]
}

// Load StableDiffusionParams
const loadParams = async () => {
  loading.value = true
  try {
    const response = await fetchStableDiffusionParams()
    params.value = response.data
  } catch (error) {
    ElMessage.error('Failed to load parameters')
  } finally {
    loading.value = false
  }
}

// Load OllamaPrompts for selection
const loadOllamaPrompts = async () => {
  try {
    const response = await fetchOllamaPrompts()
    ollamaPrompts.value = response.data
  } catch (error) {
    ElMessage.error('Failed to load Ollama Prompts')
  }
}

// Open dialog for creation or editing
const openDialog = (param: StableDiffusionParam | null) => {
  if (param) {
    // Edit existing parameter
    formData.value = { ...param }
  } else {
    // Create new parameter
    formData.value = {
      id: null,
      ollama_prompt_id: null,
      positive_prompt: '',
      negative_prompt: '',
      model_choice: '',
      steps: null
    }
  }
  dialogVisible.value = true
}

// Submit form data
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const payload = {
          ollama_prompt_id: formData.value.ollama_prompt_id || undefined,
          positive_prompt: formData.value.positive_prompt,
          negative_prompt: formData.value.negative_prompt,
          model_choice: formData.value.model_choice,
          steps: formData.value.steps || undefined
        }

        if (formData.value.id) {
          // Update existing parameter
          await updateStableDiffusionParam(formData.value.id, payload)
          ElMessage.success('Parameter updated successfully')
        } else {
          // Create new parameter
          await createStableDiffusionParam({
            ...payload,
            ollama_prompt_id: formData.value.ollama_prompt_id!,
            steps: formData.value.steps!
          })
          ElMessage.success('Parameter created successfully')
        }
        dialogVisible.value = false
        loadParams()
      } catch (error) {
        ElMessage.error('Failed to submit parameters')
      }
    } else {
      ElMessage.error('Please fill in the required fields')
    }
  })
}

// Delete parameter
const deleteParam = async (id: number) => {
  try {
    await deleteStableDiffusionParam(id)
    ElMessage.success('Parameter deleted successfully')
    loadParams()
  } catch (error) {
    ElMessage.error('Failed to delete parameter')
  }
}

// Load data on component mount
onMounted(() => {
  loadParams()
  loadOllamaPrompts()
})
</script>

<template>
  <div>
    <el-button type="primary" @click="openDialog(null)">Create New Parameter</el-button>
    <el-table :data="params" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60"></el-table-column>
      <el-table-column prop="ollama_prompt.prompt_text" label="Ollama Prompt">
        <template #default="scope">
          <div class="two-line-ellipsis">{{ scope.row.ollama_prompt?.prompt_text }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="positive_prompt" label="Positive Prompt">
        <template #default="scope">
          <div class="two-line-ellipsis">{{ scope.row.positive_prompt }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="negative_prompt" label="Negative Prompt">
        <template #default="scope">
          <div class="two-line-ellipsis">{{ scope.row.negative_prompt }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="model_choice" label="Model Choice"></el-table-column>
      <el-table-column prop="steps" label="Steps"></el-table-column>
      <el-table-column prop="created_at" label="Created At"></el-table-column>
      <el-table-column label="Actions" width="180">
        <template #default="scope">
          <el-button size="small" @click="openDialog(scope.row)">Edit</el-button>
          <el-button size="small" type="danger" @click="deleteParam(scope.row.id)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="Stable Diffusion Parameters">
      <el-form :model="formData" ref="formRef" :rules="rules" label-width="140px">
        <el-form-item label="Ollama Prompt" prop="ollama_prompt_id">
          <el-select v-model="formData.ollama_prompt_id" placeholder="Select Ollama Prompt">
            <el-option
              v-for="prompt in ollamaPrompts"
              :key="prompt.id"
              :label="prompt.prompt_text"
              :value="prompt.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Positive Prompt" prop="positive_prompt">
          <el-input type="textarea" v-model="formData.positive_prompt"></el-input>
        </el-form-item>
        <el-form-item label="Negative Prompt" prop="negative_prompt">
          <el-input type="textarea" v-model="formData.negative_prompt"></el-input>
        </el-form-item>
        <el-form-item label="Model Choice" prop="model_choice">
          <el-input v-model="formData.model_choice"></el-input>
        </el-form-item>
        <el-form-item label="Steps" prop="steps">
          <el-input v-model="formData.steps" type="number"></el-input>
        </el-form-item>
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

.two-line-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 3em;
  line-height: 1.5em;
}
</style>
