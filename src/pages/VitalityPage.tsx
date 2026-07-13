// ===== 课程生命力页面 =====
import { useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import CardChart from '../components/CardChart';

export default function VitalityPage() {
  const { vitalityScores, loading, fetchData } = useStore();

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="mt-3 text-sm text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }

  const latest = vitalityScores[vitalityScores.length - 1];
  const first = vitalityScores[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">课程生命力</h2>
        <p className="text-sm text-slate-500 mt-1">面向课程生命力提升的持续改进 — 五维评估与可视化</p>
      </div>

      {/* 五维生命力雷达图 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardChart
          title="当前课程生命力五维评估"
          option={{
            tooltip: {},
            radar: {
              indicator: [
                { name: '课堂活力', max: 100 },
                { name: '创造力培养', max: 100 },
                { name: '学习感知', max: 100 },
                { name: '资源延续', max: 100 },
                { name: '课程进化', max: 100 },
              ],
              shape: 'polygon',
              splitNumber: 5,
              axisName: { color: '#64748b' },
              splitArea: { areaStyle: { color: ['#f8fafc', '#fff'] } },
            },
            series: [{
              type: 'radar' as const,
              data: [
                {
                  value: [latest.classroomVitality, latest.creativity, latest.learningPerception, latest.resourceExtension, latest.courseEvolution],
                  name: '当前',
                  areaStyle: { color: 'rgba(59, 130, 246, 0.3)' },
                  itemStyle: { color: '#3b82f6' },
                  lineStyle: { color: '#3b82f6', width: 2 },
                },
                {
                  value: [first.classroomVitality, first.creativity, first.learningPerception, first.resourceExtension, first.courseEvolution],
                  name: '期初',
                  areaStyle: { color: 'rgba(148, 163, 184, 0.2)' },
                  itemStyle: { color: '#94a3b8' },
                  lineStyle: { color: '#94a3b8', width: 2, type: 'dashed' },
                },
              ],
            }],
          }}
          height={400}
        />

        {/* 五维分数详情 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-4">五维分数详情</h3>
          <div className="space-y-5">
            {[
              { label: '课堂活力', value: latest.classroomVitality, color: 'bg-blue-500', icon: '🎯' },
              { label: '创造力培养', value: latest.creativity, color: 'bg-emerald-500', icon: '💡' },
              { label: '学习感知', value: latest.learningPerception, color: 'bg-purple-500', icon: '👁️' },
              { label: '资源延续', value: latest.resourceExtension, color: 'bg-orange-500', icon: '📚' },
              { label: '课程进化', value: latest.courseEvolution, color: 'bg-pink-500', icon: '🔄' },
            ].map(dim => (
              <div key={dim.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    {dim.icon} {dim.label}
                  </span>
                  <span className="text-sm font-bold text-slate-800">{dim.value} 分</span>
                </div>
                <div className="bg-slate-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${dim.color} transition-all`}
                    style={{ width: `${dim.value}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-slate-800">综合评分</span>
                <span className="text-2xl font-bold text-blue-600">{latest.overall} 分</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 生命力趋势 */}
      <CardChart
        title="生命力趋势（16周）"
        option={{
          tooltip: { trigger: 'axis' as const },
          legend: { data: ['总体', '课堂活力', '创造力', '学习感知', '资源延续', '课程进化'], bottom: 0 },
          xAxis: {
            type: 'category' as const,
            data: vitalityScores.map(v => `W${v.week}`),
            axisLabel: { rotate: 45 },
          },
          yAxis: { type: 'value' as const, min: 0, max: 100, axisLabel: { formatter: '{value}分' } },
          series: [
            { name: '总体', type: 'line', data: vitalityScores.map(v => v.overall), smooth: true, lineStyle: { width: 3 }, itemStyle: { color: '#3b82f6' }, areaStyle: { opacity: 0.1 } },
            { name: '课堂活力', type: 'line', data: vitalityScores.map(v => v.classroomVitality), smooth: true, itemStyle: { color: '#10b981' } },
            { name: '创造力', type: 'line', data: vitalityScores.map(v => v.creativity), smooth: true, itemStyle: { color: '#f59e0b' } },
            { name: '学习感知', type: 'line', data: vitalityScores.map(v => v.learningPerception), smooth: true, itemStyle: { color: '#6366f1' } },
            { name: '资源延续', type: 'line', data: vitalityScores.map(v => v.resourceExtension), smooth: true, itemStyle: { color: '#ec4899' } },
            { name: '课程进化', type: 'line', data: vitalityScores.map(v => v.courseEvolution), smooth: true, itemStyle: { color: '#8b5cf6' } },
          ],
          grid: { left: 60, right: 20, top: 20, bottom: 60 },
        }}
        height={350}
      />
    </div>
  );
}
