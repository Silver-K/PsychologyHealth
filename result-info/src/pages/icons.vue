<script lang="ts" setup>
import list from '~/assets/font/font-id.json';

</script>
<template>
  <div class="demo">
    <div class="title">Free</div>
    <div class="grid">
      <div class="icon-card" v-for="item in list" :key="item">
        <i class="icon icon-free" :title="item" :style="`--icon: '${item.replace('\\\\', '\\')}'`"></i>
      </div>
    </div>
    <div class="title">Brands</div>
    <div class="grid">
      <div class="icon-card" v-for="item in list" :key="item">
        <i class="icon icon-brands" :title="item" :style="`--icon: '${item.replace('\\\\', '\\')}'`"></i>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.grid {
  display: flex;
  flex-wrap: wrap;
}
.icon-card {
  width: 24px;
  height: 24px;
  margin: 12px;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}
.icon {
  font-style: normal;
  &::before {
    content: var(--icon);
  }
}
.icon-free {
  font-family: 'Font Awesome 6 Free';
  font-weight: 900;
}
.icon-brands {
  font-family: 'Font Awesome 6 Brands';
  font-weight: 400;
}
</style>