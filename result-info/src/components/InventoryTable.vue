<script lang="tsx" setup>
import { computed, ref } from 'vue';
import MultiFileInput from './MultiFileInput.vue';
import { inventoryTableKeys, InventoryLabels } from '~/schemas/inventory';
import { generateCols } from '~/helpers/table';
import { addInventoryInfo, genEmptyInventoryInfo, getInventoryInfo, removeInventoryItem, modifyInventoryInfo } from '~/stores/inventory';

import type { InventoryInfoT } from '~/types/inventory';
import { ElDropdown, ElDropdownItem, ElDropdownMenu, ElMessage, ElMessageBox } from 'element-plus';
import { getLocalStore, removeLocalStore, setLocalStore } from '~/env/storage';
import { downloadFile, getType } from '~/helpers/utils';
import { throttle } from 'lodash-es';
import type { FileInfoT } from 'shared';

const data = ref();
async function updateData() {
  data.value = await getInventoryInfo();
}
updateData();

const isFileUpload = ref(false);
const uploadFiles = ref<FileInfoT[]>([]);
const downloadableFiles = ref<FileInfoT[]>([]);
const willDownloadFilenames = ref<string[]>([])
const willDownloadFiles = computed<FileInfoT[]>(() => {
  return downloadableFiles.value.filter((f) => {
    return willDownloadFilenames.value.includes(f.filename);
  });
});

const checkAll = computed({
  get() {
    return downloadableFiles.value.length === willDownloadFiles.value.length;
  },
  set(v: boolean) {
    if (!v) {
      willDownloadFilenames.value = [];
    } else {
      willDownloadFilenames.value = downloadableFiles.value.map((f) => f.filename);
    }
  }
})
const fileDialogVisible = ref(false);
const fileOperateTitle = computed(() => isFileUpload.value ? '上传文件' : '下载文件');
const fileOperateConfirm = computed(() => isFileUpload.value ? '确认操作' : '确认下载')
const currentInventoryId = ref<string>('');
const fileConfirmOperateDisabled = computed(() => {
  if (isFileUpload.value) {
    return !uploadFiles.value.length;
  }
  return !willDownloadFiles.value.length;
})

const previewableFiles = ref<FileInfoT[]>([]);
function preview(item: InventoryInfoT) {
  previewableFiles.value = item.files.slice();
}
function onPreviewCommand(command: string) {
  window.open(`/preview?filename=${encodeURIComponent(command)}&type=${getType(command)}`);
}
function upload(item: InventoryInfoT) {
  currentInventoryId.value = item.id;
  isFileUpload.value = true;
  fileDialogVisible.value = true;
  uploadFiles.value = item.files.map((f) => ({ ...f }));
}
function download(item: InventoryInfoT) {
  currentInventoryId.value = item.id;
  isFileUpload.value = false;
  fileDialogVisible.value = true;
  downloadableFiles.value = item.files.map((f) => ({ ...f }));
}
function abortFileOperate() {
  fileDialogVisible.value = false;
}

const cols = generateCols({
  keys: inventoryTableKeys.slice(),
  width: (key) => key === 'name' ? 400 : 250,
  titleObj: InventoryLabels,
  renderer() {}
}, {
  key: 'indexor',
  title: '序号',
  width: 100,
  cellRenderer({ rowIndex }) {
    return (
      <span>{ rowIndex + 1 }</span>
    )
  }
}, {
  key: 'operator',
  title: '操作',
  width: 260,
  cellRenderer({ rowData }) {
    return (
      <div class="operators">
        <span class={ `gap-12 text-primary text-hoverable-primary clickable${rowData.files.length ? '' : ' text-disabled'}` } onClick={() => download(rowData)}>下载</span>
        <span class="gap-12 text-primary text-hoverable-primary clickable" onClick={() => upload(rowData)}>上传</span>
        <ElDropdown trigger="click" onCommand={onPreviewCommand}>
          {{
            default: () => (<span class={`gap-12 text-primary text-hoverable-primary clickable${rowData.files.length ? '' : ' text-disabled'}`} onClick={() => preview(rowData)}>预览</span>),
            dropdown: () => (
              <ElDropdownMenu>
                {
                  previewableFiles.value.map((file) => (
                    <ElDropdownItem command={file.filename}>
                      { file.name }
                    </ElDropdownItem>
                  ))
                }
              </ElDropdownMenu>)
          }}
        </ElDropdown>
        
        <span class="gap-12 text-primary text-hoverable-primary clickable" onClick={() => del(rowData)}>删除</span>
      </div>
    )
  }
});

