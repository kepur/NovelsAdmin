<template>
  <div>
    <el-button type="primary" @click="openDialog">Add New GenFictionImage</el-button>
    <el-table :data="genImages" style="width: 100%" v-loading="loading" border>
      <el-table-column prop="id" label="ID"></el-table-column>
      <el-table-column prop="novel_name" label="Novel"></el-table-column>
      <el-table-column prop="chapter_title" label="Chapter"></el-table-column>
      <el-table-column prop="image_url" label="Image URL">
        <template #default="scope">
          <el-link :href="scope.row.image_url" target="_blank">
            <img :src="scope.row.image_url" alt="Generated Image" width="100" />
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="image_file_name" label="Image File"></el-table-column>
      <el-table-column prop="created_at" label="Created At"></el-table-column>
      <el-table-column label="Actions">
        <template #default="scope">
          <el-button size="small" type="danger" @click="deleteImage(scope.row.id)">
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Add Image Dialog -->
    <el-dialog v-model="dialogVisible" title="Generate New Image">
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

        <!-- Select Stable Diffusion Param -->
        <el-form-item label="Prompt Type" prop="sd_id">
          <el-select v-model="formData.sd_id" placeholder="Select Prompt Type">
            <el-option
              v-for="param in sdParams"
              :key="param.id"
              :label="param.prompt_text"
              :value="param.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <!-- Number of Segments -->
        <el-form-item label="Num Segments" prop="num_segments">
          <el-slider
            v-model="formData.num_segments"
            :min="1"
            :max="5"
            :step="1"
            show-tooltip
          ></el-slider>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitForm">Generate</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  FetchGenImages,
  createGenImage,
  deleteGenImage,
} from "@/utils/generation_image";
import { fetchNovels, fetchChaptersByNovel } from "@/utils/novel";
import { fetchStableDiffusionParams } from "@/utils/prompts";

interface GenImage {
  id: number;
  chapter_id: number;
  novel_name: string;
  chapter_title: string;
  image_url: string;
  image_file_name: string;
  created_at: string;
}

interface Novel {
  id: number;
  name: string;
}

interface Chapter {
  id: number;
  title: string;
}

interface StableParam {
  id: number;
  prompt_text: string;
}

const dialogVisible = ref(false);
const genImages = ref<GenImage[]>([]);
const novels = ref<Novel[]>([]);
const chapters = ref<Chapter[]>([]);
const sdParams = ref<StableParam[]>([]);
const loading = ref(false);

const formData = ref<{
  novel_id: number | null;
  chapter_id: number | null;
  sd_id: number | null;
  num_segments: number;
}>({
  novel_id: null,
  chapter_id: null,
  sd_id: null,
  num_segments: 1, 
});


const formRef = ref();

const rules = {
  novel_id: [{ required: true, message: "Please select a novel", trigger: "change" }],
  chapter_id: [{ required: true, message: "Please select a chapter", trigger: "change" }],
  sd_id: [{ required: true, message: "Please select a prompt type", trigger: "change" }],
  num_segments: [{ required: true, message: "Please set the number of segments", trigger: "change" }],
};

const loadGenImages = async () => {
  loading.value = true;
  try {
    const response = await FetchGenImages();
    genImages.value = response.data.gen_images;
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || "Failed to load GenImages");
  } finally {
    loading.value = false;
  }
};

const loadNovels = async () => {
  try {
    const response = await fetchNovels();
    novels.value = response.data.novels;
  } catch (error) {
    ElMessage.error("Failed to load novels");
  }
};

const loadStableDiffusionParams = async () => {
  try {
    const response = await fetchStableDiffusionParams();
    sdParams.value = response.data;
  } catch (error) {
    ElMessage.error("Failed to load Stable Diffusion Params");
  }
};

const onNovelChange = async (novelId: number) => {
  try {
    const response = await fetchChaptersByNovel(novelId);
    chapters.value = response.data.chapters;
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || "Failed to load chapters");
  }
};

const deleteImage = async (id: number) => {
  try {
    await deleteGenImage(id);
    ElMessage.success("Image deleted successfully");
    loadGenImages(); // 刷新页面
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || "Failed to delete image");
  }
};

const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        await createGenImage({
          chapter_id: formData.value.chapter_id as number,
          num_segments: formData.value.num_segments,
          sd_id: formData.value.sd_id as number,
        });

        ElMessage.success("Image generation started");
        dialogVisible.value = false;
        loadGenImages(); // 直接刷新页面
      } catch (error: any) {
        ElMessage.error(
          error.response?.data?.message || "Failed to create GenImage"
        );
      }
    } else {
      ElMessage.error("Please fill in the required fields");
    }
  });
};
const openDialog = () => {
  formData.value = {
    novel_id: null,
    chapter_id: null,
    sd_id: null,
    num_segments: 1,
  };
  chapters.value = [];
  dialogVisible.value = true;
};

onMounted(() => {
  loadGenImages();
  loadNovels();
  loadStableDiffusionParams();
});
</script>

<style scoped>
.el-table th,
.el-table td {
  text-align: center;
}
</style>
