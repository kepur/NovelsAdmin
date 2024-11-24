<template>
  <div>
    <el-button type="primary" @click="openDialog(null)">Add New Translation</el-button>
    <el-table :data="translations" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60"></el-table-column>
      <el-table-column prop="chapter_title" label="Chapter"></el-table-column>
      <el-table-column prop="source_language_name" label="Source Language"></el-table-column>
      <el-table-column prop="target_language_name" label="Target Language"></el-table-column>
      <el-table-column prop="translation_engine" label="Engine"></el-table-column>
      <el-table-column prop="created_at" label="Created At"></el-table-column>
      <el-table-column label="Actions" width="180">
        <template #default="scope">
          <el-button size="small" @click="openDialog(scope.row)">Edit</el-button>
          <el-button size="small" type="danger" @click="deleteTranslation(scope.row.id)"
            >Delete</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" title="Translation">
      <el-form :model="formData" ref="formRef" :rules="rules" label-width="120px">
        <!-- Chapter -->
        <el-form-item label="Chapter" prop="chapter_id">
          <el-select v-model="formData.chapter_id" placeholder="Select Chapter">
            <el-option
              v-for="chapter in chapters"
              :key="chapter.id"
              :label="chapter.title"
              :value="chapter.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- Source Language -->
        <el-form-item label="Source Language" prop="source_language">
          <el-select v-model="formData.source_language" placeholder="Select Source Language">
            <el-option
              v-for="lang in languages"
              :key="lang.language_code"
              :label="lang.language_name"
              :value="lang.language_code"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- Target Language -->
        <el-form-item label="Target Language" prop="target_language">
          <el-select v-model="formData.target_language" placeholder="Select Target Language">
            <el-option
              v-for="lang in languages"
              :key="lang.language_code"
              :label="lang.language_name"
              :value="lang.language_code"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- Translation Engine -->
        <el-form-item label="Translation Engine" prop="translation_engine">
          <el-input
            v-model="formData.translation_engine"
            placeholder="Enter Translation Engine"
          ></el-input>
        </el-form-item>
        <!-- Translated Content -->
        <el-form-item label="Translated Content" prop="translated_content">
          <el-input
            v-model="formData.translated_content"
            type="textarea"
            placeholder="Enter Translated Content"
          ></el-input>
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
  fetchMachineTranslations,
  createMachineTranslation,
  updateMachineTranslation,
  deleteMachineTranslation
} from '@/utils/trans'
import { fetchChapters } from '@/utils/novel'
import { fetchSupports } from '@/utils/lang'

interface MachineTranslation {
  id: number | null
  chapter_id: number | null
  chapter_title?: string
  translated_content: string
  source_language: string
  source_language_name?: string
  target_language: string
  target_language_name?: string
  translation_engine: string
  created_at?: string
}

const translations = ref<MachineTranslation[]>([])
const chapters = ref<{ id: number; title: string }[]>([])
const languages = ref<{ language_code: string; language_name: string }[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const formData = ref<MachineTranslation>({
  id: null,
  chapter_id: null,
  translated_content: '',
  source_language: '',
  target_language: '',
  translation_engine: ''
})
const formRef = ref()
const rules = {
  chapter_id: [{ required: true, message: 'Please select Chapter', trigger: 'change' }],
  source_language: [
    { required: true, message: 'Please select Source Language', trigger: 'change' }
  ],
  target_language: [
    { required: true, message: 'Please select Target Language', trigger: 'change' }
  ],
  translation_engine: [
    { required: true, message: 'Please enter Translation Engine', trigger: 'blur' }
  ],
  translated_content: [
    { required: true, message: 'Please enter Translated Content', trigger: 'blur' }
  ]
}

const loadTranslations = async () => {
  loading.value = true
  try {
    const response = await fetchMachineTranslations()
    if (Array.isArray(response.data.translations)) {
      translations.value = response.data.translations
    } else {
      ElMessage.error('Invalid data format received from API')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Failed to load translations')
  } finally {
    loading.value = false
  }
}

const loadChapters = async () => {
  try {
    const response = await fetchChapters()
    if (Array.isArray(response.data.chapters)) {
      chapters.value = response.data.chapters.map((chapter: any) => ({
        id: chapter.id,
        title: chapter.title
      }))
    } else {
      ElMessage.error('Invalid data format received from API')
    }
  } catch (error) {
    ElMessage.error('Failed to load chapters')
  }
}

const loadLanguages = async () => {
  try {
    const response = await fetchSupports()
    if (Array.isArray(response.data.supports)) {
      languages.value = response.data.supports.map((lang: any) => ({
        language_code: lang.language_code,
        language_name: lang.language_name
      }))
    } else {
      ElMessage.error('Invalid data format received from API')
    }
  } catch (error) {
    ElMessage.error('Failed to load languages')
  }
}

const openDialog = (trans: MachineTranslation | null) => {
  if (trans) {
    formData.value = { ...trans }
  } else {
    formData.value = {
      id: null,
      chapter_id: null,
      translated_content: '',
      source_language: '',
      target_language: '',
      translation_engine: ''
    }
  }
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (formData.value.id) {
          await updateMachineTranslation(formData.value.id, {
            translated_content: formData.value.translated_content,
            translation_engine: formData.value.translation_engine
          })
          ElMessage.success('Translation updated successfully')
        } else {
          await createMachineTranslation({
            chapter_id: formData.value.chapter_id!,
            translated_content: formData.value.translated_content,
            source_language: formData.value.source_language,
            target_language: formData.value.target_language,
            translation_engine: formData.value.translation_engine
          })
          ElMessage.success('Translation added successfully')
        }
        dialogVisible.value = false
        loadTranslations()
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || 'Failed to submit translation')
      }
    } else {
      ElMessage.error('Please fill in the required fields')
    }
  })
}

const deleteTranslation = async (id: number) => {
  try {
    await deleteMachineTranslation(id)
    ElMessage.success('Translation deleted successfully')
    loadTranslations()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Failed to delete translation')
  }
}

onMounted(() => {
  loadTranslations()
  loadChapters()
  loadLanguages()
})
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
