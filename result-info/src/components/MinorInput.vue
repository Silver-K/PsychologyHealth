<script lang="tsx" setup>
import { ref, watch, computed } from 'vue';
import { ElButton, ElInput, ElRadioGroup, ElRadio, ElDatePicker, ElSelect, ElOption } from 'element-plus';
import { minorsEditorItems, MinorsLabels, type MinorItemT } from '~/schemas/minors';
import { genEmptyMinorInfo } from '~/stores/minors';
import { useStreetCommunity } from '~/stores/street';
import type { CommunityInfo } from "~/types/street";
import MultipleTextarea from '~comp/MultipleTextarea.vue';
import MultiFileInput from '~comp/MultiFileInput.vue';
import { isCommunityKey, isGender, isRegistratedWuhou, isStreetKey, isTempProtectKey, isWarningStatus } from '~/types/minors';
import { radioLookupMap, type MinorInfoT} from 'shared';
import { cloneDeep } from 'lodash-es';
import type { Prettier } from '~/types/tools';

interface PropT {
  inputMode?: boolean;
  form?: MinorInfoT;
}
const props = defineProps<PropT>();

const form = ref<MinorInfoT>(props.form || genEmptyMinorInfo());
const initForm = ref(form.value);

interface EmitsT {
  (evt: 'submit', value: MinorInfoT | undefined): void;
  (evt: 'view-psy-test'): void;
  (evt: 'update:form', value: MinorInfoT): void;
  (evt: 'download'): void;
}
const emits = defineEmits<EmitsT>();
watch(form, (f) => {
  emits('update:form', f);
}, {
  deep: true,
})
const isInputMode = ref(props.inputMode ? true : false);
watch(isInputMode, (inInputMode) => {
  if (inInputMode) {
    initForm.value = cloneDeep(form.value);
  }
});
const inputModeItems = computed(() => {
  return isInputMode.value ? minorsEditorItems.filter((i) => i.editor !== 'complex' && i.key !== 'age' && i.key !== 'guardianAge') : minorsEditorItems.slice();
});

type FormKey = keyof typeof form['value']
function submit() {
  emits('submit', form.value);
  isInputMode.value = false;
}
function viewPsyTest() {
  emits('view-psy-test');
}
function reset() {
  form.value = cloneDeep(initForm.value);
}
function enterInputMode() {
  isInputMode.value = true;
}
function leaveInputMode() {
  reset();
  isInputMode.value = false;
}

const { StreetMap, CommunityMap, getNameByCommunityId, getNameByStreetId, streets } = useStreetCommunity();

const transformShowText = <T extends keyof MinorInfoT>(key: T) => {
  if (isTempProtectKey(key)) {
    const value = form.value[key];
    return value ? '是' : '否';
  } else if (isStreetKey(key)) {
    return getNameByStreetId(form.value[key]);
  } else if (isCommunityKey(key)) {
    return getNameByCommunityId(form.value[key]);
  } else if (isWarningStatus(key)) {
    return radioLookupMap.warningStatus[form.value[key]];
  } else if (isRegistratedWuhou(key)) {
    return radioLookupMap.registratedWuhou[form.value[key]];
  } else if (isGender(key)) {
    return radioLookupMap.gender[form.value[key]];
  } else {
    return form.value[key];
  }
}
const communityOptions = computed(() => {
  if (form.value.street && StreetMap[form.value.street]) {
    return StreetMap[form.value.street].communities.map((id) => CommunityMap[id])
  } else {
    return [] as CommunityInfo[];
  }
});
const streetOptions = computed(() => streets);

const getOptions = (key: FormKey) => {
  if (key === 'street') {
    return streetOptions.value;
  } else {
    return communityOptions.value;
  }
}
const onDisable = (date: Date) => {
  return date.getTime() > Date.now();
}

