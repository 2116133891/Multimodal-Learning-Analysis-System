// ===== 持续改进闭环页面 =====
import { useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import CardChart from '../components/CardChart';
import { ArrowRight, Zap, Brain, Users, Settings, RefreshCw } from 'lucide-react';

const steps = [
  { icon: Zap, label: '数据感知', desc: '采集多模态学习数据', color: 'bg-blue-500' },
  { icon: Brain, label: '智能诊断', desc: '分析课程状态与问题', color: 'bg-purple-500' },
  { icon: Users, label: '协同决策', desc: 'AI+教师共同决策', color: 'bg-emerald-500' },
  { icon: Settings, label: '课程优化', desc: '实施教学调整', color: 'bg-orange-500' },
  { icon: RefreshCw, label: '反馈迭代', desc: '评估改进效果', color: 'bg-pink-500' },
];

export default function ImprovementPage() {
  const { vitalityScores, suggestions, records, loading, fetchData } = useStore();

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

  // 按阶段统计
  const accepted = suggestions.filter(s => s.status === 'accepted').length;
  const rejected = suggestions.filter(s => s.status === 'rejected').length;
  const modified = suggestions.filter(s => s.status === 'modified').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">持续改进闭环</h2>
        <p className="text-sm text-slate-500 mt-1">数据感知→智能诊断→协同决策→课程优化→反馈迭代 — 推动课程由一次性优化向持续演化转变</p>
      </div>

      {/* 闭环流程图 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-6">持续改进闭环流程</h3>
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-200 min-w-[120px]">
                  <div className={`w-10 h-10 ${step.color} rounded-lg flex items-center justify-center text-white mb-2`}>
                    <Icon size={20} />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{step.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight size={20} className="text-slate-300 mx-1 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 改进统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-emerald-600">{accepted}</p>
          <p className="text-sm text-slate-500 mt-1">已采纳建议</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-red-500">{rejected}</p>
          <p className="text-sm text-slate-500 mt-1">已拒绝</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-blue-600">{modified}</p>
          <p className="text-sm text-slate-500 mt-1">修改后采纳</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-purple-600">{records.length}</p>
          <p className="text-sm text-slate-500 mt-1">总数据记录</p>
        </div>
      </div>

      {/* 生命力改进效果对比 */}
      <CardChart
        title="生命力改进效果对比（期初 vs 期末）"
        option={{
          tooltip: { trigger: 'axis' as const, axisPointer: { type: 'shadow' as const } },
          legend: { data: ['期初', '期末'], bottom: 0 },
          xAxis: {
            type: 'category' as const,
            data: ['课堂活力', '创造力培养', '学习感知', '资源延续', '课程进化'],
          },
          yAxis: { type: 'value' as const, min: 0, max: 100, axisLabel: { formatter: '{value}分' } },
          series: [
            {
              name: '期初', type: 'bar' as const, barGap: '0',
              data: vitalityScores.map(v => [v.classroomVitality, v.creativity, v.learningPerception, v.resourceExtension, v.courseEvolution])[0],
              itemStyle: { color: '#94a3b8', borderRadius: [4, 4, 0, 0] },
            },
            {
              name: '期末', type: 'bar' as const,
              data: [
                vitalityScores[vitalityScores.length - 1].classroomVitality,
                vitalityScores[vitalityScores.length - 1].creativity,
                vitalityScores[vitalityScores.length - 1].learningPerception,
                vitalityScores[vitalityScores.length - 1].resourceExtension,
                vitalityScores[vitalityScores.length - 1].courseEvolution,
              ],
              itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
            },
          ],
          grid: { left: 60, right: 20, top: 20, bottom: 60 },
        }}
        height={300}
      />

      {/* 改进时间线 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-base font-semibold text-slate-800 mb-4">优化历史时间线</h3>
        <div className="space-y-4">
          {suggestions.filter(s => s.status !== 'pending').map(sug => (
            <div key={sug.id} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${
                  sug.status === 'accepted' ? 'bg-emerald-500' : sug.status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                }`} />
                <div className="w-0.5 h-full bg-slate-200 min-h-[40px]" />
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-700">{sug.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    sug.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                    sug.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {sug.status === 'accepted' ? '已采纳' : sug.status === 'rejected' ? '已拒绝' : '修改后采纳'}
                  </span>
                  <span className="text-xs text-slate-400">第{sug.week}周</span>
                </div>
                {sug.teacherDecision && (
                  <p className="text-xs text-slate-500">{sug.teacherDecision}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
