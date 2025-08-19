<script setup lang="ts">
import { ref, watch } from 'vue';
import * as echarts from 'echarts/core';
import { TooltipComponent, GridComponent, type GridComponentOption } from 'echarts/components';
import { LineChart, type LineSeriesOption } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TooltipComponent, GridComponent, LineChart, CanvasRenderer, UniversalTransition]);

type EChartsOption = echarts.ComposeOption<
  GridComponentOption | LineSeriesOption
>;

const echartRef = ref();

interface LineChartPropT {
  dataMap: Array<
    {
      tag: string;
      value: number;
    }
  >
}
const props = defineProps<LineChartPropT>();
let myChart: echarts.ECharts;
watch(echartRef, (payload) => {
  if (payload) {
    myChart = echarts.init(payload);
    const option: EChartsOption = {
      grid: {
        left: '0',
        right: '0',
        top: 60,
        bottom: '0',
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: props.dataMap.map((e) => e.tag),
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: props.dataMap.map((e) => e.value),
          type: 'line'
        }
      ]
    };

    option && myChart.setOption(option);
  }
});

watch(() => props.dataMap, (newData) => {
  myChart.setOption({
    xAxis: {
      type: 'category',
      data: newData.map((e) => e.tag),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: newData.map((e) => e.value),
        type: 'line'
      }
    ]
  })
}, {
  deep: true,
});
const containerRef = ref();
let resizeOb: ResizeObserver | undefined;
watch(containerRef, (container) => {
  if (container) {
    resizeOb = new ResizeObserver(() => {
      if (myChart) {
        myChart.resize();
      }
    });
    resizeOb.observe(container);
  } else {
    resizeOb?.disconnect();
    resizeOb = void 0;
  }
});
</script>

<template>
  <div ref="containerRef" class="container">
    <div class="backgound"></div>
    <div ref="echartRef" class="payload"></div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  position: relative;
  height: 100%;
  width: 100%;
  padding: 24px;
  padding-top: 16px;
  border-radius: 8px;
  overflow: hidden;
}
.backgound {
  position: absolute;
  inset: 0;
  z-index: 1;
  background-color: var(--wh-color-bg-light);
}
.payload {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 2;
}
</style>