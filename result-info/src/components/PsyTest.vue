<script lang="ts" setup>
import type { ComposePsyData, FileServe, StaticFile } from '~/types/minors';
import { PsyTestLabels } from '~/schemas/minors';
import LineChart from '~comp/LineChart.vue';
import MultiFileInput from '~comp/MultiFileInput.vue';
import { computed, ref, watch } from 'vue';
import type { FormInstance } from 'element-plus';
import { downloadFile, getType } from '~/helpers/utils';

type ComposeKeys = keyof ComposePsyData;
type ComposeValue = ComposePsyData[ComposeKeys];
const originProps = defineProps<ComposePsyData>();
const props = computed(() => Object.keys(originProps).reduce((acc, cur) => {
  const property = cur as ComposeKeys;
  const value = originProps[property];;
  if (Array.isArray(value)) {
    acc[property] = value.slice();
  }
  return acc;
}, Object.create(null) as ComposePsyData));
interface EmitsT {
  (evt: 'add', key: ComposeKeys, value: StaticFile): void;
  (evt: 'edit', key: ComposeKeys, index: number, value: StaticFile): void;
}
const emits = defineEmits<EmitsT>();

const showDataStartIndex = ref<Record<ComposeKeys, number>>({
  synthesisPsyHealth: -1,
  anxiety: -1,
  depression: -1,
  traumaReaction: -1,
  socialAnxiety: -1,
  intellect: -1,
  personality: -1,
  insomnia: -1,
  other: -1,
});
const showDataEndIndex = ref<Record<ComposeKeys, number>>({
  synthesisPsyHealth: -1,
  anxiety: -1,
  depression: -1,
  traumaReaction: -1,
  socialAnxiety: -1,
  intellect: -1,
  personality: -1,
  insomnia: -1,
  other: -1,
});
for (const prop in props.value) {
  const property: ComposeKeys = prop as ComposeKeys;
  watch(() => props.value[property], (item) => {
    if (!Array.isArray(item) || item.length === 0) {
      return;
    }
    if (showDataStartIndex.value[property] === -1) {
      showDataStartIndex.value[property] = 0;
    }
    if (showDataEndIndex.value[property] === -1) {
      showDataEndIndex.value[property] = item.length - 1;
    }
  }, {
    deep: true,
    immediate: true,
  })
}

const hasRange = (property: ComposeKeys) => {
  return showDataEndIndex.value[property] >= showDataStartIndex.value[property];
};
const getAbsoluteIndex = (index: number, property: ComposeKeys) => {
  return index + showDataStartIndex.value[property];
}
const getStartItems = (item: ComposeValue, property: ComposeKeys) => {
  return showDataEndIndex.value[property] === -1 ? item.slice() : item.slice(0, showDataEndIndex.value[property] + 1);
}
const getEndItems = (item: ComposeValue, property: ComposeKeys) => {
  return showDataStartIndex.value[property] === -1 ? item.slice() : item.slice(showDataStartIndex.value[property]);
}
const getData = (item: ComposeValue, property: ComposeKeys) => {
  const result = item.slice(showDataStartIndex.value[property], showDataEndIndex.value[property] + 1).map((each) => ({
    tag: each.tag,
    value: each.value,
  }));
  return result;
};
const operatorDlgOpen = ref(false);
const operateType = ref<'add' | 'edit' | 'download'>('add');
const isToDownload = computed(() => operateType.value === 'download');
const formRef = ref<FormInstance>();
const operateTestItem = ref<StaticFile[]>([]);
const operateIndex = ref(-1);
const operateKey = ref<ComposeKeys>('synthesisPsyHealth');
const dlgTitle = computed(() => {
  if (operateType.value === 'add') {
    return '新增数据';
  } else if (operateType.value === 'edit') {
    return '编辑数据';
  } else {
    return '下载文件';
  }
});
const emptyForm = {
  createAt: '',
  tag: '',
  value: 0,
  files: [],
}
const form = ref<StaticFile>({
  ...emptyForm
});
watch([operateTestItem, operateIndex], ([testItems, index]) => {
  if (testItems && testItems[index]) {
    form.value = testItems[index];
  }
});
const checkedTestItems = ref<string[]>([]);
const checkAll = computed({
  get() {
    return checkedTestItems.value.length === operateTestItem.value.length
  },
  set(v: boolean) {
    if (!v) {
      checkedTestItems.value = [];
    } else {
      checkedTestItems.value = operateTestItem.value.map((item) => {
        return item.tag;
      });
    }
  }
})
const willDownloadFiles = computed(() => {
  return operateTestItem.value.filter((item) => checkedTestItems.value.includes(item.tag)).reduce((acc, cur) => {
    return acc.concat(cur.files);;
  }, [] as FileServe[]);
});
const openAddDataDlg = (key: ComposeKeys) => {
  operateType.value = 'add';
  operateKey.value = key;
  form.value = { ...emptyForm };
  operatorDlgOpen.value = true;
}
const openEditDataDlg = (item: ComposeValue, key: ComposeKeys) => {
  operateType.value = 'edit';
  operateIndex.value = 0;
  operateKey.value = key;
  operateTestItem.value = item.map((each) => ({
    ...each,
    files: each.files.map((file) => ({
      ...file,
    }))
  }));
  operatorDlgOpen.value = true;
}
const openDownloadDlg = (item: ComposeValue) => {
  operateType.value = 'download';
  operateIndex.value = 0;
  operateTestItem.value = item.slice();
  operatorDlgOpen.value = true;
  checkAll.value = false;
}
const cancelAddOrEdit = () => {
  form.value = emptyForm;
  operatorDlgOpen.value = false;
}
const confirmAddOrEdit = () => {
  if (operateType.value === 'add') {
    emits('add', operateKey.value, form.value)
  } else {
    emits('edit', operateKey.value, operateIndex.value, form.value);
  }
  operatorDlgOpen.value = false;
  form.value = emptyForm;
}
const downloadSelectedFiles = () => {
  willDownloadFiles.value.forEach((file) => {
    downloadFile(`/api/files/download/${file.filename}`, file.name);
  })
}
const preview = (file: FileServe) => {
  window.open(`/preview?filename=${encodeURIComponent(file.filename)}&type=${getType(file.filename)}`);
}
</script>

