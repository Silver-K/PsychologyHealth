<script lang="ts" setup>
import { useRoute } from 'vue-router';
import PsyTest from './PsyTest.vue';
import { getMinorInfo, editPsyTestInfo, addPsyTestInfo } from '~/stores/minors';
import type { ComposePsyData, MinorInfoT, StaticFile } from 'shared';
import { ref } from 'vue';

const route = useRoute();
const { id } = route.params as { id: string };

const detailData = ref<MinorInfoT | null>(null);
async function updateData() {
  const [data] = await getMinorInfo(void 0, { id });
  detailData.value = data;
}
updateData();

const handleAdd = async (key: keyof ComposePsyData, form: StaticFile) => {
  const result = await addPsyTestInfo(id, key, form);
  if (result === 0) {
    updateData();
  }
}
const handleEdit = async (key: keyof ComposePsyData, form: StaticFile) => {
  const result = await editPsyTestInfo(id, key, form.id, form);
  if (result === 0) {
    updateData();
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