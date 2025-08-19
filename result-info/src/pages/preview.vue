<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import DocPreview from '~comp/DocPreview.vue';

const route = useRoute();
const filename = computed(() => String(route.query.filename));
const type = computed(() => (route.query.type as 'docx' | 'pdf' | 'xlsx') || 'docx');
</script>
<template>
  <DocPreview v-if="filename" class="doc-preview" :filename="filename" :type="type" />
</template>

<style lang="scss" scoped>
.doc-preview {
  height: 100vh;
}
</style>