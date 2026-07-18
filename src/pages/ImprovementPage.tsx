// ===== 持续改进闭环页面（CQI：Course Quality Improvement） =====
// 核心概念：数据感知 → 智能诊断 → 协同决策 → 课程优化 → 反馈迭代
// 目标：用多模态数据把"学生学的状态"、"老师教的状态"、"平台资源质量"、"教学互动方式"联动起来，实现课程持续改进
import { useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import CardChart from '../components/CardChart';
import { ArrowRight, Zap, Brain, Users, Settings, RefreshCw, TrendingUp, BookOpen, AlertTriangle } from 'lucide-react';

// CQI 闭环步骤
const cqSteps = [
  { icon: Zap, label: '数据感知', desc: '采集多模态学习数据（学/教/资源/互动）', color: 'bg-blue-500' },
  { icon: Brain, label: '智能诊断', desc: '分析课程四维状态与问题', color: 'bg-purple-500' },
  { icon: Users, label: '协同决策', desc: 'AI+教师共同制定改进方案', color: 'bg-emerald-500' },
  { icon: Settings, label: '课程优化', desc: '实施教学调整与资源更新', color: 'bg-orange-500' },
  { icon: RefreshCw, label: '反馈迭代', desc: '评估改进效果并持续优化', color: 'bg-pink-500' },
];

// 课程四维改进证据
const dimensionEvidence = [
  {
    label: '学生学的状态',
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    borderColor: 'border-blue-200',
    metric: '视频专注度',
    trend: 'up',
    value: '+12%',
    detail: '第 6 周增加互动环节后，视频专注度从 52 分提升至 64 分',
  },
  {
    label: '老师教的状态',
    icon: BookOpen,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    metric: '讲授语速',
    trend: 'up',
    value: '+8%',
    detail: '第 4 周调整教学节奏后，语速适中比例从 60% 提升至 68%',
  },
  {
    label: '平台资源质量',
    icon: TrendingUp,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    borderColor: 'border-purple-200',
    metric: '课件完播率',
    trend: 'up',
    value: '+15%',
    detail: '第 10 周补充风格案例资源后，完播率从 52% 提升至 67%',
  },
  {
    label: '教学互动方式',
    icon: RefreshCw,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    borderColor: 'border-amber-200',
    metric: '小组讨论活跃度',
    trend: 'up',
    value: '+22%',
    detail: '第 7 周异质分组后，小组讨论热度从 55 分提升至 77 分',
  },
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

  const scores = vitalityScores || [];
  const suggs = suggestions || [];
  const recs = records || [];

  const accepted = suggs.filter(s => s.status === 'accepted').length;
  const rejected = suggs.filter(s => s.status === 'rejected').length;
  const modified = suggs.filter(s => s.status === 'modified').length;

  // 计算课程四维改进证据的总分
  const totalImprovement = dimensionEvidence.reduce((sum, d) => {
    const num = parseFloat(d.value.replace('+', ''));
    return sum + num;
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">持续改进闭环（CQI）</h2>
        <p className="text-sm text-slate-500 mt-1">数据感知 → 智能诊断 → 协同决策 → 课程优化 → 反馈迭代 — 基于多模态数据联动的课程持续改进机制</p>
      </div>

      {/* CQI 闭环流程图 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-6">课程持续改进闭环流程</h3>
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
          {cqSteps.map((step, i) => {
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
                {i < cqSteps.length - 1 && (
                  <ArrowRight size={20} className="text-slate-300 mx-1 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 课程四维改进证据 */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-600" />
          课程四维改进证据（第 3-16 周）
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dimensionEvidence.map((dim, i) => (
            <div key={i} className={`bg-white rounded-xl border ${dim.borderColor} p-4 shadow-sm`}>
              <div className={`flex items-center gap-2 mb-3 ${dim.bg} p-2 rounded-lg`}>
                <dim.icon size={16} className={dim.color} />
                <span className="text-sm font-semibold text-slate-700">{dim.label}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">{dim.metric}</span>
                <span className="text-sm font-bold text-emerald-600">{dim.value}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{dim.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">四维综合改进幅度</span>
          <span className="text-lg font-bold text-blue-600">+{totalImprovement}%</span>
        </div>
      </div>

      {/* 改进统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-emerald-600">{accepted}</p>
          <p className="text-sm text-slate-500 mt-1">已采纳课程改进方案</p>
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
          <p className="text-3xl font-bold text-purple-600">{recs.length}</p>
          <p className="text-sm text-slate-500 mt-1">多模态数据记录</p>
        </div>
      </div>

      {/* 生命力改进效果对比 */}
      {scores.length > 0 ? (
        <CardChart
          title="课程状态优化效果对比（期初 vs 期末）"
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
                data: [scores[0].classroomVitality, scores[0].creativity, scores[0].learningPerception, scores[0].resourceExtension, scores[0].courseEvolution],
                itemStyle: { color: '#94a3b8', borderRadius: [4, 4, 0, 0] },
              },
              {
                name: '期末', type: 'bar' as const,
                data: [
                  scores[scores.length - 1].classroomVitality,
                  scores[scores.length - 1].creativity,
                  scores[scores.length - 1].learningPerception,
                  scores[scores.length - 1].resourceExtension,
                  scores[scores.length - 1].courseEvolution,
                ],
                itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
              },
            ],
            grid: { left: 60, right: 20, top: 20, bottom: 60 },
          }}
          height={300}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 flex items-center justify-center">
          <p className="text-sm text-slate-400">暂无生命力数据</p>
        </div>
      )}

      {/* 改进时间线 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-base font-semibold text-slate-800 mb-4">课程优化历史时间线</h3>
        <div className="space-y-4">
          {suggs.filter(s => s.status !== 'pending').map(sug => (
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
                <p className="text-xs text-slate-600 mb-1">{sug.description}</p>
                {sug.teacherDecision && (
                  <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                    <AlertTriangle size={12} className="text-emerald-500 flex-shrink-0" />
                    <p className="text-xs text-emerald-700">实施措施：{sug.teacherDecision}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {suggs.filter(s => s.status !== 'pending').length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">暂无改进记录</p>
          )}
        </div>
      </div>
    </div>
  );
}
