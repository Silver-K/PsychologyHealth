<script lang="ts" setup>
import { useRoute } from 'vue-router';
import PsyTest from './PsyTest.vue';
import { getMinorInfo, editPsyTestInfo, addPsyTestInfo } from '~/stores/minors';
import type { ComposePsyData, MinorInfoT, StaticFile } from 'shared';
import { ref } from 'vue';
import { useBack } from '~/composables/useBack';

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
const back = useBack();
</script>
<template>
  <div class="psy-view">
    <div class="back-btn" @click="back()">
      <span class="icon icon-back icon-bold icon-free"></span>
      返回
    </div>
    <div class="normal-card">
      <PsyTest v-if="detailData" v-bind="detailData.psyTest" @add="handleAdd" @edit="handleEdit"/>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.psy-view {
  padding: 12px;
  height: calc(100 * var(--vh));
  background-color: rgba(15, 15, 35, 0.2);
}
</style>