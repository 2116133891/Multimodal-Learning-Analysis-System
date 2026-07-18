// ===== 课程画像详情页面（纯课程中心视角 · 五维画像） =====
// 核心概念：不再以学生为切入点，直接展示"课程"的五维画像
// 五维：学生学的状态 · 老师教的状态 · 平台资源质量 · 教学互动方式 · 教学方法适配
import { useEffect, useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import RechartsCard from '../components/RechartsCard';
import {
  Brain, AlertCircle, Lightbulb, TrendingUp,
  Activity, Film, MousePointer2, BookOpen, Mic, MessageSquare,
  Target, Repeat2, Users, Eye,
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, Tooltip as RTooltip, Legend as RLegend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import type { TeachingMethod } from '../types';

// ── 学术配色 ──────────────────────────────────────────────
const COLORS = {
  learning: '#2563eb',       // 学生学的状态 — 科技蓝
  teaching: '#059669',       // 老师教的状态 — 护眼绿
  resource: '#7c3aed',       // 平台资源质量 — 紫罗兰
  interaction: '#d97706',    // 教学互动方式 — 琥珀橙
  method: '#0891b2',         // 教学方法适配 — 青色
  slate: '#475569',
};

// 五维雷达标签
const FIVE_DIM_LABELS = ['学生学的状态', '老师教的状态', '平台资源质量', '教学互动方式', '教学方法适配'];

// 教学方法指标
const teachingMethodLabels: Record<keyof TeachingMethod, string> = {
  caseTeachingScore: '案例教学',
  flippedClassScore: '翻转课堂',
  projectBasedScore: '项目驱动',
  scaffoldedLearningScore: '支架式教学',
  cooperativeLearningScore: '合作学习',
  inquiryBasedScore: '探究式学习',
  differentiationScore: '差异化教学',
  formativeAssessmentScore: '形成性评价',
};

export default function CourseProfilePage() {
  const { courseProfiles, vitalityScores, records, fetchData, courseInfo } = useStore();
  const [selectedWeek, setSelectedWeek] = useState(16);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── 课程五维雷达图数据 ──────────────────────────────────
  const fiveDimRadarData = useMemo(() => {
    const profile = courseProfiles?.[selectedWeek - 1];
    if (!profile) return [];

    // 学生学的状态 ≈ 情绪投入
    const learningScore = profile.dimension.teachingState.emotionalEngagement;
    // 老师教的状态
    const teachingScore = profile.dimension.teachingState.teachingPace;
    // 平台资源质量
    const resourceScore = profile.dimension.resourceUtilization.slideCompletionRate;
    // 教学互动方式
    const interactionScore = profile.dimension.interactionMethod.groupDiscussionHeat;
    // 教学方法适配（教学方法维度的平均）
    const methodAvg = profile.dimension.teachingMethod
      ? Object.values(profile.dimension.teachingMethod as TeachingMethod).reduce((s, v) => s + v, 0) / 8
      : 60;

    return FIVE_DIM_LABELS.map((label, i) => {
      const values = [learningScore, teachingScore, resourceScore, interactionScore, methodAvg];
      return { subject: label, value: Math.round(values[i]), fullMark: 100 };
    });
  }, [courseProfiles, selectedWeek]);

  // ── 教学方法雷达图数据 ──────────────────────────────────
  const methodRadarData = useMemo(() => {
    const profile = courseProfiles?.[selectedWeek - 1];
    if (!profile?.dimension.teachingMethod) return [];

    return Object.entries(profile.dimension.teachingMethod as TeachingMethod).map(([key, value]) => ({
      method: teachingMethodLabels[key as keyof TeachingMethod],
      value,
      fullMark: 100,
    }));
  }, [courseProfiles, selectedWeek]);

  // ── 课程生命力趋势 ──────────────────────────────────────
  const vitalityTrendData = useMemo(() => {
    if (!vitalityScores?.length) return [];
    return vitalityScores.slice(0, selectedWeek).map(v => ({
      week: `第${v.week}周`,
      overall: v.overall,
      vitality: v.classroomVitality,
      creativity: v.creativity,
      evolution: v.courseEvolution,
    }));
  }, [vitalityScores, selectedWeek]);

  // ── OBE 目标达成趋势 ────────────────────────────────────
  const obeTrendData = useMemo(() => {
    if (!courseInfo?.objectives) return [];
    return Array.from({ length: 16 }, (_, i) => {
      const week = i + 1;
      const objs = courseInfo.objectives.map(obj => {
        const recs = records.filter(r => r.objectiveId === obj.id && r.week <= week);
        const avg = recs.length > 0 ? Math.round(recs.reduce((s, r) => s + r.value, 0) / recs.length) : 0;
        return Math.min(100, Math.round((avg / obj.targetScore) * 100));
      });
      return {
        week: `第${week}周`,
        avgAchievement: Math.round(objs.reduce((s, v) => s + v, 0) / objs.length),
      };
    });
  }, [courseInfo, records, selectedWeek]);

  // ── 当前周课程画像 ──────────────────────────────────────
  const currentProfile = courseProfiles?.[selectedWeek - 1];
  const vitalityScore = vitalityScores[selectedWeek - 1];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">课程画像详情</h2>
          <p className="text-sm text-slate-500 mt-1">纯课程中心视角 · 五维多模态画像 · 基于多模态数据联动的课程持续改进（CQI）</p>
        </div>
        <select
          value={selectedWeek}
          onChange={e => setSelectedWeek(Number(e.target.value))}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
        >
          {Array.from({ length: 16 }, (_, i) => (
            <option key={i + 1} value={i + 1}>第{i + 1}周</option>
          ))}
        </select>
      </div>

      {/* ── 课程基本信息卡片 ──────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Brain size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{courseInfo?.name}</h3>
            <p className="text-sm text-slate-500">{courseInfo?.type} · {courseInfo?.semester} · 授课教师：{courseInfo?.instructor}</p>
          </div>
        </div>
        <div className="flex items-center gap-6 ml-auto">
          <div className="text-center">
            <p className="text-xs text-slate-400">综合健康度</p>
            <p className="text-2xl font-bold text-blue-600">{currentProfile?.overallHealth ?? 0}<span className="text-xs text-slate-400">/100</span></p>
            <p className="text-xs font-bold text-slate-500">等级 {currentProfile?.healthGrade ?? '-'}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400">OBE 达成率</p>
            <p className="text-2xl font-bold text-emerald-600">{obeTrendData[selectedWeek - 1]?.avgAchievement ?? 0}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400">生命力</p>
            <p className="text-2xl font-bold text-purple-600">{vitalityScore?.overall ?? 0}<span className="text-xs text-slate-400">/100</span></p>
          </div>
        </div>
      </div>

      {/* ── 第一行：五维雷达 + 教学方法雷达 ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RechartsCard title="课程五维雷达图">
          <div className="w-full h-87.5">
            <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={fiveDimRadarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: COLORS.slate, fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
              <Radar name="课程画像" dataKey="value" stroke={COLORS.learning} strokeWidth={2.5} fill={COLORS.learning} fillOpacity={0.2} />
              <RTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
              <RLegend wrapperStyle={{ marginTop: '12px', fontSize: '13px' }} />
            </RadarChart>
            </ResponsiveContainer>
          </div>
        </RechartsCard>

        <RechartsCard title="教学方法适配度雷达">
          <div className="w-full h-87.5">
            <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={methodRadarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="method" tick={{ fill: COLORS.slate, fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} />
              <Radar name="教学方法" dataKey="value" stroke={COLORS.method} strokeWidth={2.5} fill={COLORS.method} fillOpacity={0.2} />
              <RTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <RLegend wrapperStyle={{ marginTop: '8px', fontSize: '12px' }} />
            </RadarChart>
            </ResponsiveContainer>
          </div>
        </RechartsCard>
      </div>

      {/* ── 第二行：生命力趋势 + OBE 达成趋势 ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RechartsCard title="课程生命力趋势（至第{selectedWeek}周）">
          <div className="w-full h-87.5">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={vitalityTrendData} margin={{ top: 10, right: 30, left: 20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fill: COLORS.slate, fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis domain={[30, 100]} tick={{ fill: COLORS.slate, fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} />
              <RTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <RLegend wrapperStyle={{ fontSize: '12px', marginTop: '8px' }} />
              <Line type="monotone" dataKey="overall" name="综合生命力" stroke={COLORS.learning} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="vitality" name="课堂活力" stroke={COLORS.teaching} strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="creativity" name="创造力" stroke={COLORS.resource} strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="evolution" name="课程进化" stroke={COLORS.method} strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
            </ResponsiveContainer>
          </div>
        </RechartsCard>

        <RechartsCard title="OBE 目标达成趋势">
          <div className="w-full h-87.5">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={obeTrendData} margin={{ top: 10, right: 30, left: 20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fill: COLORS.slate, fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis domain={[0, 100]} tick={{ fill: COLORS.slate, fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} />
              <RTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Line type="monotone" dataKey="avgAchievement" name="平均达成率" stroke={COLORS.teaching} strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="avgAchievement" name="目标线" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5 5" data={obeTrendData.map(() => 80)} />
            </LineChart>
            </ResponsiveContainer>
          </div>
        </RechartsCard>
      </div>

      {/* ── 第三行：五维指标详情 + 风险/改善信号 ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 五维指标详情 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Target size={18} className="text-blue-600" />
            五维指标详情（第{selectedWeek}周）
          </h3>
          <div className="space-y-3">
            {/* 学生学的状态 */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye size={14} className="text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">学生学的状态</span>
                <span className="ml-auto text-sm font-bold text-blue-700">{currentProfile?.dimension.teachingState.emotionalEngagement}分</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-slate-500">视频专注：</span><span className="font-bold text-blue-700">{currentProfile?.dimension.teachingState.emotionalEngagement}分</span></div>
                <div><span className="text-slate-500">情绪饱满：</span><span className="font-bold text-blue-700">{currentProfile?.dimension.teachingState.emotionalEngagement}分</span></div>
              </div>
            </div>
            {/* 老师教的状态 */}
            <div className="p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Mic size={14} className="text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-800">老师教的状态</span>
                <span className="ml-auto text-sm font-bold text-emerald-700">{currentProfile?.dimension.teachingState.teachingPace}分</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-slate-500">讲授语速：</span><span className="font-bold text-emerald-700">{currentProfile?.dimension.teachingState.teachingPace}分</span></div>
                <div><span className="text-slate-500">提问频次：</span><span className="font-bold text-emerald-700">{currentProfile?.dimension.teachingState.questionRate}次/节</span></div>
              </div>
            </div>
            {/* 平台资源质量 */}
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={14} className="text-purple-600" />
                <span className="text-sm font-semibold text-purple-800">平台资源质量</span>
                <span className="ml-auto text-sm font-bold text-purple-700">{currentProfile?.dimension.resourceUtilization.slideCompletionRate}分</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-slate-500">课件完播：</span><span className="font-bold text-purple-700">{currentProfile?.dimension.resourceUtilization.slideCompletionRate}%</span></div>
                <div><span className="text-slate-500">视频深度：</span><span className="font-bold text-purple-700">{currentProfile?.dimension.resourceUtilization.videoWatchDepth}%</span></div>
              </div>
            </div>
            {/* 教学互动方式 */}
            <div className="p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={14} className="text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">教学互动方式</span>
                <span className="ml-auto text-sm font-bold text-amber-700">{currentProfile?.dimension.interactionMethod.groupDiscussionHeat}分</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-slate-500">小组讨论：</span><span className="font-bold text-amber-700">{currentProfile?.dimension.interactionMethod.groupDiscussionHeat}分</span></div>
                <div><span className="text-slate-500">翻转课堂：</span><span className="font-bold text-amber-700">{currentProfile?.dimension.interactionMethod.flipClassParticipation}%</span></div>
              </div>
            </div>
            {/* 教学方法适配 */}
            <div className="p-3 bg-cyan-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={14} className="text-cyan-600" />
                <span className="text-sm font-semibold text-cyan-800">教学方法适配</span>
                <span className="ml-auto text-sm font-bold text-cyan-700">
                  {currentProfile?.dimension.teachingMethod
                    ? Math.round(Object.values(currentProfile.dimension.teachingMethod as TeachingMethod).reduce((s, v) => s + v, 0) / 8)
                    : 0}分
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-slate-500">案例教学：</span><span className="font-bold text-cyan-700">{currentProfile?.dimension.teachingMethod?.caseTeachingScore ?? 0}分</span></div>
                <div><span className="text-slate-500">翻转课堂：</span><span className="font-bold text-cyan-700">{currentProfile?.dimension.teachingMethod?.flippedClassScore ?? 0}分</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* 风险/改善信号 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-red-500" />
            风险与改善信号
          </h3>
          <div className="space-y-4">
            {/* 风险标签 */}
            <div>
              <p className="text-xs font-semibold text-red-600 mb-2 flex items-center gap-1">
                <TrendingUp size={12} className="rotate-180" /> 风险项
              </p>
              <div className="space-y-1.5">
                {(currentProfile?.riskFlags || []).length > 0 ? (
                  currentProfile.riskFlags.map((flag, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg border border-red-100">
                      <AlertCircle size={12} className="text-red-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-700 leading-relaxed">{flag}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-emerald-500">当前无风险项</p>
                )}
              </div>
            </div>
            {/* 改善信号 */}
            <div>
              <p className="text-xs font-semibold text-emerald-600 mb-2 flex items-center gap-1">
                <TrendingUp size={12} /> 改善信号
              </p>
              <div className="space-y-1.5">
                {(currentProfile?.improvementSignals || []).length > 0 ? (
                  currentProfile.improvementSignals.map((sig, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                      <TrendingUp size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-emerald-700 leading-relaxed">{sig}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">暂无显著改善信号</p>
                )}
              </div>
            </div>
            {/* PDCA 阶段 */}
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                <Repeat2 size={12} /> 当前 PDCA 阶段
              </p>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  currentProfile?.pdcaStage === 'plan' ? 'bg-blue-100 text-blue-700' :
                  currentProfile?.pdcaStage === 'do' ? 'bg-emerald-100 text-emerald-700' :
                  currentProfile?.pdcaStage === 'check' ? 'bg-amber-100 text-amber-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {currentProfile?.pdcaStage?.toUpperCase()} 阶段
                </div>
                <span className="text-xs text-slate-400">第{selectedWeek}周</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
