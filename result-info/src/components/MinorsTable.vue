<script lang="tsx" setup>
import { computed, ref } from 'vue';
import { radioLookupMap, type MinorInfoT } from 'shared';
import { minorsTableKey, MinorsLabels, transformFileServe } from '~/schemas/minors';
import { generateCols } from '~/helpers/table';
import { addMinorInfo, modifyMinorInfo, genEmptyMinorInfo, getMinorInfo, removeMinorItem } from '~/stores/minors';
import MinorInput from '~comp/MinorInput.vue';
import { isStreetOrCommunityKey, isWarningStatus } from '~/types/minors';
import { ElMessage, ElMessageBox, type RowClassNameGetter } from 'element-plus';
import { getLocalStore, removeLocalStore, setLocalStore } from '~/env/storage';
import { useRouter } from 'vue-router';
import { throttle } from 'lodash-es';
import { useStreetCommunity } from '~/stores/street';

const router = useRouter();
const data = ref<MinorInfoT[]>([]);
const { streets, getNameByCommunityId, getNameByStreetId } = useStreetCommunity();
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
    } else  {
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
    <ElDialog class="i-dlg" v-model="addDialogVisible" title="录入信息" :close-on-click-modal="false">
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
    </ElDialog>
    <div class="top">
      <ElInput v-model="searchVal" type="search" placeholder="输入需要搜索的关键字" @change="search">
        <template #append>
          <ElButton class="search-enter" @click="search">搜索</ElButton>
        </template>
      </ElInput>

      <ElButton class="record-btn" type="primary" @click="openAddDialog">录入</ElButton>
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
:deep(.i-dlg) {
  max-width: 862px;
}
.table {
  height: calc(100 * var(--vh) - 60px);
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