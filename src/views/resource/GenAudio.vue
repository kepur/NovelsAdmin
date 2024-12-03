<template>
  <div>
    <el-button type="primary" @click="openDialog">Add New Audio</el-button>
    <el-table :data="genAudios" style="width: 100%" v-loading="loading" border>
      <el-table-column prop="id" label="ID" width="100"></el-table-column>
      <el-table-column prop="chapter_title" label="Chapter" width="100"></el-table-column>
      <el-table-column prop="audio_style_name" label="Audio Style" width="100"></el-table-column>
      <el-table-column prop="audio_url" label="Audio File" width="100">
        <template #default="scope">
          <el-link :href="scope.row.audio_url" target="_blank">
            {{ scope.row.audio_file_name }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="Created At" width="100"></el-table-column>
      <el-table-column label="Actions" width="auto">
        <template #default="scope">
          <div class="actions-container">
            <el-button
              size="small"
              type="primary"
              @click="toggleAudio(scope.row.id, scope.row.audio_url)"
              class="action-button"
            >
              {{ isPlaying(scope.row.id) ? 'Pause' : 'Play' }}
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="deleteAudio(scope.row.id)"
              class="action-button"
            >
              Delete
            </el-button>
          </div>
          <!-- Audio Player -->
          <div v-if="currentAudioId === scope.row.id" class="audio-player-container">
            <audio
              ref="audioPlayers"
              :src="scope.row.audio_url"
              controls
              @ended="onAudioEnded"
            ></audio>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- Add Audio Dialog -->
    <el-dialog v-model="dialogVisible" title="Generate New Audio">
      <el-form :model="formData" ref="formRef" :rules="rules" label-width="120px">
        <!-- Select Novel -->
        <el-form-item label="Novel" prop="novel_id">
          <el-select v-model="formData.novel_id" placeholder="Select Novel" @change="onNovelChange">
            <el-option
              v-for="novel in novels"
              :key="novel.id"
              :label="novel.name"
              :value="novel.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- Select Chapter -->
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
        <!-- Select Audio Style -->
        <el-form-item label="Audio Style" prop="audio_style_id">
          <el-select v-model="formData.audio_style_id" placeholder="Select Audio Style">
            <el-option
              v-for="style in audioStyles"
              :key="style.id"
              :label="style.name"
              :value="style.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- Speech Rate Slider -->
        <el-form-item label="Speech Rate" prop="speech_rate">
          <el-slider
            v-model="formData.speech_rate"
            :min="-50"
            :max="50"
            :step="10"
            show-tooltip
            :marks="marks"
            :format-tooltip="formatTooltip"
          ></el-slider>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitForm">Generate</el-button>
      </template>
    </el-dialog>

    <!-- Progress Dialog -->
    <el-dialog
      v-model="progressDialogVisible"
      title="Audio Generation Progress"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <el-progress
        :percentage="progress"
        :status="progress < 100 ? 'success' : 'success'"
      ></el-progress>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import {
  fetchGenAudios,
  createGenAudio,
  deleteGenAudio,
  fetchGenAudio
} from '@/utils/generation_audio'
import { fetchNovels, fetchChaptersByNovel } from '@/utils/novel'
import { fetchAudioStyles } from '@/utils/lang'

interface GenAudio {
  id: number
  chapter_id: number
  chapter_title: string
  audio_url: string
  audio_file_name: string
  audio_style_id: number
  audio_style_name: string
  created_at: string
}

interface Novel {
  id: number
  name: string
}

interface Chapter {
  id: number
  title: string
}

interface AudioStyle {
  id: number
  name: string
}

const genAudios = ref<GenAudio[]>([])
const novels = ref<Novel[]>([])
const chapters = ref<Chapter[]>([])
const audioStyles = ref<AudioStyle[]>([])
const loading = ref(false)

const dialogVisible = ref(false)
const progressDialogVisible = ref(false)
const progress = ref(0)
const formRef = ref<InstanceType<typeof ElForm>>()
const formData = ref({
  novel_id: null,
  chapter_id: null,
  audio_style_id: null,
  speech_rate: 0
})
const rules = {
  novel_id: [{ required: true, message: 'Please select a novel', trigger: 'change' }],
  chapter_id: [{ required: true, message: 'Please select a chapter', trigger: 'change' }],
  audio_style_id: [{ required: true, message: 'Please select an audio style', trigger: 'change' }],
  speech_rate: [{ required: true, message: 'Please set speech rate', trigger: 'change' }]
}

const marks = {
  '-50': '-50%',
  '-40': '-40%',
  '-30': '-30%',
  '-20': '-20%',
  '-10': '-10%',
  '0': '0%',
  '10': '+10%',
  '20': '+20%',
  '30': '+30%',
  '40': '+40%',
  '50': '+50%'
}

const formatTooltip = (val: number) => `${val >= 0 ? '+' : ''}${val}%`

const currentAudioId = ref<number | null>(null)

// Load all GenAudios
const loadGenAudios = async () => {
  loading.value = true
  try {
    const response = await fetchGenAudios()
    if (Array.isArray(response.data.gen_audios)) {
      genAudios.value = response.data.gen_audios
    } else {
      ElMessage.error('Invalid data format received from API')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Failed to load GenAudios')
  } finally {
    loading.value = false
  }
}

// Load all Novels
const loadNovels = async () => {
  try {
    const response = await fetchNovels()
    if (Array.isArray(response.data.novels)) {
      novels.value = response.data.novels
    } else {
      ElMessage.error('Invalid data format received from API')
    }
  } catch (error) {
    ElMessage.error('Failed to load novels')
  }
}

// Load all AudioStyles
const loadAudioStyles = async () => {
  try {
    const response = await fetchAudioStyles()
    if (Array.isArray(response.data.audio_styles)) {
      audioStyles.value = response.data.audio_styles
    } else {
      ElMessage.error('Invalid data format received from API')
    }
  } catch (error) {
    ElMessage.error('Failed to load audio styles')
  }
}

// Load chapters based on selected novel
const onNovelChange = async (novelId: number) => {
  try {
    const response = await fetchChaptersByNovel(novelId)
    if (Array.isArray(response.data.chapters)) {
      chapters.value = response.data.chapters
    } else {
      ElMessage.error('Invalid data format received from API')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Failed to load chapters')
  }
}

// Open Add Audio Dialog
const openDialog = () => {
  formData.value = {
    novel_id: null,
    chapter_id: null,
    audio_style_id: null,
    speech_rate: 0
  }
  chapters.value = []
  dialogVisible.value = true
}

// Submit Form
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        progress.value = 0
        progressDialogVisible.value = true
        const speechRate =
          formData.value.speech_rate >= 0
            ? `+${formData.value.speech_rate}%`
            : `${formData.value.speech_rate}%`
        const response = await createGenAudio({
          chapter_id: formData.value.chapter_id!,
          audio_style_id: formData.value.audio_style_id!,
          speech_rate: speechRate
        })
        ElMessage.success('Audio generation started')
        dialogVisible.value = false
        loadGenAudios()

        // Polling task status
        const checkProgress = async () => {
          try {
            const pollResponse = await fetchGenAudio(response.data.id)
            const audio = pollResponse.data.gen_audio
            if (audio.audio_url) {
              progress.value = 100
              progressDialogVisible.value = false
              ElMessage.success('Audio generation completed')
              genAudios.value.push(audio)
            } else {
              progress.value += 10
              if (progress.value >= 100) {
                progress.value = 100
                progressDialogVisible.value = false
              } else {
                setTimeout(checkProgress, 1000)
              }
            }
          } catch (error: any) {
            ElMessage.error(error.response?.data?.message || 'Failed to check progress')
            progressDialogVisible.value = false
          }
        }

        setTimeout(checkProgress, 1000)
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || 'Failed to create GenAudio')
        progressDialogVisible.value = false
      }
    } else {
      ElMessage.error('Please fill in the required fields')
    }
  })
}

