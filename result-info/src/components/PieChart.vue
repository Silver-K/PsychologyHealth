<script setup lang="ts">
import { ref, watch } from 'vue';
import * as echarts from 'echarts/core';
import { TooltipComponent, LegendComponent, type TooltipComponentOption, type LegendComponentOption } from 'echarts/components';
import { PieChart, type PieSeriesOption } from 'echarts/charts';
import { UniversalTransition, LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TooltipComponent, PieChart, LegendComponent, CanvasRenderer, LabelLayout, UniversalTransition]);

type EChartsOption = echarts.ComposeOption<
  | TooltipComponentOption 
  | PieSeriesOption
  | LegendComponentOption
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
}
const props = defineProps<PieChartPropT>();
let myChart: echarts.ECharts;
watch(echartRef, (payload) => {
  if (payload) {
    myChart = echarts.init(payload);
    const option: EChartsOption = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [
        {
          name: props.pieName,
          type: 'pie',
          radius: '50%',
          data: props.dataMap.map((e) => {
            return {
              name: e.tag,
              value: e.value,
            }
          }),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            }
          }
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
          type: 'pie',
          radius: '50%',
          data: newData.map((e) => {
            return {
              name: e.tag,
              value: e.value,
            }
          }),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            }
          }
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
  background-color: var(--wh-color-bg);
}
.payload {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 2;
}
</style>