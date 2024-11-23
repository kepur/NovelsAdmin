<template>
  <div>
    <el-button type="primary" @click="openDialog(null)">Add New Audio Style</el-button>
    <el-table :data="audioStyles" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60"></el-table-column>
      <el-table-column prop="language_name" label="Language"></el-table-column>
      <el-table-column prop="style_name" label="Style Name"></el-table-column>
      <el-table-column prop="voice_type" label="Voice Type"></el-table-column>
      <el-table-column prop="created_at" label="Created At"></el-table-column>
      <el-table-column label="Actions" width="180">
        <template #default="scope">
          <el-button size="small" @click="openDialog(scope.row)">Edit</el-button>
          <el-button size="small" type="danger" @click="deleteAudioStyle(scope.row.id)"
            >Delete</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" title="Audio Style">
      <el-form :model="formData" ref="formRef" :rules="rules" label-width="120px">
        <!-- Language -->
        <el-form-item label="Language" prop="language_code_id">
          <el-select v-model="formData.language_code_id" placeholder="Select Language">
            <el-option
              v-for="lang in languages"
              :key="lang.id"
              :label="lang.language_name"
              :value="lang.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- Style Name -->
        <el-form-item label="Style Name" prop="style_name">
          <el-input v-model="formData.style_name" placeholder="Enter Style Name"></el-input>
        </el-form-item>
        <!-- Voice Type -->
        <el-form-item label="Voice Type" prop="voice_type">
          <el-input v-model="formData.voice_type" placeholder="Enter Voice Type"></el-input>
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
import {
  fetchAudioStyles,
  createAudioStyle,
  updateAudioStyle,
  deleteAudioStyle as deleteAudioStyleAPI
} from '@/utils/lang'
import { fetchSupports } from '@/utils/lang'

interface AudioStyle {
  id: number | null
  language_code_id: number | null
  language_name?: string
  style_name: string
  voice_type: string
  created_at?: string
}

const audioStyles = ref<AudioStyle[]>([])
const languages = ref<{ id: number; language_name: string }[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const formData = ref<AudioStyle>({
  id: null,
  language_code_id: null,
  style_name: '',
  voice_type: ''
})
const formRef = ref()

const rules = {
  language_code_id: [{ required: true, message: 'Please select Language', trigger: 'change' }],
  style_name: [{ required: true, message: 'Please enter Style Name', trigger: 'blur' }],
  voice_type: [{ required: true, message: 'Please enter Voice Type', trigger: 'blur' }]
}

const loadAudioStyles = async () => {
  loading.value = true
  try {
    const response = await fetchAudioStyles()
    if (Array.isArray(response.data.audio_styles)) {
      audioStyles.value = response.data.audio_styles
    } else {
      ElMessage.error('Invalid data format received from API')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Failed to load audio styles')
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

const openDialog = (style: AudioStyle | null) => {
  if (style) {
    formData.value = { ...style }
  } else {
    formData.value = { id: null, language_code_id: null, style_name: '', voice_type: '' }
  }
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (formData.value.id) {
          // Update existing audio style
          await updateAudioStyle(formData.value.id, {
            language_code_id: formData.value.language_code_id,
            style_name: formData.value.style_name,
            voice_type: formData.value.voice_type
          })
          ElMessage.success('Audio Style updated successfully')
        } else {
          // Create new audio style
          await createAudioStyle({
            language_code_id: formData.value.language_code_id!,
            style_name: formData.value.style_name,
            voice_type: formData.value.voice_type
          })
          ElMessage.success('Audio Style added successfully')
        }
        dialogVisible.value = false
        loadAudioStyles()
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || 'Failed to submit audio style')
      }
    } else {
      ElMessage.error('Please fill in the required fields')
    }
  })
}

const deleteAudioStyle = async (id: number) => {
  try {
    await deleteAudioStyleAPI(id)
    ElMessage.success('Audio Style deleted successfully')
    loadAudioStyles()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Failed to delete audio style')
  }
}

onMounted(() => {
  loadAudioStyles()
  loadLanguages()
})
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