// Delete GenAudio
const deleteAudio = async (id: number) => {
  try {
    await deleteGenAudio(id)
    ElMessage.success('GenAudio deleted successfully')
    loadGenAudios()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Failed to delete GenAudio')
  }
}

// Toggle Audio Player
const toggleAudio = (id: number, url: string) => {
  if (currentAudioId.value === id) {
    // If clicking the same row, pause and hide the audio player
    currentAudioId.value = null
    const audioElement = document.getElementById(`audio-player-${id}`) as HTMLAudioElement
    if (audioElement) {
      audioElement.pause()
      audioElement.currentTime = 0
    }
  } else {
    // If clicking a different row, set currentAudioId to the new id
    currentAudioId.value = id
  }
}

// Check if a row is currently playing
const isPlaying = (id: number) => {
  return currentAudioId.value === id
}

// Handle audio ended event
const onAudioEnded = () => {
  currentAudioId.value = null
}

onMounted(() => {
  loadGenAudios()
  loadNovels()
  loadAudioStyles()
})
</script>

<style scoped>
.actions-container {
  display: flex;
  align-items: center;
}

.action-button {
  margin-right: 10px;
  width: 200px;
}

.audio-player-container {
  margin-top: 10px;
}

.el-table th,
.el-table td {
  text-align: center;
}

.el-table-column {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.el-table .el-table__body-wrapper {
  overflow-x: auto;
}

.audio-player {
  width: 100%;
}
</style>
