<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { radioLookupMap, type MinorInfoT } from "shared";
import {
  getMinorInfo,
  getRecordByMonth,
  createRecordDate,
} from "~/stores/minors";
import { getKeys, prettierNumber } from "~/helpers/utils";
import { StaticsLabels } from "shared";
import PieChart from "~comp/PieChart.vue";
import { themeList } from "~/themes/pie-themes";
import axios from "~/request/axios";
import { useStreetCommunity } from "~/stores/street";
import { SYSTEM_NAME } from "~/constants/main";

const data = ref<MinorInfoT[]>([]);

async function getCategoryCount() {
  const resp = await axios("/api/data/category-count", {
    method: "GET",
  });
  if (resp && resp.data && resp.data.success) {
    return resp.data.data as Array<Array<{ tag: string; value: number }>>;
  } else {
    return [];
  }
}
const { StreetMap, CommunityMap, ensureStreetCommunityData } =
  useStreetCommunity();
function transform(
  category: keyof typeof StaticsLabels,
  arr: Array<{ tag: string; value: number }>
) {
  if (category === "street") {
    return arr.map((i) => ({
      tag: StreetMap[i.tag].name,
      value: i.value,
    }));
  }
  if (category === "community") {
    return arr.map((i) => ({
      tag: CommunityMap[i.tag].name,
      value: i.value,
    }));
  }
  if (category === "warningStatus") {
    return arr.map((i) => ({
      tag: radioLookupMap.warningStatus[Number(i.tag)],
      value: i.value,
    }));
  }
  if (category === "gender") {
    return arr.map((i) => ({
      tag: radioLookupMap.gender[Number(i.tag)],
      value: i.value,
    }));
  }

  return arr;
}

