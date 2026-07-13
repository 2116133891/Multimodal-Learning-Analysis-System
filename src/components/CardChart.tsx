// ===== ECharts 图表封装组件 =====
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface CardChartProps {
  title: string;
  option: EChartsOption;
  height?: number;
}

const baseTheme = {
  textStyle: { fontFamily: 'Inter, Noto Sans SC, sans-serif' },
  background: 'transparent',
};

export default function CardChart({ title, option, height = 350 }: CardChartProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="p-4">
        <ReactECharts option={{ ...option, ...baseTheme }} style={{ height: `${height}px`, width: '100%' }} />
      </div>
    </div>
  );
}
