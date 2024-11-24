<template>
  <div>
    <!-- <el-button type="primary" @click="openDialog(null)">Add New Convert History</el-button> -->
    <el-table :data="histories" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60"></el-table-column>
      <el-table-column prop="chapter_title" label="Chapter"></el-table-column>
      <el-table-column prop="target_language_name" label="Target Language"></el-table-column>
      <el-table-column prop="is_translated" label="Translated"></el-table-column>
      <el-table-column prop="is_audio_generated" label="Audio Generated"></el-table-column>
      <el-table-column prop="is_video_generated" label="Video Generated"></el-table-column>
      <el-table-column prop="created_at" label="Created At"></el-table-column>
      <el-table-column label="Actions" width="180">
        <template #default="scope">
          <el-button size="small" @click="openDialog(scope.row)">Edit</el-button>
          <el-button size="small" type="danger" @click="deleteHistory(scope.row.id)"
            >Delete</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" title="Convert History">
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
        <!-- Target Language -->
        <el-form-item label="Target Language" prop="target_language_id">
          <el-select v-model="formData.target_language_id" placeholder="Select Target Language">
            <el-option
              v-for="lang in languages"
              :key="lang.id"
              :label="lang.language_name"
              :value="lang.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- Is Translated -->
        <el-form-item label="Is Translated" prop="is_translated">
          <el-switch v-model="formData.is_translated"></el-switch>
        </el-form-item>
        <!-- Is Audio Generated -->
        <el-form-item label="Is Audio Generated" prop="is_audio_generated">
          <el-switch v-model="formData.is_audio_generated"></el-switch>
        </el-form-item>
        <!-- Is Video Generated -->
        <el-form-item label="Is Video Generated" prop="is_video_generated">
          <el-switch v-model="formData.is_video_generated"></el-switch>
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
  fetchConvertHistories,
  createConvertHistory,
  updateConvertHistory,
  deleteConvertHistory
} from '@/utils/converthistories'
import { fetchChapters } from '@/utils/novel'
import { fetchSupports } from '@/utils/lang'

interface ConvertHistory {
  id: number | null
  chapter_id: number | null
  chapter_title?: string
  target_language_id: number | null
  target_language_name?: string
  is_translated: boolean
  is_audio_generated: boolean
  is_video_generated: boolean
  created_at?: string
}

const histories = ref<ConvertHistory[]>([])
const chapters = ref<{ id: number; title: string }[]>([])
const languages = ref<{ id: number; language_name: string }[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const formData = ref<ConvertHistory>({
  id: null,
  chapter_id: null,
  target_language_id: null,
  is_translated: false,
  is_audio_generated: false,
  is_video_generated: false
})
const formRef = ref()
const rules = {
  chapter_id: [{ required: true, message: 'Please select Chapter', trigger: 'change' }],
  target_language_id: [
    { required: true, message: 'Please select Target Language', trigger: 'change' }
  ]
}

const loadHistories = async () => {
  loading.value = true
  try {
    const response = await fetchConvertHistories()
    if (Array.isArray(response.data.histories)) {
      histories.value = response.data.histories
    } else {
      ElMessage.error('Invalid data format received from API')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Failed to load convert histories')
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

const openDialog = (history: ConvertHistory | null) => {
  if (history) {
    formData.value = { ...history }
  } else {
    formData.value = {
      id: null,
      chapter_id: null,
      target_language_id: null,
      is_translated: false,
      is_audio_generated: false,
      is_video_generated: false
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
          await updateConvertHistory(formData.value.id, {
            is_translated: formData.value.is_translated,
            is_audio_generated: formData.value.is_audio_generated,
            is_video_generated: formData.value.is_video_generated
          })
          ElMessage.success('Convert history updated successfully')
        } else {
          await createConvertHistory({
            chapter_id: formData.value.chapter_id!,
            target_language_id: formData.value.target_language_id!,
            is_translated: formData.value.is_translated,
            is_audio_generated: formData.value.is_audio_generated,
            is_video_generated: formData.value.is_video_generated
          })
          ElMessage.success('Convert history added successfully')
        }
        dialogVisible.value = false
        loadHistories()
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || 'Failed to submit convert history')
      }
    } else {
      ElMessage.error('Please fill in the required fields')
    }
  })
}

const deleteHistory = async (id: number) => {
  try {
    await deleteConvertHistory(id)
    ElMessage.success('Convert history deleted successfully')
    loadHistories()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Failed to delete convert history')
  }
}

onMounted(() => {
  loadHistories()
  loadChapters()
  loadLanguages()
})
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
