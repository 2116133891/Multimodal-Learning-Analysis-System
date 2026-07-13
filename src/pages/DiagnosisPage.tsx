// ===== 动态诊断页面 =====
import { useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import CardChart from '../components/CardChart';

export default function DiagnosisPage() {
  const { records, alerts, fetchData } = useStore();

  useEffect(() => { fetchData(); }, [fetchData]);

  // 按周统计参与度
  const weeklyEngagement = Array.from({ length: 16 }, (_, i) => {
    const weekRecords = records.filter(r => r.week === i + 1 && r.type === 'behavior');
    const avg = weekRecords.length > 0 ? Math.round(weekRecords.reduce((s, r) => s + r.value, 0) / weekRecords.length) : 0;
    return { week: i + 1, avg };
  });

  // 按模块统计知识掌握度
  const moduleMastery = records.filter(r => r.type === 'outcome' || r.type === 'process');
  const moduleGroups: Record<string, number[]> = {};
  moduleMastery.forEach(r => {
    if (!moduleGroups[r.moduleId]) moduleGroups[r.moduleId] = [];
    moduleGroups[r.moduleId].push(r.value);
  });
  const moduleStats = Object.entries(moduleGroups).map(([modId, scores]) => {
    const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
    return { id: modId, avg, count: scores.length };
  });

  // 知识薄弱点
  const weakPoints = moduleStats.sort((a, b) => a.avg - b.avg).slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">动态诊断</h2>
        <p className="text-sm text-slate-500 mt-1">基于多模态学习分析的课程动态诊断 — 从"结果评价"向"过程诊断"转变</p>
      </div>

      {/* 告警面板 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-base font-semibold text-slate-800 mb-4">诊断告警列表</h3>
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
              alert.severity === 'high' ? 'bg-red-50 border-red-500' :
              alert.severity === 'medium' ? 'bg-orange-50 border-orange-400' :
              'bg-yellow-50 border-yellow-400'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{alert.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      alert.severity === 'high' ? 'bg-red-100 text-red-700' :
                      alert.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {alert.severity === 'high' ? '严重' : alert.severity === 'medium' ? '中等' : '轻微'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{alert.description}</p>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">第{alert.week}周</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 参与度趋势 */}
        <CardChart
          title="学习参与度趋势（按周）"
          option={{
            tooltip: { trigger: 'axis' as const },
            xAxis: {
              type: 'category' as const,
              data: weeklyEngagement.map(w => `W${w.week}`),
              axisLabel: { rotate: 45, fontSize: 10 },
            },
            yAxis: { type: 'value' as const, min: 0, max: 100, axisLabel: { formatter: '{value}分' } },
            series: [{
              type: 'line' as const,
              data: weeklyEngagement.map(w => w.avg),
              smooth: true,
              areaStyle: { opacity: 0.2 },
              itemStyle: { color: '#3b82f6' },
              lineStyle: { width: 2 },
              markLine: {
                data: [{ yAxis: 70, name: '警戒线' }],
                lineStyle: { color: '#ef4444', type: 'dashed' },
                label: { formatter: '警戒线', fontSize: 10 },
              },
            }],
            grid: { left: 50, right: 20, top: 20, bottom: 50 },
          }}
          height={300}
        />

        {/* 知识掌握度 */}
        <CardChart
          title="各模块知识掌握度"
          option={{
            tooltip: { trigger: 'axis' as const },
            xAxis: {
              type: 'category' as const,
              data: moduleStats.map(m => m.id === 'm1' ? '色彩基础' : m.id === 'm2' ? '造型构图' : m.id === 'm3' ? '风格创新' : '综合创作'),
            },
            yAxis: { type: 'value' as const, min: 0, max: 100, axisLabel: { formatter: '{value}分' } },
            series: [{
              type: 'bar' as const,
              data: moduleStats.map(m => ({
                value: m.avg,
                itemStyle: {
                  color: m.avg >= 80 ? '#10b981' : m.avg >= 65 ? '#3b82f6' : '#f59e0b',
                  borderRadius: [6, 6, 0, 0],
                },
              })),
            }],
            grid: { left: 50, right: 20, top: 20, bottom: 50 },
          }}
          height={300}
        />
      </div>

      {/* 知识薄弱点 */}
      {weakPoints.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h3 className="text-base font-semibold text-amber-800 mb-2">⚠️ 知识薄弱点识别</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {weakPoints.map((wp, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border border-amber-100">
                <p className="text-sm font-medium text-slate-700">
                  {wp.id === 'm1' ? '色彩基础与原理' : wp.id === 'm2' ? '造型与构图' : wp.id === 'm3' ? '风格探索与创新' : '综合创作与展示'}
                </p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{wp.avg}分</p>
                <p className="text-xs text-slate-400 mt-1">{wp.count} 条数据</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
