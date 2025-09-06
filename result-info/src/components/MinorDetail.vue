<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';
import MinorInput from './MinorInput.vue';
import { downloadMinorInfo, getMinorInfo, modifyMinorInfo } from '~/stores/minors';
import type { MinorInfoT } from 'shared';
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { transformFileServe } from '~/schemas/minors';

const route = useRoute();
const router = useRouter();
const { id } = route.params as { id: string };
async function getDetailData(id: string) {
  const data = await getMinorInfo(void 0, { id });
  if (Array.isArray(data) && data.length) {
    return data[0];
  } else {
    await router.replace('/list');
    return null;
  }
}
const detailData = ref<MinorInfoT | null>(null);
async function updateData() {
  detailData.value = await getDetailData(String(id));
}
updateData();

const toPsyTest = () => {
  router.push(`/psychology/${String(id)}`);
}
const onSubmit = async (info: MinorInfoT | undefined) => {
  if (!info || !detailData.value) {
    return;
  }
  detailData.value = transformFileServe(detailData.value);
  const result = await modifyMinorInfo(id, detailData.value);
  if (result === 1) {
    ElMessage({
      message: '修改失败',
      type: 'warning'
    });
  } else {
    ElMessage({
      message: '修改成功',
      type: 'success'
    });
    updateData();
  }
}
const onDownload = () => {
  downloadMinorInfo(String(id));
}
</script>
<template>
  <div class="minor-detail">
    <div class="card">
      <MinorInput v-if="detailData" :form="detailData" @view-psy-test="toPsyTest" @submit="onSubmit" @download="onDownload" />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.minor-detail {
  height: 100%;
  overflow-y: auto;
  padding: 12px;
  background-color: rgba(var(--wh-primary), 0.1);
}
.card {
  margin: 12px;
  padding: 24px 36px;
  background-color: var(--wh-color-bg);
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -1px rgba(0,0,0,.06);
  transition: all .3s ease;

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
  }
}
</style>