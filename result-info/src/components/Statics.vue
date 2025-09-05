<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { radioLookupMap, type MinorInfoT } from 'shared';
import { getMinorInfo, getRecordByMonth, createRecordDate } from '~/stores/minors';
import { getKeys, prettierNumber } from '~/helpers/utils';
import { StaticsLabels } from 'shared';
import PieChart from '~comp/PieChart.vue';
import { themeList } from '~/themes/pie-themes';
import axios from '~/request/axios';
import { useStreetCommunity } from '~/stores/street';

const data = ref<MinorInfoT[]>([]);

async function getCategoryCount() {
  const resp = await axios('/api/data/category-count', {
    method: 'GET'
  });
  if (resp && resp.data && resp.data.success) {
    return resp.data.data as Array<Array<{ tag: string, value: number }>>;
  } else {
    return [];
  }
}
const { StreetMap, CommunityMap } = useStreetCommunity();
async function transform(category: keyof typeof StaticsLabels, arr: Array<{ tag: string, value: number}>) {
  if (category === 'street') {
    return arr.map((i) => ({
      tag: StreetMap[i.tag].name,
      value: i.value
    }))
  }
  if (category === 'community') {
    return arr.map((i) => ({
      tag: CommunityMap[i.tag].name,
      value: i.value
    }))
  }
  if (category === 'warningStatus') {
    return arr.map((i) => ({
      tag: radioLookupMap.warningStatus[Number(i.tag)],
      value: i.value,
    }))
  }
  if (category === 'gender') {
    return arr.map((i) => ({
      tag: radioLookupMap.gender[Number(i.tag)],
      value: i.value,
    }))
  }

  return arr;
}

type StaticT = Array<{
  title: string;
  categoryCount: Array<{
    tag: string,
    value: number,
  }>
}>;
const statics = ref<StaticT>([]);
watchEffect(async () => {
  const arr = await getCategoryCount();
  getKeys(StaticsLabels).forEach(async (cur, index) => {
    const title = StaticsLabels[cur];
    statics.value[index] = {
      title,
      categoryCount: arr[index] ? await transform(cur, arr[index]) : [],
    }
  });
});
async function getData() {
  data.value = await getMinorInfo();
}
getData();
const keyMap: Record<keyof typeof StaticsLabels, string> = {
  street: 'icon-location',
  community: 'icon-home',
  warningStatus: 'icon-warning',
  age: 'icon-person',
  gender: 'icon-gender',
  tempProtect: 'icon-shield'
}
const iconMap = getKeys(StaticsLabels).reduce((acc, cur) => {
  const value = StaticsLabels[cur];
  acc[value] = keyMap[cur];
  return acc;
}, Object.create(null));
function getIcon(item: StaticT[number]) {
  return iconMap[item.title];
}

const pickMonth = ref(Date.now());
const recordIn = ref(0);
const recordOut = ref(0);
watchEffect(async () => {
  const month = createRecordDate(new Date(pickMonth.value));
  recordIn.value = await getRecordByMonth('in', month);
  recordOut.value = await getRecordByMonth('out', month);
});
const getSeriesColor = (item: StaticT[number]) => {
  const index = getKeys(StaticsLabels).findIndex((key) => {
    const value = StaticsLabels[key];
    return value === item.title
  });
  if (index !== -1) {
    return themeList[index];
  } else {
    return void 0;
  }
}

