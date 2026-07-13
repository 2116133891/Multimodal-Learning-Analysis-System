// ===== 干预有效性评估页面 =====
import { useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import CardChart from '../components/CardChart';
import { BarChart3, ArrowRight, CheckCircle, TrendingUp } from 'lucide-react';

export default function EfficacyEvalPage() {
  const { fetchData } = useStore();

  useEffect(() => { fetchData(); }, [fetchData]);

  // 模拟干预有效性数据
  const interventions = [
    {
      id: 'int1', type: '教学节奏调整', description: '第3周增加色彩理论实践课时',
      pre: { cv: 58, cr: 52, lp: 60, re: 55, ce: 48, oe: 62 },
      post: { cv: 78, cr: 65, lp: 75, re: 68, ce: 62, oe: 80 },
    },
    {
      id: 'int2', type: '任务分层设计', description: '第6周设计分层造型练习任务',
      pre: { cv: 62, cr: 55, lp: 58, re: 60, ce: 50, oe: 58 },
      post: { cv: 80, cr: 72, lp: 76, re: 70, ce: 65, oe: 78 },
    },
    {
      id: 'int3', type: '资源更新', description: '第10周建立风格案例资源库',
      pre: { cv: 68, cr: 60, lp: 65, re: 52, ce: 55, oe: 65 },
      post: { cv: 82, cr: 78, lp: 78, re: 75, ce: 70, oe: 80 },
    },
    {
      id: 'int4', type: '评价改革', description: '第14周设置中期检查点',
      pre: { cv: 55, cr: 50, lp: 52, re: 58, ce: 45, oe: 58 },
      post: { cv: 75, cr: 70, lp: 72, re: 72, ce: 65, oe: 75 },
    },
  ];

  const dimensions = [
    { key: 'cv', label: '课堂活力' },
    { key: 'cr', label: '创造力' },
    { key: 'lp', label: '学习感知' },
    { key: 're', label: '资源延续' },
    { key: 'ce', label: '课程进化' },
    { key: 'oe', label: '综合投入度' },
  ];

  // 计算平均改善
  const avgImprovement = dimensions.map(d => {
    const avgPre = interventions.reduce((s, i) => s + (i.pre as any)[d.key], 0) / interventions.length;
    const avgPost = interventions.reduce((s, i) => s + (i.post as any)[d.key], 0) / interventions.length;
    return {
      key: d.key,
      label: d.label,
      pre: Math.round(avgPre),
      post: Math.round(avgPost),
      improvement: Math.round(avgPost - avgPre),
    };
  });

  // 整体有效性评分
  const overallAvg = avgImprovement.reduce((s, d) => s + d.improvement, 0) / avgImprovement.length;
  const effectivenessScore = Math.min(100, Math.round(60 + overallAvg * 0.6));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">干预有效性评估</h2>
        <p className="text-sm text-slate-500 mt-1">教学策略调整前 vs 调整后 — 验证人机协同干预的有效性</p>
      </div>

      {/* 整体有效性评分 */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80 mb-1">人机协同干预整体有效性评分</p>
            <p className="text-5xl font-bold">{effectivenessScore}<span className="text-2xl">/100</span></p>
            <p className="text-sm opacity-70 mt-2">基于 {interventions.length} 次教学干预的综合评估</p>
          </div>
          <div className="text-right">
            <CheckCircle size={48} className="opacity-50" />
            <p className="text-sm mt-2 opacity-70">成效显著</p>
          </div>
        </div>
      </div>

      {/* 双柱状图：Pre vs Post 对比 */}
      <CardChart
        title="五维指标干预前后对比（平均）"
        option={{
          tooltip: { trigger: 'axis' as const, axisPointer: { type: 'shadow' as const } },
          legend: { data: ['干预前', '干预后', '改善幅度'], bottom: 0 },
          xAxis: {
            type: 'category' as const,
            data: avgImprovement.map(d => d.label),
          },
          yAxis: [
            { type: 'value' as const, min: 0, max: 100, axisLabel: { formatter: '{value}分' } },
            { type: 'value' as const, min: 0, max: 40, axisLabel: { formatter: '+{value}' }, name: '改善' },
          ],
          series: [
            {
              name: '干预前', type: 'bar' as const, barGap: '0',
              data: avgImprovement.map(d => d.pre),
              itemStyle: { color: '#94a3b8', borderRadius: [4, 4, 0, 0] },
            },
            {
              name: '干预后', type: 'bar' as const,
              data: avgImprovement.map(d => d.post),
              itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
            },
            {
              name: '改善幅度', type: 'line' as const, yAxisIndex: 1,
              data: avgImprovement.map(d => d.improvement),
              smooth: true, itemStyle: { color: '#10b981' },
              lineStyle: { width: 3 },
              areaStyle: { color: 'rgba(16, 185, 129, 0.2)' },
            },
          ],
          grid: { left: 60, right: 60, top: 20, bottom: 60 },
        }}
        height={380}
      />

      {/* 各干预详细对比 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {interventions.map((intv) => {
          const improvements: number[] = [];
          dimensions.forEach(d => { improvements.push((intv.post as any)[d.key] - (intv.pre as any)[d.key]); });
          const avgImp = Math.round(improvements.reduce((a, b) => a + b, 0) / improvements.length);

          return (
            <div key={intv.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={18} className="text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{intv.type}</p>
                  <p className="text-xs text-slate-500">{intv.description}</p>
                </div>
              </div>

              {/* 指标对比 */}
              <div className="space-y-2">
                {dimensions.map(d => {
                  const imp = (intv.post as any)[d.key] - (intv.pre as any)[d.key];
                  const prePct = ((intv.pre as any)[d.key] / 100) * 100;
                  const postPct = ((intv.post as any)[d.key] / 100) * 100;
                  return (
                    <div key={d.key} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-16">{d.label}</span>
                      <div className="flex-1 flex items-center gap-1">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 relative">
                          <div className="absolute left-0 top-0 h-2 rounded-full bg-slate-400" style={{ width: `${prePct}%` }} />
                          <div className="absolute top-0 h-2 rounded-full bg-blue-500" style={{ width: `${postPct - prePct}%`, left: `${prePct}%` }} />
                        </div>
                        <span className={`text-xs font-bold w-8 text-right ${imp > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {imp > 0 ? '+' : ''}{imp}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">平均改善</span>
                <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                  <TrendingUp size={14} /> +{avgImp} 分
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 干预有效性总结 */}
      <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5">
        <h3 className="text-base font-semibold text-emerald-800 mb-3 flex items-center gap-2">
          <CheckCircle size={18} />
          干预有效性总结
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {avgImprovement.map(d => (
            <div key={d.key} className="bg-white rounded-lg p-4 border border-emerald-100">
              <p className="text-sm font-medium text-slate-700">{d.label}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-slate-400">前: {d.pre}</span>
                <ArrowRight size={12} className="text-slate-300" />
                <span className="text-xs text-slate-400">后: {d.post}</span>
              </div>
              <p className="text-lg font-bold text-emerald-600 mt-1">+{d.improvement} 分</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-emerald-700 mt-4">
          经人机协同干预后，课程生命力五维指标平均提升 {Math.round(overallAvg)} 分，
          综合有效性评分 {effectivenessScore}/100，验证了"数据采集→学习分析→教学决策→课程优化"闭环机制的有效性。
        </p>
      </div>
    </div>
  );
}
