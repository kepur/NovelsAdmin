<script lang="ts" setup>
import {
  fetchNovelChapters,
  createNovelChapter,
  updateNovelChapter,
  deleteNovelChapter
} from '@/utils/novel' // 导入章节 API 方法

import { ref, onMounted, computed } from 'vue'

interface NovelChapter {
  id: number
  created_at: string
  title: string
  content: string
}

// 搜索输入状态
const search = ref('')

// 保存章节数据
const chapters = ref<NovelChapter[]>([])

// 过滤章节数据（搜索）
const filteredChapters = computed(() =>
  chapters.value.filter((chapter) =>
    chapter.title.toLowerCase().includes(search.value.toLowerCase())
  )
)

// 加载章节数据
const loadChapters = async () => {
  try {
    const response = await fetchNovelChapters()
    chapters.value = response.data.chapters // 假设后端返回 { chapters: [...] }
  } catch (error) {
    console.error('Failed to fetch chapters:', error)
  }
}

// 新增章节
const newChapter = ref({ title: '', content: '' })
const createChapter = async () => {
  try {
    await createNovelChapter(newChapter.value)
    await loadChapters() // 刷新章节数据
  } catch (error) {
    console.error('Failed to create chapter:', error)
  }
}

// 编辑章节
const editChapterForm = ref<NovelChapter | null>(null)
const updateChapter = async () => {
  if (!editChapterForm.value) return
  try {
    await updateNovelChapter(editChapterForm.value.id, editChapterForm.value)
    await loadChapters() // 刷新章节数据
  } catch (error) {
    console.error('Failed to update chapter:', error)
  }
}

// 删除章节
const handleDelete = async (id: number) => {
  try {
    await deleteNovelChapter(id)
    await loadChapters() // 刷新章节数据
  } catch (error) {
    console.error('Failed to delete chapter:', error)
  }
}

// 页面加载时初始化章节数据
onMounted(loadChapters)
</script>
