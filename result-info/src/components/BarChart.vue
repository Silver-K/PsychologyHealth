<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import * as echarts from 'echarts/core';
import { TooltipComponent, GridComponent, type GridComponentOption, LegendComponent, type TooltipComponentOption, type LegendComponentOption } from 'echarts/components';
import { BarChart, type BarSeriesOption } from 'echarts/charts';
import { UniversalTransition, LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TooltipComponent,GridComponent, BarChart, LegendComponent, CanvasRenderer, LabelLayout, UniversalTransition]);

type EChartsOption = echarts.ComposeOption<
  | TooltipComponentOption 
  | BarSeriesOption
  | LegendComponentOption
  | GridComponentOption
>;

const echartRef = ref();

interface PieChartPropT {
  dataMap: Array<
    {
      tag: string;
      value: number;
    }
  >;
  pieName: string;
  color?: string[];
}
const props = defineProps<PieChartPropT>();
let myChart: echarts.ECharts;
const total = computed(() => props.dataMap.reduce((acc, e) => acc + e.value, 0));
watch(echartRef, (payload) => {
  if (payload) {
    myChart = echarts.init(payload);
    const option: EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: (param: any) => {
          const { seriesName, data } = param;
          const percent = total.value ? (data / total.value * 100).toFixed(2) : 0;
          return `${seriesName}<br>${data} (${percent}%)`
        }
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: {
          color: '#fff',
        }
      },
      color: props.color || void 0,
      xAxis: {
        type: 'category',
        data: props.dataMap.map((e) => e.tag),
        boundaryGap: true,
        axisTick: {
          alignWithLabel: true,
        },
        axisLabel: {
          color: '#eee',
        },
        axisLine: {
          lineStyle: {
            color: '#eee',
          }
        }
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        splitLine: {
          lineStyle: {
            color: '#666',
            type: 'dashed'
          }
        },
        axisLabel: {
          color: '#eee',
        }
      },
      series: [
        {
          name: props.pieName,
          type: 'bar',
          data: props.dataMap.map((e) =>  e.value),
          barWidth: 30,
          barCategoryGap: 30
        }
      ]
    };

    option && myChart.setOption(option);
  }
});

watch(() => props.dataMap, (newData) => {
  myChart.setOption({
    series: [
      {
        name: props.pieName,
        type: 'bar',
        data: newData.map((e) =>  e.value),
      }
    ]
  })
}, {
  deep: true,
});
const containerRef = ref();
let resizeOb: ResizeObserver | undefined;
let timeout = 0;
watch(containerRef, (container) => {
  if (container) {
    resizeOb = new ResizeObserver(() => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (myChart) {
          myChart.resize();
        }
      }, 300);
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
    <div class="backgound cyber-card"></div>
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
}
.backgound {
  position: absolute;
  inset: 0;
  z-index: 1;
}
.container {
  &:hover {
    .backgound {
      transform: translateY(-5px);
      box-shadow: 0 0 25px rgba(3, 216, 243, 0.4);
      border-color: rgba(255, 0, 184, 0.5);
    }
  }
}
.payload {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 2;
}
</style>