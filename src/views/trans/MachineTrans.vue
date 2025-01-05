<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  fetchMachineTranslations,
  createMachineTranslation,
  deleteMachineTranslation
} from '@/utils/trans'
import { fetchChapterChoices,fetchNovelChoices,fetchChaptersByNovel} from '@/utils/novel'
import { fetchSupportLangChoices,fetchTransEngines } from '@/utils/lang'

interface TransEngineData {
    trans_engine: string[];
}

interface Novel {
  id: number
  name: string
}

interface Chapter {
  id: number
  title: string
}

interface Language {
  id: number
  language_name: string
}

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
interface createMachineTranslation{
  chapter_id: number|null
  source_language: string
  target_language: string
  trans_engine: string
}

const transEngines = ref<string[]>([]);
const translations = ref<MachineTranslation[]>([])
const chapters = ref<Chapter[]>([])
const novels = ref<Novel[]>([])
const languages = ref<Language[]>([])
const selectedNovelId = ref<number | null>(null); //when to choose novel

const searchMachine = ref(''); 
const currentPage = ref(1); 
const pageSize = ref(5); 
const totalItems = ref(0); 
const loading = ref(false)
const dialogVisible = ref(false)

const formData = ref<createMachineTranslation>({
  chapter_id: null,
  source_language: '',
  target_language: '',
  trans_engine: ''
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
  trans_engine: [
    { required: true, message: 'Please select Translation Engine', trigger: 'change' }
  ],
}

const loadTranslations = async () => {
  loading.value = true
  try {
    const response = await fetchMachineTranslations({
      page: currentPage.value,
      per_page: pageSize.value,
      search: searchMachine.value
    })
    if (Array.isArray(response.data.data)) {
      translations.value = response.data.data
      totalItems.value=response.data.total
    } else {
      ElMessage.error('Invalid loadTranslations data format received from API')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Failed to load translations')
  } finally {
    loading.value = false
  }
}

const loadTransEngines = async () => {
  try {
    const response = await fetchTransEngines(); 
    const data = response.data as TransEngineData; 
    if (Array.isArray(data.trans_engine)) {
      transEngines.value = data.trans_engine;
    } else {
      ElMessage.error('Invalid data format received from API');
    }
  } catch (error) {
    ElMessage.error('Failed to load translation engines');
  }
};
// Load all Novels
const loadNovels = async () => {
  try {
    const response = await fetchNovelChoices()
    if (Array.isArray(response.data.novels)) {
      novels.value = response.data.novels
    } else {
      ElMessage.error('Invalid loadNovels data format received from API')
    }
  } catch (error) {
    ElMessage.error('Failed to load novels')
  }
}

// Load all Chapters
const loadChapters = async () => {
  try {
    const response = await fetchChapterChoices()
    if (Array.isArray(response.data.chapters)) {
      chapters.value = response.data.chapters
    } else {
      ElMessage.error('Invalid loadChapters data format received from API')
    }
  } catch (error) {
    ElMessage.error('Failed to load chapters')
  }
}

//load all languages
const loadLanguages = async () => {
  try {
    const response = await fetchSupportLangChoices()
    if (Array.isArray(response.data.supports)) {
      languages.value = response.data.supports
    } else {
      ElMessage.error('Invalid loadLanguages data format received from API')
    }
  } catch (error) {
    ElMessage.error('Failed to load languages')
  }
}

const openDialog = (trans: createMachineTranslation | null) => {
  if (trans) {
    formData.value = { ...trans }
  } else {
    formData.value = {
      chapter_id: null,
      source_language: '',
      target_language: '',
      trans_engine: ''
    }
  }
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      console.log(formData.value);
      try {
        await createMachineTranslation({
          chapter_id: formData.value.chapter_id!,
          source_language: formData.value.source_language,
          target_language: formData.value.target_language,
          trans_engine: formData.value.trans_engine,
        });

        ElMessage.success('Translation added successfully');

        // after 3s loadTranslations
        setTimeout(() => {
          loadTranslations();
        }, 3000); 
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || 'Failed to submit translation');
      }
    }
  });
};

const deleteTranslation = async (id: number) => {
  try {
    await deleteMachineTranslation(id)
    ElMessage.success('Translation deleted successfully')
    loadTranslations()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Failed to delete translation')
  }
}
const handleSearch = () => {
  currentPage.value = 1; // 
  loadTranslations();
};

const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize;
  loadTranslations(); // 
};

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage;
  loadTranslations(); // 
};

// Load chapters based on selected novel
const onNovelChange = async (novelId: number) => {
  selectedNovelId.value = novelId; 
  try {
    const response = await fetchChaptersByNovel(novelId);
    if (Array.isArray(response.data.chapters)) {
      chapters.value = response.data.chapters; 
    } else {
      ElMessage.error('Invalid data format received from API');
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Failed to load chapters');
  }
};

onMounted(() => {
  loadNovels()
  loadTranslations()
  loadChapters()
  loadLanguages()
  loadTransEngines()
})
</script>

<template>
  <div>
    <el-button type="primary" @click="openDialog(null)">Add New Translation</el-button>
    <el-input v-model="searchMachine" placeholder="Search Transhistory" style="width: 200px; margin-left: 15px;" @input="handleSearch"></el-input>
    <el-button type="primary" @click="handleSearch" style="margin-left: 15px;">reload</el-button>
    <el-table :data="translations" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60"></el-table-column>
      <el-table-column prop="chapter_title" label="Chapter"></el-table-column>
      <el-table-column prop="source_language_name" label="Source Language"></el-table-column>
      <el-table-column prop="target_language_name" label="Target Language"></el-table-column>
      <el-table-column prop="translation_engine" label="Engine"></el-table-column>
      <el-table-column prop="translated_content" label="Trans Content">
      <template #default="{ row }">
          <div class="two-line-ellipsis">
            {{ row.translated_content }}
          </div>
        </template>
      </el-table-column>      
    <el-table-column prop="created_at" label="Created At"></el-table-column>
      <el-table-column label="Actions" width="180">
        <template #default="scope">
          <el-button size="small" type="danger" @click="deleteTranslation(scope.row.id)"
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
    <el-dialog v-model="dialogVisible" title="Translation">
      <el-form :model="formData" ref="formRef" :rules="rules" label-width="120px">
        <!-- Select Novel -->
        <el-form-item label="Novel" prop="novel_id">
          <el-select
            v-model="selectedNovelId"
            placeholder="Select Novel"
            @change="onNovelChange"
          >
            <el-option
              v-for="novel in novels"
              :key="novel.id"
              :label="novel.name"
              :value="novel.id"
            ></el-option>
          </el-select>
        </el-form-item>
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
              :key="lang.id"
              :label="lang.language_name"
              :value="lang.language_name"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- Target Language -->
        <el-form-item label="Target Language" prop="target_language">
          <el-select v-model="formData.target_language" placeholder="Select Target Language">
            <el-option
              v-for="lang in languages"
              :key="lang.id"
              :label="lang.language_name"
              :value="lang.language_name"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- Translation Engine -->
        <el-form-item label="Translation Engine" prop="translation_engine">
          <el-select v-model="formData.trans_engine" placeholder="Select Translation Engine">
            <el-option v-for="engine in transEngines" :key="engine" :label="engine" :value="engine"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitForm">Confirm to Process</el-button>
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
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 3em;
  line-height: 1.5em;
}
</style>
