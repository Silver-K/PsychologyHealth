<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import axios from '~/request/axios';
import type { UploadRequestOptions, UploadUserFile } from "element-plus";
import { ElIcon, ElMessage } from 'element-plus';
import { downloadFile, getType, getUniqueId } from '~/helpers/utils';
import { Delete, Download, Reading } from '@element-plus/icons-vue';

interface TheFileT extends UploadUserFile {
  filename: string;
  checked?: boolean;
  fileState?: 'on-cloud' | 'on-upload';
}
interface FileInputPropT {
  inputMode: boolean;
  hasDownload?: boolean;
  onlyUpload?: boolean;
  files?: TheFileT[];
}
const props = defineProps<FileInputPropT>();

interface EmitsT {
  (evt: 'update:files', files: TheFileT[]): void;
}
const emits = defineEmits<EmitsT>();
const fileList = ref<TheFileT[]>([]);

function handlePreview(file: TheFileT) {
  window.open(`/preview?filename=${encodeURIComponent(file.filename)}&type=${getType(file.filename)}`);
}

function uploadFail(name: string, message: string) {
  ElMessage({
    message: `${name}上传失败${message ? `, 原因：${message}` : ''}`,
    type: 'error',
  });
}
function uploadSuccess(file: TheFileT) {
  ElMessage({
    message: `${file.name}上传成功`,
    type: 'success',
  })
}
async function uploadTheFile(options: UploadRequestOptions) {
  const { file } = options;
  const formData = new FormData();
  formData.append('file', file);
  const newFile: TheFileT = {
    name: file.name,
    filename: getUniqueId(),
    checked: false,
    fileState: 'on-upload',
  }
  fileList.value.push(newFile);
  const newFileIndex = fileList.value.length - 1;
  const result = await axios('/api/files/upload', {
    method: 'POST',
    data: formData,
    onUploadProgress(evt) {
      const percent = evt && evt.total ? Math.round(evt.loaded / evt.total * 100) : 0;
      fileList.value[newFileIndex].percentage = percent;
    }
  }).catch((err) => {
    return err.response;
  });
  if (result?.data?.success) {
    const { file: uploadedFile } = result.data;
    fileList.value[newFileIndex].filename = uploadedFile.filename;
    fileList.value[newFileIndex].fileState = 'on-cloud';
    uploadSuccess(newFile);
  } else if (result?.data) {
    const { message } = result.data;
    fileList.value.splice(newFileIndex, 1);
    uploadFail(file.name, message);
  }
}

const checkAll = computed({
  get() {
    return fileList.value.length ? fileList.value.every((item) => !!item.checked) : false;
  },
  set(v: boolean) {
    fileList.value.forEach((file) => file.checked = v);
  }
})
function handleDownload(file: TheFileT) {
  downloadFile(`/api/files/download/${file.filename}`, file.name);
}
function handleDownloadSelect() {
  fileList.value.filter((file) => !!file.checked).forEach((file) => {
    handleDownload(file);
  });
}

async function removeFile(file: TheFileT | TheFileT[]) {
  const files = [file].flat();
  const filenames = files.map((f) => f.filename);
  fileList.value = fileList.value.filter((f) => !filenames.includes(f.filename));
}
function handleRemoveSelect() {
  const removeFiles = fileList.value.filter((file) => !!file.checked);
  removeFile(removeFiles);
}

watch(() => props.files, (files) => {
  if (files) {
    fileList.value = files;
  }
}, {
  immediate: true,
});
watch(fileList, (files) => {
  emits('update:files', files);
});
</script>
<template>
  <div class="multi-file-input">
    <ElUpload
      accept=".jpg,.png,.pdf,.docx,.xlsx"
      class="upload-comp"
      :class="{ 'input-mode': props.inputMode }"
      :file-list="fileList"
      multiple
      :http-request="uploadTheFile"
    >
      <div class="interactors">
        <ElButton v-show="props.hasDownload" type="danger" @click="handleDownloadSelect">下载选中文件</ElButton>
        <ElButton v-show="props.inputMode" type="danger" @click="handleRemoveSelect">删除选中文件</ElButton>
      </div>
      <template #trigger>
        <ElButton v-show="props.inputMode" type="primary">上传文件</ElButton>
      </template>

      <template #file>
        <div></div>
      </template>
    </ElUpload>
    <div class="uploaded-files">
      <div v-if="fileList.length > 1" class="check-position">
        <ElCheckbox class="check-all" v-model="checkAll">全选</ElCheckbox>
      </div>
      <div class="uploaded-item" v-for="file in fileList" :key="file.filename">
        <div class="info">
          <div class="check">
            <ElCheckbox v-model="file.checked" :title="file.name">
              {{ file.name }}
            </ElCheckbox>
          </div>
          <template v-if="!onlyUpload">
            <ElIcon class="uploaded-item-operator clickable" title="下载" @click="handleDownload(file)">
              <Download />
            </ElIcon>
            <ElIcon class="uploaded-item-operator clickable" title="预览" @click="handlePreview(file)">
              <Reading />
            </ElIcon>
          </template>
          <ElIcon class="uploaded-item-operator clickable" title="删除" @click="removeFile(file)">
            <Delete />
          </ElIcon>

        </div>
        <ElProgress v-if="file.fileState === 'on-upload' && props.inputMode" class="progress" :class="{ 'beyond-half': file.percentage ? file.percentage > 50 : false, 'is-complete': file.percentage === 100 }" :percentage="file.percentage || 0"/>
      </div>      
    </div>
  </div>
</template>

<style lang="scss" scoped>
.multi-file-input {
  --inner-padding-h: 12px;
  --inner-padding-v: 4px;
}
:deep(.el-upload-list) {
  display: none;
}
.uploaded-files {
  width: fit-content;
  min-width: 360px;
}
.info {
  display: flex;
  align-items: center;
}
.check {
  flex-grow: 1;
  .el-checkbox {
    display: flex;
  }
}
.info {
  .check-label, :deep(.el-checkbox__label) {
    max-width: calc(100% - 44px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 32px;
  }
}

.uploaded-item-operator {
  margin-left: 8px;
  font-size: 16px;
  color: var(--wh-color-text);
  transition: all .6s ease;

  &:hover {
    color: var(--wh-color-brand);
  }
}
.check {
  + .uploaded-item-operator {
    margin-left: auto;
  }
}
.uploaded-item {
  &:not(:hover) {
    .uploaded-item-operator {
      opacity: 0;
    }
  }
}

.upload-comp {
  display: flex;
  align-items: center;
  padding-top: var(--inner-padding-v);
  padding-right: var(--inner-padding-h);
}
:deep(.el-upload) {
  margin-right: 12px;
}
.upload-comp {
  &:not(.input-mode) {
    :deep(.el-upload) {
      order: 2;
    }
    .interactors {
      order: 1;
    }
  }
}
.uploaded-files {
  margin-top: 4px;
  padding-right: var(--inner-padding-h);
}
.progress {
  --bar-bg-color: rgba(var(--wh-success), 0.3);
  :deep(.el-progress-bar__inner) {
    background-color: var(--bar-bg-color);
  }
  &.beyond-half {
    --bar-bg-color: rgba(var(--wh-success-secondary), 0.6);
  }
  &.is-complete {
    --bar-bg-color: rgba(var(--wh-success-secondary), 1);
  }
  :deep(.el-progress__text) {
    color: var(--bar-bg-color);
  }
}
</style>