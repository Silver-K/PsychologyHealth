<script lang="tsx" setup>
import { computed, ref } from 'vue';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import { radioLookupMap, type MinorInfoT } from 'shared';
import { minorsTableKey, MinorsLabels, transformFileServe, patchInfoKey } from '~/schemas/minors';
import { generateCols } from '~/helpers/table';
import { addMinorInfo, modifyMinorInfo, genEmptyMinorInfo, getMinorInfo, removeMinorItem, patchMinorInfo } from '~/stores/minors';
import MinorInput from '~comp/MinorInput.vue';
import { isAge, isStreetOrCommunityKey, isWarningStatus } from '~/types/minors';
import { ElMessage, ElMessageBox, type RowClassNameGetter, type UploadFile } from 'element-plus';
import WhDialog from './WhDialog.vue';
import { getLocalStore, removeLocalStore, setLocalStore } from '~/env/storage';
import { useRouter } from 'vue-router';
import { throttle } from 'lodash-es';
import { useStreetCommunity } from '~/stores/street';
import { UploadFilled } from '@element-plus/icons-vue';
import { downloadFile } from '~/helpers/utils';

const router = useRouter();
const data = ref<MinorInfoT[]>([]);
const { streets, getNameByCommunityId, getNameByStreetId, StreetMap, CommunityMap, ensureStreetCommunityData } = useStreetCommunity();
const streetInited = computed(() => !!streets.length);
async function updateData() {
  data.value = await getMinorInfo();
}
updateData();

function enter(item: MinorInfoT) {
  router.push(`/detail/${item.id}`);
}

function showProtectText(item: MinorInfoT) {
  return item.tempProtect ? '取消庇护' : '庇护';
}

const cols = generateCols({
  keys: minorsTableKey.slice(),
  renderer: (key: string) => {
    if (key === 'tempProtect') {
      return ({ rowData }: { rowData: MinorInfoT }) => (
        <span>{ rowData.tempProtect ? '是' : '否' }</span>
      )
    } else if (isStreetOrCommunityKey(key)) {
      const fun = key === 'street' ? getNameByStreetId : getNameByCommunityId;
      return ({ rowData }: { rowData: MinorInfoT }) => (
        <span>{ fun(rowData[key]) }</span>
      )
    } else if (isWarningStatus(key)) {
      return ({ rowData }: { rowData: MinorInfoT }) => (
        <span>{ radioLookupMap.warningStatus[rowData[key]] }</span>
      )
    } else if (isAge(key)) {
      return ({ rowData }: { rowData: MinorInfoT }) => (
        <span>{ rowData[key] || '-' }</span>
      )
    } else {
      return void 0
    }
  },
  width: 150,
  titleObj: MinorsLabels
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
      <div>
        <span class="gap-12 text-primary text-hoverable-primary clickable" onClick={() => enter(rowData)}>查看</span>
        <span class="gap-12 text-primary text-hoverable-primary clickable" onClick={() => del(rowData)}>删除</span>
        <span class="gap-12 text-primary text-hoverable-primary clickable" onClick={() => protect(rowData)}>{ showProtectText(rowData) }</span>
      </div>
    )
  }
});

const rowClass = ({ rowData }: Parameters<RowClassNameGetter<MinorInfoT>>[0]) => {
  if (rowData.tempProtect) {
    return 'is-protect';
  }
  return ''
}