<template>
  <div class="psy-test-group">
    <ElDialog v-model="operatorDlgOpen" append-to-body :close-on-click-modal="false" :title="dlgTitle">
      <template v-if="!isToDownload">
        <ElForm class="form" ref="formRef" :model="form" label-width="auto">
          <ElFormItem v-if="operateType === 'edit'" label="要编辑的数据">
            <ElSelect v-model="operateIndex">
              <ElOption v-for="(editTestEach, index) in operateTestItem" :value="index" :label="editTestEach.tag">{{ editTestEach.tag }}</ElOption>
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="数据名">
            <ElInput v-model="form.tag" />
          </ElFormItem>
          <ElFormItem label="数据值">
            <ElInput type="number" v-model="form.value" />
          </ElFormItem>
          <ElFormItem label="相关文件">
            <MultiFileInput v-model:files="form.files" input-mode :has-download="false"/>
          </ElFormItem>
        </ElForm>
      </template>
      <template v-else>
        <ElCheckbox v-model="checkAll">全选</ElCheckbox>
        <ElCheckboxGroup v-model="checkedTestItems">
          <ElCheckbox v-for="testItem in operateTestItem" :key="testItem.tag" :label="testItem.tag" :value="testItem.tag">
            {{ testItem.tag }}
          </ElCheckbox>
        </ElCheckboxGroup>
        <div class="download-area">将下载以下文件：<span class="tip">(点击文件名可预览)</span></div>
        <div class="will-download">
          <div class="clickable download-file text-hoverable-primary" v-for="(downloadFile, index) in willDownloadFiles" :key="index" @click="preview(downloadFile)" title="预览">{{ downloadFile.name }}</div>
        </div>
      </template>
      <template #footer>
        <template v-if="!isToDownload">
          <ElButton @click="cancelAddOrEdit">取消</ElButton>
          <ElButton type="primary" @click="confirmAddOrEdit">确认</ElButton>
        </template>
        <ElButton v-else type="danger" @click="downloadSelectedFiles">下载选中的文件</ElButton>
      </template>
    </ElDialog>
    <div class="test-section" v-for="(testItem, property) in props" :key="property">
      <h4 class="title">{{ PsyTestLabels[property] }}</h4>
      <div class="operators">
        <ElButton type="primary" @click="openAddDataDlg(property)">新增数据</ElButton>
        <ElButton type="warning" @click="openEditDataDlg(testItem, property)">编辑数据</ElButton>
        <ElButton type="success" @click="openDownloadDlg(testItem)">下载相关文件</ElButton>
      </div>
      <template v-if="testItem.length">
        <div class="range-area">
          <label class="range-label gap-12">
            <span class="range-title">数据起点：</span>
            <ElSelect v-model="showDataStartIndex[property]">
              <ElOption v-for="(item, index) in getStartItems(testItem, property)" :value="index" :label="item.tag">{{ item.tag }}</ElOption>
            </ElSelect>
          </label>
          <label class="range-label gap-12">
            <span class="range-title">数据终点：</span>
            <ElSelect v-model="showDataEndIndex[property]">
              <ElOption v-for="(item, index) in getEndItems(testItem, property)" :value="getAbsoluteIndex(index, property)" :label="item.tag">{{ item.tag }}</ElOption>
            </ElSelect>
          </label>
        </div>

        <LineChart v-if="hasRange(property)" class="chart" :data-map="getData(testItem, property)"/>
      </template>      
    </div>
  </div>
</template>

<style lang="scss" scoped>
.test-section {
  + .test-section {
    margin-top: 24px;
  }
}
.title {
  font-size: 16px;
  line-height: 24px;
  color: var(--wh-color-text);
}
.operators {
  margin-top: 16px;
}
.range-area {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.range-label {
  flex-grow: 1;
  display: flex;
  align-items: center;
  max-width: 420px;
}
.range-title {
  white-space: nowrap;
}
.chart {
  margin-top: 16px;
  width: 100%;
  height: 360px;
}
.download-area {
  margin-top: 16px;
}
.will-download {
  margin-top: 4px;
}
.download-file {
  margin-top: 4px;
  padding: 4px;
  border-bottom: 1px dashed currentColor;
}
.tip {
  color: var(--wh-color-tip);
}
</style>