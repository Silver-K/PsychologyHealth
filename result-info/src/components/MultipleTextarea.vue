<script lang="ts" setup>
import { ElMessage, type FormInstance } from 'element-plus';
import { computed, ref, watch } from 'vue';

interface PropT {
  inputMode: boolean;
}
const props = defineProps<PropT>();
const modelValue = defineModel<Array<{
  key: string;
  text: string;
}>>();

const isInputMode = computed(() => !!props.inputMode);

const currentSelectKey = ref('');
watch(modelValue, (newData, oldData) => {
  if ((!oldData || (Array.isArray(oldData) && !oldData.length)) && Array.isArray(newData) && newData.length) {
    currentSelectKey.value = newData[0].key;
  }
}, {
  immediate: true,
});
const currentText = computed({
  get() {
    if (!modelValue.value || !Array.isArray(modelValue.value)) {
      return '';
    }
    const found = modelValue.value.find((item) => item.key === currentSelectKey.value);
    return found ? found.text : '';
  },
  set(value) {
    if (!modelValue.value || !Array.isArray(modelValue.value)) {
      return;
    }
    const found = modelValue.value.find((item) => item.key === currentSelectKey.value);
    if (found) {
      found.text = value;
    } else {
      return;
    }
  }
});
const form = ref({
  key: '',
  text: '',
});
const addFormRef = ref<FormInstance>();
const addDialogOpen = ref(false);
const openAddDialog = () => {
  addDialogOpen.value = true;
}
const closeAddDialog = () => {
  addDialogOpen.value = false;
  addFormRef.value?.clearValidate();
}
const cancelAdd = () => {
  form.value.key = '';
  form.value.text = '';
  closeAddDialog();
}
const addNewRecord = () => {
  openAddDialog();
}
const confirmAdd = () => {
  if (!addFormRef.value) {
    return;
  }
  addFormRef.value.validate((valid: boolean) => {
    if (valid) {
      if (!Array.isArray(modelValue.value)) {
        modelValue.value = [];
      }
      modelValue.value!.push({
        key: form.value.key,
        text: form.value.text
      });
      closeAddDialog();
      currentSelectKey.value = form.value.key;
    } else {
      ElMessage({
        message: '请修正填写错误项后再提交~',
        type: 'warning',
      })
    }
  })
}
const delCurrentRecord = () => {
  if (!Array.isArray(modelValue.value)) {
    return;
  }
  const index = modelValue.value.findIndex((i) => i.key === currentSelectKey.value);
  if (index !== -1) {
    modelValue.value.splice(index, 1);
    currentSelectKey.value = modelValue.value.length ? modelValue.value[0].key : '';
  }
}
const rules = {
  key: [
    {
      trigger: 'blur',
      validator: (_: any, value: string, callback: (err?: Error) => void) => {
        if (modelValue.value?.findIndex((i) => i.key === value) !== -1) {
          callback(new Error('当前索引已经被使用，请换一个不重复的索引'));
        } else {
          callback();
        }
      }
    },
    {
      trigger: 'change',
      require: true,
      message: '索引不能为空',
    }
  ]
}
</script>

<template>
  <div class="multiple-textarea">
    <ElDialog append-to-body v-model="addDialogOpen" title="新增记录" width="500" :close-on-click-modal="false">
      <ElForm ref="addFormRef" :model="form" label-width="auto" :rules="rules">
        <ElFormItem label="ID" prop="key">
          <ElInput v-model="form.key" placeholder="在这里编辑内容的索引"/>
        </ElFormItem>
        <ElFormItem label="内容" prop="text">
          <ElInput type="textarea" :autosize="{ minRows: 2, maxRows: 6 }" resize="none" placeholder="在这里编辑关注内容" v-model="form.text" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="operators">
          <ElButton @click="cancelAdd">取消添加</ElButton>
          <ElButton type="success" @click="confirmAdd">确认添加</ElButton>
        </div>
      </template>
    </ElDialog>
    <div class="section">
      <ElSelect v-model="currentSelectKey" placeholder="请选择一条记录...">
        <ElOption v-for="item in modelValue" :key="item.key" :value="item.key">{{ item.key }}</ElOption>
      </ElSelect>
    </div>

    <div class="section">
      <template v-if="isInputMode">
        <ElInput class="text-editor" type="textarea" placeholder="在这里编辑关注内容" :autosize="{ minRows: 2, maxRows: 6 }" resize="both" v-model="currentText" />
        <div class="input-mode-btns">
          <ElButton @click="addNewRecord">新增记录</ElButton>
          <ElButton @click="delCurrentRecord">删除记录</ElButton>
        </div>
      </template>
      <div v-else class="show-area">{{ currentText }}</div>
    </div>
    
  </div>
</template>

<style lang="scss" scoped>
.multiple-textarea {
  min-width: 360px;
}
.section {
  + .section {
    margin-top: 4px;
  }
}
.input-mode-btns {
  margin-top: 8px;
}
.show-area {
  color: var(--wh-color-text);
  min-width: 100%;
  min-height: 80px;
  padding: 4px 8px;
  background-color: rgba(var(--wh-primary), 0.2);
  font-size: 14px;
  line-height: 22px;
}
</style>