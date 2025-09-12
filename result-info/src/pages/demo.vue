<script lang="ts" setup>
import PieChartVue from '~/components/PieChart.vue';

const data = [
  {
    tag: 'test123',
    value: 123,
  },
  {
    tag: 'test222',
    value: 124,
  },
  {
    tag: 'test333',
    value: 222,
  }
]
</script>
<template>
  <div class="demo">
    <PieChartVue :data-map="data" pie-name="test"/>
  </div>
</template>

<style lang="scss" scoped>
.demo {
  width: 600px;
  height: 300px;
}
</style>