// 'input' | 'select' | 'date' | 'radio' | 'textarea' | 'textareas' | 'file' | 'complex'
const componentsMap = {
  input: (key: FormKey) => {
    return (<ElInput v-model={form.value[key]} />);
  },
  date: (key: FormKey) => {
    return (<ElDatePicker v-model={form.value[key]} disabledDate={onDisable} />)
  },
  select: (key: FormKey) => {
    return (<ElSelect v-model={form.value[key]}>
      {
        getOptions(key).map((re) => (
          <ElOption key={re.id} value={re.id} label={re.name}>
          </ElOption>
        ))
      }
    </ElSelect>)
  },
  radio: (key: FormKey) => {
    return (
      <ElRadioGroup v-model={form.value[key]}>
        {
          radioLookupMap[key as keyof typeof radioLookupMap].map((label, index) => (
            <ElRadio value={index} label={label}></ElRadio>
          ))
        }
      </ElRadioGroup>
    )    
  },
  textarea: (key: FormKey) => {
    return (<ElInput type="textarea" v-model={form.value[key]} />);
  },
  textareas: (key: FormKey) => {
    return (<MultipleTextarea inputMode={isInputMode.value} v-model={form.value[key]} />);
  },
  file: (key: FormKey) => {
    return (<MultiFileInput inputMode={isInputMode.value} v-model:files={form.value[key]} />);
  },
  complex: () => {
    return;
  },
}
const infoCompMap = {
  input: (key: FormKey) => {
    return (<span>{form.value[key]}</span>);
  },
  select: (key: FormKey) => {
    return (<span>{transformShowText(key)}</span>)
  },
  date: (key: FormKey) => {
    return (<span>{form.value[key]}</span>)
  },
  radio: (key: FormKey) => {
    return (
      <span>{transformShowText(key)}</span>
    )    
  },
  textarea: (key: FormKey) => {
    return (<div class="text-info">{form.value[key]}</div>);
  },
  textareas: (key: FormKey) => {
    return (<MultipleTextarea inputMode={isInputMode.value} v-model={form.value[key]} />);
  },
  file: (key: FormKey) => {
    return (<MultiFileInput has-download inputMode={isInputMode.value} v-model:files={form.value[key]} />);
  },
  complex: () => {
    return (<ElButton onClick={viewPsyTest}>查看详情</ElButton>);
  },
}
const FormInputRender = ({ 'minor-item': minorItem }: { 'minor-item'?: Prettier<MinorItemT>, minorItem?: Prettier<MinorItemT> }) => {
  const { key, editor } = minorItem || {};

  return (key && editor) ? componentsMap[editor](key) : null;
}
const InfoRender = ({ 'minor-item': minorItem }: { 'minor-item'?: Prettier<MinorItemT>, minorItem?: Prettier<MinorItemT> }) => {
  const { key, editor } = minorItem || {};

  return (key && editor) ? infoCompMap[editor](key) : null;
}
const downloadDetail = () => {
  emits('download');
}
</script>
<template>
  <div v-if="!props.inputMode" class="operators">
    <div class="railway">
      <ElButton v-if="isInputMode" @click="leaveInputMode" class="btn">放弃</ElButton>
      <ElButton v-else @click="enterInputMode" type="primary" class="btn">编辑</ElButton>
      <ElButton v-if="isInputMode" type="warning" @click="reset" class="btn">重置</ElButton>
      <ElButton v-if="isInputMode" type="primary" @click="submit" class="btn">保存</ElButton>
      <ElButton v-if="!isInputMode" @click="downloadDetail" class="btn">下载</ElButton>
    </div>
  </div>
  <div class="minor-input">
    <ElForm class="content" :model="form" label-width="auto">
      <ElFormItem v-for="item in inputModeItems" :key="item.key" :label="MinorsLabels[item.key]">
        <!-- 可输入模式 -->
        <template v-if="isInputMode">
          <FormInputRender :minor-item="item" />
        </template>
        <!-- 展示 -->
        <template v-else>
          <InfoRender :minor-item="item"/>
        </template>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<style lang="scss" scoped>
.operators {
  position: fixed;
  top: 64px;
  right: 48px;
  z-index: 1;
}
.railway {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}
.operators + .content {
  margin-top: 8px;
}
.btn {
  + .btn {
    margin-top: 12px;
    margin-left: 0px;
  }
}
</style>