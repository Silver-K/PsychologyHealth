<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';
import MinorInput from './MinorInput.vue';
import { downloadMinorInfo, getMinorInfo, modifyMinorInfo } from '~/stores/minors';
import type { MinorInfoT } from 'shared';
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { transformFileServe } from '~/schemas/minors';
import { useBack } from '~/composables/useBack';

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
const back = useBack();
const backToHome = () => {
  back('/home?row_page_key=minors');
}
</script>
<template>
  <div class="minor-detail">
    <div class="back-btn" @click="backToHome">
      <span class="icon icon-back icon-bold icon-free"></span>
      返回
    </div>
    <div class="normal-card">
      <MinorInput v-if="detailData" :form="detailData" @view-psy-test="toPsyTest" @submit="onSubmit" @download="onDownload" />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.minor-detail {
  height: calc(100 * var(--vh));
  padding: 12px;
  background-color: rgba(15, 15, 35, 0.2);
}
</style>