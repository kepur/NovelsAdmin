
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  fetchConvertHistories,
  updateConvertHistory,
  deleteConvertHistory
} from '@/utils/converthistories'
import { fetchChapterChoices } from '@/utils/novel'
import { fetchSupportLangChoices } from '@/utils/lang'

interface ConvertHistory {
  id: number | null
  chapter_id: number | null
  chapter_title?: string
  target_language_name?: string|null
  is_translated: boolean
  is_audio_generated: boolean
  is_video_generated: boolean
  created_at?: string
}
const searchHistory = ref(''); 
const currentPage = ref(1); 
const pageSize = ref(5); 
const totalItems = ref(0); 

const histories = ref<ConvertHistory[]>([])
const chapters = ref<{ id: number; title: string }[]>([])
const languages = ref<{ id: number; language_name: string }[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
type NewType = ConvertHistory

const formData = ref<NewType>({
  id: null,
  chapter_id: null,
  is_translated: false,
  is_audio_generated: false,
  is_video_generated: false
})
const formRef = ref()
const rules = {
  chapter_id: [{ required: true, message: 'Please select Chapter', trigger: 'change' }],
}

const loadHistories = async () => {
  loading.value = true
  try {
    const response = await fetchConvertHistories(
      {
        page: currentPage.value,
        per_page: pageSize.value,
        search: searchHistory.value
      }
    )
    if (Array.isArray(response.data.histories)) {
      histories.value = response.data.histories
      totalItems.value=response.data.total;
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
    const response = await fetchChapterChoices()
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
    const response = await fetchSupportLangChoices()
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

const handleSearch = () => {
  currentPage.value = 1; // 
  loadHistories();
};

const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize;
  loadHistories(); // 
};

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage;
  loadHistories(); // 
};


onMounted(() => {
  loadHistories()
  loadChapters()
  loadLanguages()
})
</script>

<template>
  <div>
    <el-input v-model="searchHistory" placeholder="Search Audio" style="width: 200px; margin-left: 15px;" @input="handleSearch"></el-input>
    <el-button type="primary" @click="handleSearch" style="margin-left: 15px;">reload</el-button>    
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
          <!-- <el-button size="small" type="danger" @click="deleteHistory(scope.row.id)"
            >Delete</el-button
          > -->
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-size="pageSize"
          :total="totalItems"
          layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" title="Convert History"style='width: 550px;'>
      <el-form :model="formData" ref="formRef" :rules="rules" label-width="180px">
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
        <el-form-item label="Target Language">
          <span>{{ formData.target_language_name }}</span>
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

<style scoped>
.dialog-footer {
  text-align: right;
}
.el-form-item{
  width: 450px;
}
</style>
