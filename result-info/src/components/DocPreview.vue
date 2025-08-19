<script setup lang="tsx">
import VueOfficeDocx from '@vue-office/docx/lib/v3/vue-office-docx.mjs';
import VueOfficeXlsx from '@vue-office/excel/lib/v3/vue-office-excel.mjs';
import VueOfficePdf from '@vue-office/pdf/lib/v3/vue-office-pdf.mjs';
import '@vue-office/docx/lib/v3/index.css';
import '@vue-office/excel/lib/v3/index.css';
import { computed, h } from 'vue';

interface DocPropT {
  filename: string;
  type: 'pdf' | 'docx' | 'xlsx';
}
const props = defineProps<DocPropT>();
const url = computed(() => `/api/files/download/${props.filename}`);
const isPdf = computed(() => {
  return props.type === 'pdf';
});
const isDocx = computed(() => {
  return props.type === 'docx';
});
const isXlsx = computed(() => {
  return props.type === 'xlsx';
});
const PreviewComp = () => {
  if (isPdf.value) {
    return h(VueOfficePdf, { src: url.value });
  }
  if (isDocx.value) {
    return h(VueOfficeDocx, { src: url.value });
  }
  if (isXlsx.value) {
    return h(VueOfficeXlsx, { src: url.value });
  }
  return h('img', { src: url.value });
}
</script>

<template>
  <PreviewComp />
</template>