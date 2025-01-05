<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  fetchUserCorrections,
  createUserCorrection,
  updateUserCorrection,
  deleteUserCorrection
} from '@/utils/corrections'
import { fetchMachineTransChoices } from '@/utils/trans'

interface UserCorrection {
  id: number | null
  machine_translation_id: number | null
  machine_translation_content?: string
  corrected_content: string
  user_id?: number
  username?: string
  created_at?: string
}

const corrections = ref<UserCorrection[]>([])
const translations = ref<{ id: number; translated_content: string }[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const formData = ref<UserCorrection>({
  id: null,
  machine_translation_id: null,
  corrected_content: ''
})
const formRef = ref()
const rules = {
  machine_translation_id: [
    { required: true, message: 'Please select Machine Translation', trigger: 'change' }
  ],
  corrected_content: [
    { required: true, message: 'Please enter Corrected Content', trigger: 'blur' }
  ]
}

const loadCorrections = async () => {
  loading.value = true
  try {
    const response = await fetchUserCorrections()
    if (Array.isArray(response.data.corrections)) {
      corrections.value = response.data.corrections
    } else {
      ElMessage.error('Invalid data format received from API')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Failed to load corrections')
  } finally {
    loading.value = false
  }
}

const loadTranslations = async () => {
  try {
    const response = await fetchMachineTransChoices()
    if (Array.isArray(response.data.translations)) {
      translations.value = response.data.translations.map((trans: any) => ({
        id: trans.id,
        translated_content: trans.translated_content
      }))
    } else {
      ElMessage.error('Invalid data format received from API')
    }
  } catch (error) {
    ElMessage.error('Failed to load machine translations')
  }
}

const openDialog = (correction: UserCorrection | null) => {
  if (correction) {
    formData.value = { ...correction }
  } else {
    formData.value = {
      id: null,
      machine_translation_id: null,
      corrected_content: ''
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
          await updateUserCorrection(formData.value.id, {
            corrected_content: formData.value.corrected_content
          })
          ElMessage.success('Correction updated successfully')
        } else {
          await createUserCorrection({
            machine_translation_id: formData.value.machine_translation_id!,
            corrected_content: formData.value.corrected_content
          })
          ElMessage.success('Correction added successfully')
        }
        dialogVisible.value = false
        loadCorrections()
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || 'Failed to submit correction')
      }
    } else {
      ElMessage.error('Please fill in the required fields')
    }
  })
}

const deleteCorrection = async (id: number) => {
  try {
    await deleteUserCorrection(id)
    ElMessage.success('Correction deleted successfully')
    loadCorrections()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Failed to delete correction')
  }
}

onMounted(() => {
  loadCorrections()
  loadTranslations()
})
</script>
<template>
  <div>
    <!-- <el-button type="primary" @click="openDialog(null)">Add New Correction</el-button> -->
    <el-table :data="corrections" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60"></el-table-column>
      <el-table-column
        prop="machine_translation_content"
        label="Machine Translation"
      ></el-table-column>
      <el-table-column prop="username" label="User"></el-table-column>
      <el-table-column prop="created_at" label="Created At"></el-table-column>
      <el-table-column label="Actions" width="180">
        <template #default="scope">
          <el-button size="small" @click="openDialog(scope.row)">Edit</el-button>
          <el-button size="small" type="danger" @click="deleteCorrection(scope.row.id)"
            >Delete</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" title="Correction">
      <el-form :model="formData" ref="formRef" :rules="rules" label-width="120px">
        <!-- Machine Translation -->
        <el-form-item label="Machine Translation" prop="machine_translation_id">
          <el-select
            v-model="formData.machine_translation_id"
            placeholder="Select Machine Translation"
          >
            <el-option
              v-for="trans in translations"
              :key="trans.id"
              :label="trans.translated_content"
              :value="trans.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- Corrected Content -->
        <el-form-item label="Corrected Content" prop="corrected_content">
          <el-input
            v-model="formData.corrected_content"
            type="textarea"
            placeholder="Enter Corrected Content"
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
