<script lang="ts" setup>
import { useRoute } from 'vue-router';
import PsyTest from './PsyTest.vue';
import { getMinorInfo, setMinorInfo } from '~/stores/minors';
import type { MinorInfoT, StaticFile } from '~/types/minors';
import { ref } from 'vue';

const route = useRoute();
const { id } = route.params;
function getDetailData(id: string) {
  const data = getMinorInfo();
  if (Array.isArray(data)) {
    const found = data.find((i) => i.id === id);
    if (found) {
      return found;
    }
    return null;
  } else {
    return null;
  }
}
const detailData = ref<MinorInfoT | null>(null);
detailData.value = getDetailData(String(id));

const handleAdd = (key: keyof MinorInfoT['psyTest'], form: StaticFile) => {
  const data = getMinorInfo();
  if (Array.isArray(data)) {
    const found = data.find((i) => i.id === id);
    if (found) {
      found.psyTest[key].push(form);
      setMinorInfo(data);
      detailData.value = getDetailData(String(id));
    }
  }    
}
const handleEdit = (key: keyof MinorInfoT['psyTest'], index: number, form: StaticFile) => {
const data = getMinorInfo();
  if (Array.isArray(data)) {
    const found = data.find((i) => i.id === id);
    if (found && found.psyTest) {
      found.psyTest[key][index] = form;
      setMinorInfo(data);
      detailData.value = getDetailData(String(id));
    }
  } 
}
</script>
<template>
  <div class="psy-view">
    <PsyTest v-if="detailData" v-bind="detailData.psyTest" @add="handleAdd" @edit="handleEdit"/>
  </div>
</template>
<style lang="scss" scoped>
.psy-view {
  padding: 12px;
  overflow-y: auto;
  height: 100%;
}
</style>