type StaticT = Array<{
  title: string;
  categoryCount: Array<{
    tag: string;
    value: number;
  }>;
}>;
const statics = ref<StaticT>([]);
watchEffect(async () => {
  // StaticsLabels 的顺序，在客户端和服务端必须是一样的，不然会出现问题
  const arr = await getCategoryCount();
  await ensureStreetCommunityData();
  getKeys(StaticsLabels).forEach((cur, index) => {
    const title = StaticsLabels[cur];
    statics.value[index] = {
      title,
      categoryCount: arr[index] ? transform(cur, arr[index]) : [],
    };
  });
});
async function getData() {
  data.value = await getMinorInfo();
}
getData();
const keyMap: Record<keyof typeof StaticsLabels, string> = {
  street: "icon-location",
  community: "icon-home",
  warningStatus: "icon-warning",
  age: "icon-person",
  gender: "icon-gender",
  tempProtect: "icon-shield",
};
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
  recordIn.value = await getRecordByMonth("in", month);
  recordOut.value = await getRecordByMonth("out", month);
});
const getSeriesColor = (item: StaticT[number]) => {
  const index = getKeys(StaticsLabels).findIndex((key) => {
    const value = StaticsLabels[key];
    return value === item.title;
  });
  if (index !== -1) {
    return themeList[index];
  } else {
    return void 0;
  }
};
const particlesOpts = {
  fpsLimit: 60,
  particles: {
    number: {
      value: 80,
      density: {
        enable: true,
        value_area: 800,
      },
    },
    color: {
      value: "#00C2FF",
    },
    shape: {
      type: "circle",
    },
    opacity: {
      value: 0.5,
      random: false,
    },
    size: {
      value: 3,
      random: true,
    },
    links: {
      enable: true,
      distance: 150,
      color: "#00C2FF",
      opacity: 0.4,
      width: 1,
    },
    move: {
      enable: true,
      speed: 2,
      direction: "none",
      random: false,
      straight: false,
      out_mode: "out",
    },
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: {
        enable: true,
        mode: "grab",
      },
      onclick: {
        enable: true,
        mode: "push",
      },
    },
    modes: {
      grab: {
        distance: 140,
        links: {
          opacity: 1,
        },
      },
      push: {
        particles_nb: 4,
      },
    },
  },
  retina_detect: true,
};
</script>
<template>
  <div class="layout">
    <vue-particles id="particles" :options="particlesOpts" />
    <div class="top">
      <div class="bg"></div>
      <span class="sys-title">{{ SYSTEM_NAME }}</span>
    </div>
    <div class="placeholder"></div>
    <div class="row-title">
      <span class="icon icon-free icon-bold icon-pie"></span>
      累计数据概览
    </div>
    <div class="static-row flex">
      <div class="static-card cyber-card flex">
        <div class="left flex">
          <div class="icon-wrap style1">
            <i class="icon icon-free icon-bold icon-user"></i>
          </div>
          <div class="label-show">
            <span class="label">参与者总数</span>
            <span class="number purple">
              <span class="ud-decoration">{{
                prettierNumber(data.length)
              }}</span>
            </span>
          </div>
        </div>
        <div class="right"></div>
      </div>
    </div>
    <div class="row-title flex">
      <div class="left">
        <span class="icon icon-free icon-bold icon-calendar"></span>
        月度数据统计
      </div>
      <div class="right">
        <ElDatePicker
          class="date-picker"
          type="month"
          v-model="pickMonth"
          placeholder="选择一个月份"
          :teleported="false"
          popper-class="date-picker-popper"
        />
      </div>
    </div>
    <div class="static-row flex">
      <div class="static-card cyber-card">
        <div class="left flex">
          <div class="icon-wrap style2">
            <i class="icon icon-free icon-bold icon-static"></i>
          </div>
          <div class="label-show">
            <span class="label">本月录入数据</span>
            <span class="number cyan">
              <span class="ud-decoration">{{ prettierNumber(recordIn) }}</span>
            </span>
          </div>
        </div>
        <div class="right"></div>
      </div>
      <div class="static-card cyber-card">
        <div class="left flex">
          <div class="icon-wrap style3">
            <i class="icon icon-free icon-bold icon-del"></i>
          </div>
          <div class="label-show">
            <span class="label">本月删除数据</span>
            <span class="number pink">
              <span class="ud-decoration">{{ prettierNumber(recordOut) }}</span>
            </span>
          </div>
        </div>
        <div class="right"></div>
      </div>
    </div>

    <div class="row-title">
      <span class="icon icon-free icon-bold icon-static"></span>
      数据分布图
    </div>
    <div class="static-area">
      <div class="static" v-for="item in statics">
        <span class="title">
          <span
            class="icon icon-free icon-bold"
            :style="`color: ${getSeriesColor(item)?.[1]}`"
            :class="getIcon(item)"
          ></span>
          <span class="static-title">{{ item.title }}</span>
        </span>
        <div class="chart-area">
          <PieChart
            :color="getSeriesColor(item)"
            :data-map="item.categoryCount"
            :pie-name="item.title"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#particles {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 0;
  pointer-events: none;
  transform: translateZ(1px);
}
.layout {
  --h: 120px;
  position: relative;
  padding: 24px;
  padding-top: 0px;
  padding-bottom: 64px;
  background-color: #0a0a1a;
  background-image: linear-gradient(rgba(3, 216, 243, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(3, 216, 243, 0.1) 1px, transparent 1px);
  background-size: 30px 30px;
  overflow: hidden;
}
.top {
  position: absolute;
  inset: 0;
  bottom: auto;
  top: -45px;
  height: var(--h);
}
.bg {
  --ratio: calc(var(--h) / 647);
  opacity: 0.5;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: var(--h);
  background-image: url('~/assets/imgs/bg.webp');
  background-position: center;
  background-size: 1306px 100%;
  background-repeat: no-repeat;

  &::before, &::after {
    content: '';
    position: absolute;
    top: 0;
    height: var(--h);
    background-repeat: no-repeat;
    background-size: cover;
    background-repeat: no-repeat;
  }
  &::before {
    left: -32px;
    width: calc(488 * var(--ratio));
    background-image: url('~/assets/imgs/bg_left.webp');
  }
  &::after {
    top: -1px;
    right: -32px;
    width: calc(465 * var(--ratio));
    background-image: url('~/assets/imgs/bg_right.webp');
  }
}
.placeholder {
  height: 80px;
}
.sys-title {
  position: absolute;
  left: 50%;
  top: 42px;
  white-space: nowrap;

  text-shadow: 0 0 5px rgba(3, 216, 243, 0.8), 0 0 10px rgba(3, 216, 243, 0.6);
  font-size: 36px;
  line-height: 48px;
  color: var(--wh-color-text-inverse);
  transform: translateX(-50%);
}

.row-title {
  margin-top: 24px;
  font-size: 20px;
  line-height: 32px;
  color: var(--wh-color-text-inverse);
  text-shadow: 0 0 5px rgba(3, 216, 243, 0.8), 0 0 10px rgba(3, 216, 243, 0.6);

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
  margin-top: 12px;
}
.static-card {
  padding: 24px;
  padding-bottom: 36px;
  flex-grow: 1;

  + .static-card {
    margin-left: 24px;
  }
}
.top {
  display: flex;
}
.icon-wrap {
  --gradient-st1: #a855f7;
  --gradient-ed1: #06b6d4;
  --gradient-st2: #ec4899;
  --gradient-ed2: #a855f7;
  color: var(--wh-color-text-inverse);
  border-radius: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 64px;
  height: 64px;
  font-size: 24px;

  &.style1 {
    background-image: linear-gradient(to right, var(--gradient-st1), var(--gradient-ed1));
  }
  &.style2 {
    background-image: linear-gradient(to right, var(--gradient-st2), var(--gradient-ed2));
  }
  &.style3 {
    background-image: linear-gradient(to right, var(--gradient-ed1), var(--gradient-st2));;
  }
}
.label-show {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 16px;
}
.label {
  color: var(--wh-color-text-inverse);
  font-weight: 500;
  font-size: 22px;
  line-height: 30px;
}
.number {
  font-family: 'Orbitron';
  color: var(--wh-color-text-inverse);
  font-weight: 700;
  font-size: 48px;
  line-height: 64px;

  &.pink {
    color: rgb(244, 114, 182);
  }
  &.cyan {
    color: rgb(34, 211, 238);
  }
  &.purple {
    color: rgb(192, 132, 252);
  }
}
.ud-decoration {
  position: relative;
  width: fit-content;
  z-index: 0;
  &::after {
    position: absolute;
    left: 0;
    bottom: 6px;
    width: 100%;
    height: 6px;
    background-color: var(--wh-color-bg-primary-secondary);
    z-index: -1;
    border-radius: 4px;
    content: "";
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
  row-gap: 24px;
}
.static {
  margin-top: 6px;

  .title {
    display: block;
    font-size: 16px;
    line-height: 24px;
    text-align: right;
  }
}
.static-title {
  margin-left: 4px;
  font-weight: 700;
  color: var(--wh-color-text-inverse);
}
.chart-area {
  height: 400px;
  margin-top: 12px;
}
:deep(.date-picker) {
  --el-input-text-color: var(--wh-color-text-inverse);
  --el-input-bg-color: transparent;

  .el-input__wrapper {
    border: 1px solid rgba(3, 216, 243, 0.3);
    box-shadow: 0 0 15px rgba(3, 216, 243, 0.2);
  }
  .el-input__inner {
    text-shadow: 0 0 5px rgba(3, 216, 243, 0.8), 0 0 10px rgba(3, 216, 243, 0.6);
  }
  .el-input__prefix-inner {
    .el-input__icon {
      box-shadow: 0px 0px 5px -2px rgba(3, 216, 243, 0.8), 0 0 10px rgba(3, 216, 243, 0.6);
    }
  }
}
:deep(.date-picker-popper) {
  --el-bg-color-overlay: rgba(15, 15, 35, 1);
  --el-text-color-regular: var(--wh-color-text-inverse);
  --el-border-color-light: rgba(3, 216, 243, 0.3);
  --el-border-color-lighter: rgba(3, 216, 243, 0.3);
  .el-date-picker {
    --el-datepicker-icon-color: var(--wh-color-text-inverse);
  }
}
</style>