const addDialogVisible = ref(false);
const addForm = ref(genEmptyMinorInfo());
const STASH = 'whsg/stash/input-minor';
function openAddDialog() {
  addDialogVisible.value = true;
  const store = getLocalStore(STASH);
  if (store) {
    addForm.value = store;
  } else {
    addForm.value = genEmptyMinorInfo();
  }
}
function closeAddDialog() {
  addDialogVisible.value = false;
}
function resetAddDialog() {
  addForm.value = genEmptyMinorInfo();
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

const patchDialogVisible = ref(false);
const patchForm = ref<Array<Record<string, string>>>([]);
function openPatchDialog() {
  patchDialogVisible.value = true;
}
function closePatchDialog() {
  patchDialogVisible.value = false;
}
function resetPatchDialog() {
  patchForm.value = [];
}
function abortPatch() {
  resetPatchDialog();
  closePatchDialog();
}
const currentShowPatchFormIndex = ref(1);
function equalsMinorKeyLabel(obj: Record<string, string>) {
  return Object.keys(obj).some((key) => obj[key] === MinorsLabels[key as keyof typeof MinorsLabels]);
}
function formatDate(day: number) {
  const start = dayjs(new Date('1899/12/30'));
  return start.add(day, 'day').format('YYYY/MM/DD');
}
function transformExcelTime(info: Record<string, string>) {
  const result = { ...info };
  if (typeof info.birthday === 'number') {
    result.birthday = formatDate(info.birthday);
  }
  if (typeof info.guardianBirthday === 'number') {
    result.guardianBirthday = formatDate(info.guardianBirthday);
  }
  return result;
}
async function resolveXlsx(file: UploadFile) {
  const { raw } = file;
  if (!raw) {
    return;
  }

  const buffer = await raw.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const headers = patchInfoKey.slice();
  patchForm.value = wb.SheetNames.map((n) => {
    const ws = wb.Sheets[n];
    const json = XLSX.utils.sheet_to_json(ws, {
      header: headers
    });
    return json;
  }).filter((arr) => arr.length).flat().filter((item) => !equalsMinorKeyLabel(item as Record<string, string>)).map((item) => {
    // birthday/guardianBirthday 需要变成YYYY/MM/DD格式
    return transformExcelTime(item as Record<string, string>);
  });
}

async function handleAddMinorInfo() {
  addForm.value = transformFileServe(addForm.value);
  const result = await addMinorInfo(addForm.value);
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
  data.value = await getMinorInfo();
}
function toServeFormat(origin: Record<string, string>) {
  // registratedWuhou 转变成0 | 1 -> 是 | 否
  // 街道和社区 转变成ID
  // 预警状态 转变成 0 1 2 3
  const warningStatus = Math.max(0, radioLookupMap.warningStatus.findIndex((c) => c === origin.warningStatus)) as 0 | 1 | 2 | 3;
  const registratedWuhou = origin.registratedWuhou === '是' ? 0 : 1;
  const result = {
    ...genEmptyMinorInfo(),
    ...origin,
    registratedWuhou,
    street: StreetMap[origin.street].id,
    community: CommunityMap[origin.community].id,
    warningStatus
  } as MinorInfoT;
  return result;
}
function checkStreetCommunity() {
  return patchForm.value.findIndex((item) => {
    return !StreetMap[item.street] || !CommunityMap[item.community];
  });
}
async function handlePatchMinorInfo() {
  await ensureStreetCommunityData();
  const index = checkStreetCommunity();
  if (index > -1) {
    currentShowPatchFormIndex.value = index + 1;
    ElMessage({
      message: '当前页有未知的街道或社区名称，请修正后提交',
      type: 'error',
      duration: 5000,
    });
    return;
  }
  const result = await patchMinorInfo(patchForm.value.map((item) => toServeFormat(item)));
  if (result === 0) {
    ElMessage({
      message: '录入成功',
      type: 'success'
    });
    closePatchDialog();
    resetPatchDialog();
  } else {
    ElMessage({
      message: '录入失败',
      type: 'error',
    })
  }
  search();
}

const searchVal = ref('');
const updateSearchData = async (val: string) => {
  data.value = await getMinorInfo(val);
}
const searchData = throttle(updateSearchData);
const search = () => {
  searchData(searchVal.value);
}
async function del(item: MinorInfoT) {
  await ElMessageBox.confirm(
    '确定要删除该参与者吗？',
    '删除',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
  });
  const { id } = item;
  await removeMinorItem(id);
  search();
}
async function protect(item: MinorInfoT) {
  const { id } = item;
  const found = data.value.find((each) => each.id === id);
  if (found) {
    await modifyMinorInfo(id, {
      tempProtect: !found.tempProtect
    });
    search();
  }
}
</script>

<template>
  <div class="minors-table">
    <WhDialog class="record-dlg" append-to-body v-model="addDialogVisible" title="录入信息" :close-on-click-modal="false">
      <div class="dlg-body">
        <MinorInput input-mode v-model:form="addForm" />
      </div>      
      <template #footer>
        <ElButton class="opt-btn" @click="abortAdd">放弃</ElButton>
        <ElButton type="warning" class="opt-btn" @click="saveAdd">暂存</ElButton>
        <ElButton type="primary" class="opt-btn" @click="handleAddMinorInfo"
          >提交</ElButton
        >
      </template>
    </WhDialog>
    <WhDialog append-to-body class="record-dlg" v-model="patchDialogVisible" title="批量录入" :close-on-click-modal="false">
      <div class="dlg-body">
        <ElUpload
          v-if="!patchForm.length"
          class="patch-upload"
          drag
          accept=".xlsx"
          :on-change="resolveXlsx"
          :auto-upload="false"
        >
          <ElIcon class="el-icon--upload"><UploadFilled /></ElIcon>
          <div class="el-upload__text">
            拖拽文件到此处或点击此处选择文件（仅支持xlsx文件）
          </div>
        </ElUpload>
        <div v-else class="record-form">
          <div class="record-form-title">
            <span>量表</span>
            <span>{{ currentShowPatchFormIndex }}</span>
          </div>
          <ElForm class="record-form__inner" label-width="auto">
            <ElFormItem v-for="item in patchInfoKey" :label="MinorsLabels[item]" :key="item">
              <ElInput v-model="patchForm[currentShowPatchFormIndex - 1][item]"/>
            </ElFormItem>
          </ElForm>
        </div>       
      </div>      
      <template #footer>
        <div v-if="patchForm.length" class="patch-form-pager">
          <ElPagination v-model:current-page="currentShowPatchFormIndex" :page-size="1" :total="patchForm.length" layout="pager" />
        </div>   
        <ElButton type="warning" class="opt-btn" @click="downloadFile('/api/files/download-template?type=minors')">下载模板</ElButton>     
        <ElButton class="opt-btn" @click="abortPatch">放弃</ElButton>
        <ElButton type="primary" class="opt-btn" @click="handlePatchMinorInfo"
          >提交</ElButton
        >
      </template>
    </WhDialog>
    <div class="top">
      <ElInput v-model="searchVal" type="search" placeholder="输入需要搜索的关键字" @change="search">
        <template #append>
          <ElButton class="search-enter" @click="search">搜索</ElButton>
        </template>
      </ElInput>

      <ElButton class="record-btn" type="primary" @click="openAddDialog">录入</ElButton>
      <ElButton class="record-btn" type="success" @click="openPatchDialog">批量录入</ElButton>
    </div>
    <div v-if="streetInited" class="table">
      <ElAutoResizer>
        <template #default="{ width, height }">
          <ElTableV2
            class="minors-table__inner"
            :columns="cols"
            :row-class="rowClass"
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
  height: calc(100 * var(--vh) - 100px);
  margin-top: 16px;

  :deep(.is-protect) {
    background-color: rgba(var(--wh-primary), 0.1);
  }
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
.minors-table__inner {
  --el-table-header-text-color: var(--wh-color-text);
}
</style>