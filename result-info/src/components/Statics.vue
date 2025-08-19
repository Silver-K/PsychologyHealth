<script setup lang="ts">
import { computed, ref } from 'vue';
import type { MinorInfoT } from '~/types/minors';
import { getMinorInfo, getRecordByMonth, createRecordDate } from '~/stores/minors';
import { getKeys } from '~/helpers/utils';
import { StaticsLabels } from '~/schemas/statics';
import PieChart from '~comp/PieChart.vue';

const data = ref<MinorInfoT[]>([]);

type StringKeyStatics = keyof typeof StaticsLabels;
function getCategoryCount(dataArr: MinorInfoT[], category: StringKeyStatics) {
  const categoryMap = dataArr.reduce((acc, cur) => {
    const values = cur[category];
    const key = typeof values === 'boolean' 
    ?  values === true ? '是' : '否'
    : String(values);
  
    if (acc[key]) {
      acc[key].push(cur);
    } else {
      acc[key] = [cur];
    }
    return acc;
  }, Object.create(null) as Record<string, MinorInfoT[]>);
  return getKeys(categoryMap).map((key) => {
    return {
      tag: key,
      value: categoryMap[key].length,
    }
  });
}

type StaticT = Array<{
  title: string;
  categoryCount: Array<{
    tag: string,
    value: number,
  }>
}>;
const statics = computed<StaticT>(() => {
  return getKeys(StaticsLabels).reduce((acc, cur) => {
    const title = StaticsLabels[cur];
    const categoryCount = getCategoryCount(data.value, cur);
    acc.push({
      title,
      categoryCount,
    })
    return acc;
  }, [] as StaticT);
});
function getData() {
  data.value = getMinorInfo();
}
getData();

const pickMonth = ref(Date.now());
const recordIn = computed(() => {
  const month = createRecordDate(new Date(pickMonth.value));
  return getRecordByMonth('in', month);
});
const recordOut = computed(() => {
  const month = createRecordDate(new Date(pickMonth.value));
  return getRecordByMonth('out', month);
});
</script>
<template>
  <div class="layout">
    <div class="box">
      <div class="total">
        <span class="title total__label">参与者总数：</span>
        <span class="title total__count number">{{ data.length }}</span>
      </div>
    </div>
    <div class="box">
      <div class="monthly">
        <span class="title">月度录入/删除：</span>
        <el-date-picker
          v-model="pickMonth"
          type="month"
          placeholder="选择一个月份"
        />
        <div class="monthly-count">
          <span class="record-in text">录入：
            <span class="number">{{ recordIn }}</span>
          </span>
          <span class="record-out text">
            删除：
            <span class="number">{{ recordOut }}</span>
          </span>
        </div>
      </div>
    </div>
    <div class="static-area">
      <div class="static" v-for="item in statics">
        <span class="title">{{ item.title }}</span>
        <div class="chart-area">
          <PieChart :data-map="item.categoryCount" :pie-name="item.title" />
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
  background-color: var(--wh-color-bg-light);
}
.title {
  font-size: 24px;
  line-height: 32px;
}
.text {
  font-size: 18px;
  line-height: 22px;
}
.box {
  display: inline-block;
  margin-top: 24px;
  border: 1px solid rgba(var(--wh-primary), 0.25);
  padding: 24px;
  width: calc(50% - 12px);
  height: 300px;
  transition: border-color 0.6s ease, box-shadow 0.6s ease;
  &:hover {
    border: 1px solid transparent;
    box-shadow: 0 0 12px 4px rgba(var(--wh-primary), 0.25);
  }
  + .box {
    margin-left: 24px;
  }
}
.monthly {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.monthly-count {
  margin-top: 12px;
  flex-basis: 100%;
}
.record-out {
  margin-left: 12px;
}
.number {
  color: var(--wh-color-brand);
}
.static-area {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 24px;
}
.static {
  overflow: hidden;
  flex-basis: calc(50% - 12px);
  flex-grow: 1;
  flex-shrink: 1;
  margin-top: 24px;
}
.chart-area {
  height: 400px;
  margin-top: 12px;
}

</style>