// ===== 数据融合页面 =====
import { useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import CardChart from '../components/CardChart';

export default function FusionPage() {
  const { records, courseInfo, weeklyAggregates, loading, fetchData } = useStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="mt-3 text-sm text-slate-500">数据融合计算中...</p>
        </div>
      </div>
    );
  }

  // 计算各模块的数据融合进度
  const moduleProgress = courseInfo?.modules.map(mod => {
    const modRecords = records.filter(r => r.moduleId === mod.id);
    const expectedRecords = 30 * 16 * 3; // 30学生 × 16周 × 3条/周
    const progress = Math.min(100, Math.round((modRecords.length / (expectedRecords / 4)) * 100));

    // 各类型占比
    const typeCounts = { behavior: 0, process: 0, outcome: 0, evaluation: 0, feedback: 0 };
    modRecords.forEach(r => { typeCounts[r.type]++; });

    return { ...mod, recordCount: modRecords.length, progress, typeCounts };
  });

  // 课程目标达成度
  const objectiveAchievement = courseInfo?.objectives.map(obj => {
    const objRecords = records.filter(r => r.objectiveId === obj.id);
    const avgScore = objRecords.length > 0
      ? Math.round(objRecords.reduce((s, r) => s + r.value, 0) / objRecords.length)
      : 0;
    const achievement = Math.min(100, Math.round((avgScore / obj.targetScore) * 100));
    return { ...obj, avgScore, achievement };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">数据融合</h2>
        <p className="text-sm text-slate-500 mt-1">多模态课程数据融合与课程状态表征模型 — 将异构数据转化为结构化课程状态信息</p>
      </div>

      {/* 模块融合进度 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-base font-semibold text-slate-800 mb-4">各模块数据融合进度</h3>
        <div className="space-y-4">
          {moduleProgress?.map(mod => (
            <div key={mod.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">{mod.name}</span>
                <span className="text-sm text-slate-500">{mod.recordCount} 条记录 · {mod.progress}%</span>
              </div>
              <div className="bg-slate-100 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${mod.progress}%` }}
                />
              </div>
              {/* 各类型数据占比 */}
              <div className="flex gap-1 mt-2">
                {Object.entries(mod.typeCounts).map(([type, count]) => {
                  const colors: Record<string, string> = {
                    behavior: 'bg-blue-400', process: 'bg-emerald-400', outcome: 'bg-purple-400',
                    evaluation: 'bg-orange-400', feedback: 'bg-pink-400',
                  };
                  return count > 0 ? (
                    <div key={type} className={`h-1.5 rounded ${colors[type]} flex-1`} title={`${type}: ${count}`} />
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 课程目标达成度 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-4">课程目标达成度</h3>
          <div className="space-y-3">
            {objectiveAchievement?.map(obj => (
              <div key={obj.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm text-slate-700">{obj.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          obj.achievement >= 90 ? 'bg-emerald-500' : obj.achievement >= 70 ? 'bg-blue-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${obj.achievement}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600 w-12 text-right">{obj.achievement}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 数据融合雷达图 */}
        <CardChart
          title="五类数据融合分布"
          option={{
            tooltip: {},
            radar: {
              indicator: [
                { name: '学习行为', max: 100 },
                { name: '学习过程', max: 100 },
                { name: '学习成果', max: 100 },
                { name: '教师评价', max: 100 },
                { name: '课程反馈', max: 100 },
              ],
              shape: 'polygon',
              splitNumber: 4,
            },
            series: [{
              type: 'radar' as const,
              data: [{
                value: weeklyAggregates.length > 0 ? [
                  Math.round(weeklyAggregates.reduce((s, w) => s + (w.averages?.behavior || 0), 0) / Math.max(weeklyAggregates.length, 1)),
                  Math.round(weeklyAggregates.reduce((s, w) => s + (w.averages?.process || 0), 0) / Math.max(weeklyAggregates.length, 1)),
                  Math.round(weeklyAggregates.reduce((s, w) => s + (w.averages?.outcome || 0), 0) / Math.max(weeklyAggregates.length, 1)),
                  Math.round(weeklyAggregates.reduce((s, w) => s + (w.averages?.evaluation || 0), 0) / Math.max(weeklyAggregates.length, 1)),
                  Math.round(weeklyAggregates.reduce((s, w) => s + (w.averages?.feedback || 0), 0) / Math.max(weeklyAggregates.length, 1)),
                ] : [70, 75, 72, 68, 74],
                name: '平均得分',
                areaStyle: { opacity: 0.3 },
                itemStyle: { color: '#3b82f6' },
                lineStyle: { color: '#3b82f6' },
              }],
            }],
          }}
          height={300}
        />
      </div>
    </div>
  );
}
