<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';
import MinorInput from './MinorInput.vue';
import { getMinorInfo, setMinorInfo } from '~/stores/minors';
import type { MinorInfoT } from '~/types/minors';
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
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

const toPsyTest = () => {
  router.push(`/psychology/${String(id)}`);
}
const onSubmit = (info: MinorInfoT | undefined) => {
  if (!info) {
    return;
  }
  const data = getMinorInfo();
  if (Array.isArray(data)) {
    const index = data.findIndex((i) => i.id === id);
    data[index] = info;
    setMinorInfo(data);
    ElMessage({
      message: '修改成功',
      type: 'success'
    })
  }
}
</script>
<template>
  <div class="minor-detail">
    <MinorInput v-if="detailData" :form="detailData" @view-psy-test="toPsyTest" @submit="onSubmit" />
  </div>
</template>
<style lang="scss" scoped>
.minor-detail {
  height: 100%;
  overflow-y: auto;
  padding: 12px;
  background-image: linear-gradient(to left, rgba(var(--wh-primary), 0.1), transparent);
}
</style>