const addDialogVisible = ref(false);
const addForm = ref(genEmptyInventoryInfo());
const STASH = 'whsg/stash/input-inventory';
function openAddDialog() {
  addDialogVisible.value = true;
  const store = getLocalStore(STASH);
  if (store) {
    addForm.value = store;
  } else {
    addForm.value = genEmptyInventoryInfo();
  }
}
function closeAddDialog() {
  addDialogVisible.value = false;
}
function resetAddDialog() {
  addForm.value = genEmptyInventoryInfo();
}
function abortAdd() {
  resetAddDialog();
  closeAddDialog();
}
function removeSave() {
  removeLocalStore(STASH);
}
function saveAdd() {
  const result = setLocalStore(STASH, addForm.value, "json");
  if (result === 0) {
    ElMessage.success("暂存成功");
  }
}

const searchVal = ref('');
const updateSearchData = (val: string) => {
  data.value = getInventoryInfo(val);
}
const searchData = throttle(updateSearchData);
const search = () => {
  searchData(searchVal.value);
}
async function del(item: InventoryInfoT) {
  await ElMessageBox.confirm(
    '确定要删除该量表吗？',
    '量表删除',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
  });
  removeInventoryItem(item.id);
  search();
}
async function handleAddInventoryInfo() {
  const result = await addInventoryInfo(addForm.value);
  if (result === 0) {
    ElMessage({
      message: '录入成功',
      type: 'success'
    });
    closeAddDialog();
    removeSave();
  } else {
    ElMessage({
      message: '录入失败',
      type: 'error',
    })
  }
  search();
}
async function confirmFileOperate() {
  if (isFileUpload.value) {
    await modifyInventoryInfo(currentInventoryId.value, {
      files: uploadFiles.value.map((item) => ({
        filename: item.filename,
        name: item.name,
      }))
    });
    search();
  } else {
    willDownloadFiles.value.forEach((file) => {
      downloadFile(`/api/files/download/${file.filename}`, file.name);
    })
  }
  fileDialogVisible.value = false;
}
</script>

<template>
  <div class="inventories-table">
    <ElDialog v-model="addDialogVisible" title="录入信息" :close-on-click-modal="false">
      <div class="dlg-body">
        <ElForm :model="addForm" label-width="auto">
          <ElFormItem v-for="item in inventoryTableKeys" :label="InventoryLabels[item]" :key="item">
            <ElInput v-model="addForm[item]"/>
          </ElFormItem>
        </ElForm>
      </div>      
      <template #footer>
        <ElButton class="opt-btn" @click="abortAdd">放弃</ElButton>
        <ElButton type="warning" class="opt-btn" @click="saveAdd">暂存</ElButton>
        <ElButton type="primary" class="opt-btn" @click="handleAddInventoryInfo"
          >提交</ElButton
        >
      </template>
    </ElDialog>
    <ElDialog v-model="fileDialogVisible" :title="fileOperateTitle" :close-on-click-modal="false">
      <template v-if="isFileUpload">
        <MultiFileInput v-model:files="uploadFiles" input-mode only-upload />
      </template>
      <template v-else>
        <ElCheckbox v-model="checkAll">全选</ElCheckbox>
        <ElCheckboxGroup class="download-group" v-model="willDownloadFilenames">
          <ElCheckbox v-for="file in downloadableFiles" :key="file.filename" :value="file.filename" :label="file.name">{{ file.name }}</ElCheckbox>
        </ElCheckboxGroup>
      </template>
      <template #footer>
        <ElButton class="opt-btn" @click="abortFileOperate">放弃</ElButton>
        <ElButton type="primary" class="opt-btn" :disabled="fileConfirmOperateDisabled" @click="confirmFileOperate"
          >{{ fileOperateConfirm }}</ElButton
        >
      </template>
    </ElDialog>
    <div class="top">
      <ElInput v-model="searchVal" placeholder="输入需要搜索的关键字" type="search" @change="search" @clear="search">
        <template #append>
          <ElButton class="search-enter" @click="search">搜索</ElButton>
        </template>
      </ElInput>

      <ElButton class="record-btn" type="primary" @click="openAddDialog">录入</ElButton>
    </div>
    <div v-if="data" class="table">
      <ElAutoResizer>
        <template #default="{ width, height }">
          <ElTableV2
            class="inventories-table__inner"
            :columns="cols"
            :data="data"
            :width="width"
            :height="height"
          />
        </template>
      </ElAutoResizer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.table {
  height: calc(100 * var(--vh) - 60px);
  margin-top: 16px;
}
.dlg-body {
  max-height: 540px;
  padding: 0 24px;
  overflow-y: auto;
}
.top {
  display: flex;
  align-items: center;
}
.record-btn {
  margin-left: 16px;
}
.inventories-table__inner {
  --el-table-header-text-color: var(--wh-color-text);
}
:deep(.operators) {
  display: flex;
  align-items: center;
}
.download-group {
  display: flex;
  flex-direction: column;
}
</style>