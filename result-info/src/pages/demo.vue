<script lang="ts" setup>
import { ref } from 'vue';

const apiUrl = ref('');
</script>
<template>
  <div class="demo">
    调用api:
    <input v-model="apiUrl">
  </div>
</template>

<style lang="scss" scoped>
.demo {
  max-width: 810px;
}
</style>