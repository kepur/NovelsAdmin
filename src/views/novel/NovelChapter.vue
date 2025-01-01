<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  fetchChapters,
  createChapter,
  updateChapter,
  deleteChapter as deleteChapterAPI
} from '@/utils/novel'
import { fetchNovelChoices } from '@/utils/novel' // Existing service

// Define the Chapter interface
interface Chapter {
  id: number | null
  novel_id: number | null
  novel_name?: string
  chapter_number: number
  title: string
  content: string
  created_at?: string
}
const searchChapter = ref(''); 
const currentPage = ref(1); 
const pageSize = ref(5); 
const totalItems = ref(0); 
const chapters = ref<Chapter[]>([])
const novels = ref<{ id: number; name: string }[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const formData = ref<Chapter>({
  id: null,
  novel_id: null,
  chapter_number: 1,
  title: '',
  content: ''
})
const formRef = ref()

const rules = {
  novel_id: [{ required: true, message: 'Please select Novel', trigger: 'change' }],
  chapter_number: [{ required: true, message: 'Please enter Chapter Number', trigger: 'blur' }],
  title: [{ required: true, message: 'Please enter Title', trigger: 'blur' }],
  content: [{ required: true, message: 'Please enter Content', trigger: 'blur' }]
}

const loadChapters = async () => {
  loading.value = true
  try {
    const response = await fetchChapters({
      page: currentPage.value,
      per_page: pageSize.value,
      search: searchChapter.value
    })
    if (Array.isArray(response.data.data)) {
      totalItems.value = response.data.total
      chapters.value = response.data.data
    } else {
      ElMessage.error('Invalid loadChapters data format received from API')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Failed to load chapters')
  } finally {
    loading.value = false
  }
}

const loadNovels = async () => {
  try {
    const response = await fetchNovelChoices()
    if (Array.isArray(response.data.novels)) {
      novels.value = response.data.novels.map((novel: any) => ({
        id: novel.id,
        name: novel.name
      }))
    } else {
      ElMessage.error('Invalid loadNovels data format received from API')
    }
  } catch (error) {
    ElMessage.error('Failed to load novels')
  }
}

const openDialog = (chapter: Chapter | null) => {
  if (chapter) {
    formData.value = { ...chapter }
  } else {
    formData.value = { id: null, novel_id: null, chapter_number: 1, title: '', content: '' }
  }
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (formData.value.id) {
          // Update existing chapter
          await updateChapter(formData.value.id, {
            novel_id: formData.value.novel_id,
            chapter_number: formData.value.chapter_number,
            title: formData.value.title,
            content: formData.value.content
          })
          ElMessage.success('Chapter updated successfully')
        } else {
          // Create new chapter
          await createChapter({
            novel_id: formData.value.novel_id!,
            chapter_number: formData.value.chapter_number,
            title: formData.value.title,
            content: formData.value.content
          })
          ElMessage.success('Chapter added successfully')
        }
        dialogVisible.value = false
        loadChapters()
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || 'Failed to submit chapter')
      }
    } else {
      ElMessage.error('Please fill in the required fields')
    }
  })
}

const deleteChapter = async (id: number) => {
  try {
    await deleteChapterAPI(id)
    ElMessage.success('Chapter deleted successfully')
    loadChapters()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Failed to delete chapter')
  }
}
const handleSearch = () => {
  currentPage.value = 1; // 
  loadChapters();
};

const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize;
  loadChapters(); // 
};

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage;
  loadChapters(); // 
};


onMounted(() => {
  loadChapters()
  loadNovels()
})
</script>
<template>
  <div>
    <el-button type="primary" @click="openDialog(null)">Add New Chapter</el-button>
    <el-input v-model="searchChapter" placeholder="Search Audio" style="width: 200px; margin-left: 15px;" @input="handleSearch"></el-input>
    <el-button type="primary" @click="handleSearch" style="margin-left: 15px;">reload</el-button>
    <el-table :data="chapters" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60"></el-table-column>
      <el-table-column prop="novel_name" label="Novel"></el-table-column>
      <el-table-column prop="chapter_number" label="Chapter Number"></el-table-column>
      <el-table-column prop="title" label="Title"></el-table-column>
      <el-table-column prop="created_at" label="Created At"></el-table-column>
      <el-table-column label="Actions" width="180">
        <template #default="scope">
          <el-button size="small" @click="openDialog(scope.row)">Edit</el-button>
          <el-button size="small" type="danger" @click="deleteChapter(scope.row.id)"
            >Delete</el-button
          >
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
    <el-dialog v-model="dialogVisible" title="Chapter">
      <el-form :model="formData" ref="formRef" :rules="rules" label-width="120px">
        <!-- Novel -->
        <el-form-item label="Novel" prop="novel_id">
          <el-select v-model="formData.novel_id" placeholder="Select Novel">
            <el-option
              v-for="novel in novels"
              :key="novel.id"
              :label="novel.name"
              :value="novel.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- Chapter Number -->
        <el-form-item label="Chapter Number" prop="chapter_number">
          <el-input-number v-model="formData.chapter_number" :min="1"></el-input-number>
        </el-form-item>
        <!-- Title -->
        <el-form-item label="Title" prop="title">
          <el-input v-model="formData.title" placeholder="Enter Chapter Title"></el-input>
        </el-form-item>
        <!-- Content -->
        <el-form-item label="Content" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            placeholder="Enter Chapter Content"
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


<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
