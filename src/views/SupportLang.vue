<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  fetchSupports,
  createSupport,
  updateSupport,
  deleteSupport as deleteSupportAPI
} from '@/utils/lang'

interface Support {
  id: number | null
  language_code: string
  language_name: string
  created_at?: string
}

const supports = ref<Support[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const searchLang = ref(''); 
const currentPage = ref(1); 
const pageSize = ref(5); 
const totalItems = ref(0); 

const formData = ref<Support>({
  id: null,
  language_code: '',
  language_name: ''
})
const formRef = ref() 

const rules = {
  language_code: [{ required: true, message: 'Please enter Language Code', trigger: 'blur' }],
  language_name: [{ required: true, message: 'Please enter Language Name', trigger: 'blur' }]
}


const loadSupports = async () => {
  loading.value = true
  try {
    const response = await fetchSupports({
      page: currentPage.value,
      per_page: pageSize.value,
      search: searchLang.value
    })
    if (Array.isArray(response.data.data)) {
      supports.value = response.data.data
      totalItems.value = response.data.total
    } else {
      ElMessage.error('Invalid data format received from API')
    }
  } catch (error) {
    ElMessage.error('Failed to load supports')
  } finally {
    loading.value = false
  }
}

const openDialog = (support: Support | null) => {
  if (support) {
    formData.value = { ...support }
  } else {
    formData.value = { id: null, language_code: '', language_name: '' }
  }
  dialogVisible.value = true
}


const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (formData.value.id) {
          await updateSupport(formData.value.id, {
            language_code: formData.value.language_code,
            language_name: formData.value.language_name
          })
          ElMessage.success('Support updated successfully')
        } else {
          await createSupport({
            language_code: formData.value.language_code,
            language_name: formData.value.language_name
          })
          ElMessage.success('Support added successfully')
        }
        dialogVisible.value = false
        loadSupports()
      } catch (error) {
        ElMessage.error('Failed to submit support')
      }
    } else {
      ElMessage.error('Please fill in the required fields')
    }
  })
}

const deleteSupport = async (id: number) => {
  try {
    await deleteSupportAPI(id)
    ElMessage.success('Support deleted successfully')
    loadSupports()
  } catch (error) {
    ElMessage.error('Failed to delete support')
  }
}
const handleSearch = () => {
  currentPage.value = 1; // 
  loadSupports();
};

const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize;
  loadSupports(); // 
};

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage;
  loadSupports(); // 
};


onMounted(() => {
  loadSupports()
})
</script>

<template>
  <div>
    <el-button type="primary" @click="openDialog(null)">Add New Language Support</el-button>
    <el-input v-model="searchLang" placeholder="Search Languages" style="width: 200px; margin-left: 15px;" @input="handleSearch"></el-input>
    <el-button type="primary" @click="handleSearch" style="margin-left: 15px;">reload</el-button>
    <el-table :data="supports" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60"></el-table-column>
      <el-table-column prop="language_code" label="Language Code"></el-table-column>
      <el-table-column prop="language_name" label="Language Name"></el-table-column>
      <el-table-column prop="created_at" label="Created At"></el-table-column>
      <el-table-column label="Actions" width="180">
        <template #default="scope">
          <el-button size="small" @click="openDialog(scope.row)">Edit</el-button>
          <el-button size="small" type="danger" @click="deleteSupport(scope.row.id)"
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
    <el-dialog v-model="dialogVisible" title="Support Convert Language">
      <el-form :model="formData" ref="formRef" :rules="rules" label-width="120px">
        <!-- Language Code -->
        <el-form-item label="Language Code" prop="language_code">
          <el-input v-model="formData.language_code" placeholder="Enter Language Code"></el-input>
        </el-form-item>
        <!-- Language Name -->
        <el-form-item label="Language Name" prop="language_name">
          <el-input v-model="formData.language_name" placeholder="Enter Language Name"></el-input>
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
