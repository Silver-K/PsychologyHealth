<script lang="ts" setup>
import InventoryTable from './InventoryTable.vue';
</script>
<template>
  <div class="card">
    <InventoryTable />
  </div>
</template>

<style lang="scss" scoped>
.card {
  padding: 24px;
  padding-left: 128px;
  padding-right: 128px;
  background-color: var(--wh-color-bg-light);
}
</style>