</script>
<template>
  <div class="layout">
    <div class="row-title">
      <span class="icon icon-free icon-bold icon-pie"></span>
      累计数据概览
    </div>
    <div class="static-row flex">
      <div class="static-card flex">
        <div class="left flex">
          <div class="icon-wrap">
            <i class="icon icon-free icon-bold icon-user"></i>
          </div>
          <div class="label-show">
            <span class="label">参与者总数</span>
            <span class="number">
              <span class="ud-decoration">{{ prettierNumber(data.length) }}</span>
              人
            </span>
          </div>
        </div>
        <div class="right">

        </div>        
      </div>
    </div>
    <div class="row-title flex">
      <div class="left">
        <span class="icon icon-free icon-bold icon-calendar"></span>
        月度数据统计
      </div>
      <div class="right">
        <ElDatePicker type="month" v-model="pickMonth" placeholder="选择一个月份" />
      </div>      
    </div>
    <div class="static-row flex">
      <div class="static-card">
        <div class="left flex">
          <div class="icon-wrap">
            <i class="icon icon-free icon-bold icon-plus"></i>
          </div>
          <div class="label-show">
            <span class="label">本月录入数据</span>
            <span class="number">
              <span class="ud-decoration">{{ prettierNumber(recordIn) }}</span>
              人
            </span>
          </div>
        </div>
        <div class="right">

        </div> 
      </div>
      <div class="static-card">
        <div class="left flex">
          <div class="icon-wrap">
            <i class="icon icon-free icon-bold icon-del"></i>
          </div>
          <div class="label-show">
            <span class="label">本月删除数据</span>
            <span class="number">
              <span class="ud-decoration">{{ prettierNumber(recordOut) }}</span>
              人
            </span>
          </div>
        </div>
        <div class="right">

        </div> 
      </div>
    </div>
    
    <div class="row-title">
      <span class="icon icon-free icon-bold icon-static"></span>
      数据分布图
    </div>
    <div class="static-area">
      <div class="static" v-for="item in statics">
        <span class="title">
          <span class="icon icon-free icon-bold" :style="`color: ${getSeriesColor(item)?.[3]}`" :class="getIcon(item)"></span>
          <span class="static-title">{{ item.title }}</span>
        </span>
        <div class="chart-area">
          <PieChart :color="getSeriesColor(item)" :data-map="item.categoryCount" :pie-name="item.title" />
        </div>
      </div>
    </div>   
  </div> 
</template>

<style lang="scss" scoped>
.layout {
  padding: 24px;
  max-height: 100%;
  overflow-y: auto;
  background-color: var(--wh-color-bg);
}
.main-title {
  font-size: 30px;
  line-height: 36px;
  font-weight: 700;
  font-family: 'Noto Sans SC';
}
.row-title {
  margin-top: 24px;
  font-size: 16px;
  line-height: 24px;
  color: var(--wh-color-text-default);

  &:first-child {
    margin-top: 0;
  }
}
.flex {
  display: flex;
}
.right {
  margin-left: auto;
}
.static-row {
  margin-top: 6px;
}
.static-card {
  background-color: var(--wh-color-bg-light);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,.06);
  transition: all .3s ease;
  border: 1px solid var(--wh-color-bd);
  border-radius: 8px;
  padding: 24px;
  padding-bottom: 36px;
  flex-grow: 1;

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
  }

  + .static-card {
    margin-left: 24px;
  }
}
.top {
  display: flex;
}
.icon-wrap {
  color: var(--wh-color-text-primary);
  background-color: var(--wh-color-bg-primary);
  border-radius: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
}
.label-show {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 16px;
}
.label {
  color: var(--wh-color-text-default);
  font-weight: 500;
  font-size: 14px;
  line-height: 22px;
}
.number {
  color: var(--wh-color-text);
  font-weight: 700;
  font-size: 24px;
  line-height: 32px; 
}
.ud-decoration {
  position: relative;
  width: fit-content;
  z-index: 0; 
  &::after {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 8px;
    background-color: var(--wh-color-bg-primary-secondary);
    z-index: -1;
    border-radius: 4px;
    content: '';
  }
}
.record-out {
  margin-left: 12px;
}
.static-area {
  display: grid;
  justify-content: flex-start;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  column-gap: 24px;
  row-gap: 12px;
}
.static {
  margin-top: 6px;
}
.static-title {
  margin-left: 4px;
  font-weight: 700;
  color: var(--wh-color-text);
}
.chart-area {
  height: 400px;
  margin-top: 8px;
}
</style>