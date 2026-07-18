// ===== 数据融合页面（课程中心视角：五维多模态数据融合） =====
// 核心概念：用多模态数据把"学生学的状态"、"老师教的状态"、"平台资源质量"、"教学互动方式"、"教学方法适配"联动融合
// 增强：第五维度（教学方法）+ OBE 目标达成追踪 + PDCA 循环标识
import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../hooks/useStore';
import RechartsCard from '../components/RechartsCard';
import {
  GitMerge,
  Clock,
  Loader2,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, Legend as RLegend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, AreaChart, Area, ResponsiveContainer,
} from 'recharts';

// ── 学术配色 ──────────────────────────────────────────────
const COLORS = {
  learning: '#2563eb',       // 科技蓝 — 学生学的状态
  teaching: '#059669',       // 护眼绿 — 老师教的状态
  resource: '#7c3aed',       // 紫罗兰 — 平台资源质量
  interaction: '#d97706',    // 琥珀橙 — 教学互动方式
  early: '#dc2626',          // 警示红 — 早融合
  late: '#4f46e5',           // 靛蓝 — 晚融合
  accent: '#8b5cf6',         // 紫色 — 情绪值
  slate: '#475569',
};

const modalityLabels: Record<string, string> = {
  video_emotion: '教学状态监测',
  text_semantic: '平台资源质量',
  interaction_behavior: '师生互动深度',
  traditional_data: '传统学习数据',
};

export default function FusionPage() {
  const { records, multimodalFeatures, courseInfo, fetchData, fusionWeights, setFusionWeights, resetFusionWeights } = useStore();
  const [selectedWeek, setSelectedWeek] = useState(8);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const [tsLoading, setTsLoading] = useState(false);
  const [sliderValues, setSliderValues] = useState({
    teaching: fusionWeights.teaching,
    resource: fusionWeights.resource,
    interaction: fusionWeights.interaction,
    learning: fusionWeights.learning,
  });

  useEffect(() => { fetchData(); }, [fetchData]);

  // 同步 store 中的权重到滑块
  useEffect(() => {
    setSliderValues({
      teaching: fusionWeights.teaching,
      resource: fusionWeights.resource,
      interaction: fusionWeights.interaction,
      learning: fusionWeights.learning,
    });
  }, [fusionWeights]);

  const handleSliderChange = (key: keyof typeof sliderValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSliderValues(prev => ({ ...prev, [key]: val }));
  };

  const handleSaveWeights = () => {
    setFusionWeights(sliderValues);
  };

  // ── 加载选中周的聚合时序数据（课程级） ──────────────────
  useEffect(() => {
    setTsLoading(true);

    const mockTS = {
      studentId: 'course-aggregate',
      week: selectedWeek,
      moduleId: selectedWeek <= 4 ? 'm1' : selectedWeek <= 8 ? 'm2' : selectedWeek <= 12 ? 'm3' : 'm4',
      points: Array.from({ length: 10 }, (_, i) => {
        const tMid = (i + 0.5) * 4.5;
        const baseFocus = 0.5 + Math.sin(tMid * 0.15) * 0.2;
        const baseInteraction = 5 + Math.floor(Math.random() * 8);
        return {
          timestamp: `T${Math.round(tMid)}m`,
          videoEmotion: Math.min(1, Math.max(0, baseFocus + (Math.random() - 0.5) * 0.1)),
          textSentiment: Math.min(1, Math.max(0, 0.5 + (Math.random() - 0.5) * 0.2)),
          interactionCount: baseInteraction,
        };
      }),
      fusionEngagementScore: Array.from({ length: 10 }, () => Math.floor(50 + Math.random() * 40)),
      summary: {
        avgVideoEmotion: 0.65,
        avgTextSentiment: 0.55,
        totalInteractions: 42,
        engagementTrend: 'stable' as const,
      },
    };
    setTimeSeriesData([mockTS]);
    setTsLoading(false);
  }, [selectedWeek]);

  // ── 四维指标按周统计 ──────────────────────────────────────
  const weeklyFourDimensions = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => {
      const week = i + 1;
      const weekFeatures = multimodalFeatures.filter(f => f.week === week);
      if (weekFeatures.length === 0) return { week: `第${week}周`, learning: 0, teaching: 0, resource: 0, interaction: 0 };

      const learningScores = weekFeatures.flatMap(f => f.modalityFeatures.filter(m => m.modality === 'video_emotion').map(m => m.score));
      const teachingScores = weekFeatures.flatMap(f => f.modalityFeatures.filter(m => m.modality === 'text_semantic').map(m => m.score));
      const resourceScores = weekFeatures.flatMap(f => f.modalityFeatures.filter(m => m.modality === 'traditional_data').map(m => m.score));
      const interactionScores = weekFeatures.flatMap(f => f.modalityFeatures.filter(m => m.modality === 'interaction_behavior').map(m => m.score));

      return {
        week: `第${week}周`,
        learning: learningScores.length > 0 ? Math.round(learningScores.reduce((a, b) => a + b, 0) / learningScores.length) : 0,
        teaching: teachingScores.length > 0 ? Math.round(teachingScores.reduce((a, b) => a + b, 0) / teachingScores.length) : 0,
        resource: resourceScores.length > 0 ? Math.round(resourceScores.reduce((a, b) => a + b, 0) / resourceScores.length) : 0,
        interaction: interactionScores.length > 0 ? Math.round(interactionScores.reduce((a, b) => a + b, 0) / interactionScores.length) : 0,
      };
    });
  }, [multimodalFeatures]);

  // ── 选中周的融合特征详情 ────────────────────────────────
  const selectedFeatures = multimodalFeatures.filter(f => f.week === selectedWeek);
  const avgEarlyFusion = selectedFeatures.length > 0
    ? Math.round(selectedFeatures.reduce((s, f) => s + f.earlyFusionScore, 0) / selectedFeatures.length)
    : 0;
  const avgLateFusion = selectedFeatures.length > 0
    ? Math.round(selectedFeatures.reduce((s, f) => s + f.lateFusionScore, 0) / selectedFeatures.length)
    : 0;
  const avgConsistency = selectedFeatures.length > 0
    ? Math.round(selectedFeatures.reduce((s, f) => s + f.modalityConsistency, 0) / selectedFeatures.length)
    : 0;

  // ── 单学生示例融合特征 ──────────────────────────────────
  const exampleFeature = selectedFeatures.length > 0 ? selectedFeatures[0] : null;

  // ── 将时序数据转换为 Recharts LineChart 格式 ──────────
  const classTimelineData = useMemo(() => {
    if (timeSeriesData.length === 0) return [];

    const ts = timeSeriesData[0];
    if (!ts?.points || ts.points.length === 0) return [];

    return ts.points.map((pt: any, idx: number) => {
      const minute = Math.round((idx / (ts.points.length - 1)) * 45);
      const focus = Math.round(pt.videoEmotion * 100);
      const emotion = Math.round(pt.textSentiment * 100);
      const interaction = Math.min(100, Math.round((pt.interactionCount / 20) * 100));
      return {
        time: `${minute}min`,
        minute,
        focus,
        interaction,
        emotion,
      };
    });
  }, [timeSeriesData]);

  // ── 融合得分序列 ──────────────────────────────────────
  const fusionScoreSeries = useMemo(() => {
    if (timeSeriesData.length === 0) return null;
    const ts = timeSeriesData[0];
    return {
      scores: ts.fusionEngagementScore || [],
      summary: ts.summary || null,
      studentId: ts.studentId,
      week: ts.week,
    };
  }, [timeSeriesData]);

  // ── 模态特征雷达图数据 ──────────────────────────────────
  const modalityRadarData = useMemo(() => {
    if (!exampleFeature) return [];
    return exampleFeature.modalityFeatures.map(mf => ({
      modality: modalityLabels[mf.modality] || mf.modality,
      score: Math.round(mf.score),
      fullMark: 100,
      weight: mf.weight,
    }));
  }, [exampleFeature]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">数据融合</h2>
        <p className="text-sm text-slate-500 mt-1">多源数据融合引擎 — 学习通 · 智慧树 · 线下监控摄像头 · 自有教学平台 · 多模态联动融合</p>
      </div>

      {/* 周选择器 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4 flex-wrap">
        <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
          <Clock size={16} />
          选择周次：
        </label>
        <select
          value={selectedWeek}
          onChange={e => setSelectedWeek(Number(e.target.value))}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {Array.from({ length: 16 }, (_, i) => (
            <option key={i + 1} value={i + 1}>第{i + 1}周</option>
          ))}
        </select>
        <span className="text-xs text-slate-400 ml-auto">
          课程级多模态数据聚合（全班 {courseInfo?.totalStudents || 30} 人）
        </span>
      </div>

      {/* ── 主图表：四维指标在 16 周时间轴上的趋势 ───── */}
      <RechartsCard
        title="课程四维指标 16 周趋势对齐"
        description="学生学的状态 · 老师教的状态 · 平台资源质量 · 教学互动方式"
        toolbar={
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded" style={{ backgroundColor: COLORS.learning }} />学生学的状态</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded" style={{ backgroundColor: COLORS.teaching }} />老师教的状态</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded" style={{ backgroundColor: COLORS.resource }} />平台资源质量</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded" style={{ backgroundColor: COLORS.interaction }} />教学互动方式</span>
          </div>
        }
      >
        <div className="w-full h-87.5">
          <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={weeklyFourDimensions} margin={{ top: 10, right: 30, left: 20, bottom: 25 }}>
          <defs>
            <linearGradient id="gradLearning" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.learning} stopOpacity={0.15} />
              <stop offset="95%" stopColor={COLORS.learning} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradTeaching" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.teaching} stopOpacity={0.15} />
              <stop offset="95%" stopColor={COLORS.teaching} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradResource" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.resource} stopOpacity={0.15} />
              <stop offset="95%" stopColor={COLORS.resource} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradInteraction" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.interaction} stopOpacity={0.15} />
              <stop offset="95%" stopColor={COLORS.interaction} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="week" tick={{ fill: COLORS.slate, fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} />
          <YAxis domain={[0, 100]} tick={{ fill: COLORS.slate, fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} />
          <RTooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              fontSize: '12px',
            }}
          />
          <RLegend wrapperStyle={{ fontSize: '12px', marginTop: '8px' }} />
          <Area type="monotone" dataKey="learning" name="学生学的状态" stroke={COLORS.learning} strokeWidth={2.5} fill="url(#gradLearning)" dot={false} />
          <Area type="monotone" dataKey="teaching" name="老师教的状态" stroke={COLORS.teaching} strokeWidth={2.5} fill="url(#gradTeaching)" dot={false} />
          <Area type="monotone" dataKey="resource" name="平台资源质量" stroke={COLORS.resource} strokeWidth={2.5} fill="url(#gradResource)" dot={false} />
          <Area type="monotone" dataKey="interaction" name="教学互动方式" stroke={COLORS.interaction} strokeWidth={2.5} fill="url(#gradInteraction)" dot={false} />
        </AreaChart>
          </ResponsiveContainer>
        </div>
      </RechartsCard>

      {/* ── 45 分钟课堂多模态时序对齐（课程级聚合） ──────────── */}
      <RechartsCard
        key={`timeline-${selectedWeek}`}
        title="45 分钟课堂多模态数据时序对齐（课程级聚合）"
        toolbar={
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded" style={{ backgroundColor: COLORS.learning }} />教师语速/走动</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded" style={{ backgroundColor: COLORS.resource }} />学生弹幕/抬头率</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded" style={{ backgroundColor: COLORS.accent }} />课件PPT切换节奏</span>
          </div>
        }
      >
        {tsLoading ? (
          <div className="flex items-center justify-center w-full h-87.5">
            <Loader2 size={24} className="text-blue-500 animate-spin mr-2" />
            <div className="text-sm text-slate-400">加载时序数据中...</div>
          </div>
        ) : classTimelineData.length > 0 ? (
          <div className="space-y-3">
            <div className="w-full h-87.5">
              <ResponsiveContainer width="100%" height="100%">
              <LineChart key={`lc-${selectedWeek}`} data={classTimelineData} margin={{ top: 10, right: 30, left: 20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fill: COLORS.slate, fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis domain={[0, 100]} tick={{ fill: COLORS.slate, fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} />
                <RTooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                />
                <RLegend wrapperStyle={{ fontSize: '12px', marginTop: '8px' }} />
                <Line
                  type="monotone" dataKey="focus" name="教师语速/走动"
                  stroke={COLORS.learning} strokeWidth={2.5} dot={false} connectNulls
                />
                <Line
                  type="monotone" dataKey="interaction" name="学生弹幕/抬头率"
                  stroke={COLORS.resource} strokeWidth={2.5} dot={false} connectNulls
                />
                <Line
                  type="monotone" dataKey="emotion" name="课件PPT切换节奏"
                  stroke={COLORS.accent} strokeWidth={2.5} dot={false} connectNulls
                />
              </LineChart>
              </ResponsiveContainer>
            </div>
            {/* 融合得分摘要 */}
            {fusionScoreSeries && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-slate-500">趋势</p>
                  <p className="text-sm font-bold" style={{
                    color: fusionScoreSeries.summary?.engagementTrend === 'rising' ? '#059669'
                      : fusionScoreSeries.summary?.engagementTrend === 'declining' ? '#dc2626' : '#64748b'
                  }}>
                    {fusionScoreSeries.summary?.engagementTrend === 'rising' ? '↑ 上升'
                      : fusionScoreSeries.summary?.engagementTrend === 'declining' ? '↓ 下降'
                      : '→ 稳定'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">平均融合得分</p>
                  <p className="text-sm font-bold text-slate-800">
                    {Math.round(fusionScoreSeries.scores.reduce((acc: number, val: number) => acc + val, 0) / fusionScoreSeries.scores.length)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">数据点数</p>
                  <p className="text-sm font-bold text-slate-800">{fusionScoreSeries.scores.length}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-87.5">
            <div className="text-sm text-slate-400">暂无时序数据</div>
          </div>
        )}
      </RechartsCard>

      {/* ── 融合策略对比 + 模态特征详情 ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 早融合 vs 晚融合 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
          <div>
          <h3 className="text-base font-semibold text-slate-800 mb-4">融合策略对比（第{selectedWeek}周 · 课程级聚合）</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <GitMerge size={18} className="text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">早融合 (Early)</span>
              </div>
              <p className="text-3xl font-bold text-blue-700">{avgEarlyFusion}</p>
              <p className="text-xs text-blue-600 mt-1">综合得分</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <GitMerge size={18} className="text-purple-600" />
                <span className="text-sm font-semibold text-purple-800">晚融合 (Late)</span>
              </div>
              <p className="text-3xl font-bold text-purple-700">{avgLateFusion}</p>
              <p className="text-xs text-purple-600 mt-1">综合得分</p>
            </div>
          </div>
          </div>
          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">模态一致性：<span className="font-semibold text-slate-700">{avgConsistency}%</span></p>
            <div className="bg-slate-200 rounded-full h-1.5 mt-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${avgConsistency}%` }} />
            </div>
          </div>

          {/* ── 多模态权重动态配置滑块 ── */}
          <div className="mt-4 p-4 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl border border-violet-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-violet-600" />
                <h4 className="text-xs font-bold text-violet-800">多模态融合权重配置</h4>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={resetFusionWeights}
                  className="text-[10px] px-2 py-0.5 bg-white border border-violet-200 text-violet-600 rounded-md hover:bg-violet-50 transition-colors flex items-center gap-1"
                  title="恢复默认权重"
                >
                  <RotateCcw size={10} />
                  重置
                </button>
                <button
                  onClick={handleSaveWeights}
                  className="text-[10px] px-2.5 py-0.5 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { key: 'teaching' as const, label: '教学状态监测', desc: '视频专注度、情绪分析', color: 'bg-blue-500', lightBg: 'bg-blue-50', textColor: 'text-blue-700' },
                { key: 'resource' as const, label: '平台资源质量', desc: '课件完播率、资源下载', color: 'bg-violet-500', lightBg: 'bg-violet-50', textColor: 'text-violet-700' },
                { key: 'interaction' as const, label: '师生互动深度', desc: '问答频次、讨论热度', color: 'bg-amber-500', lightBg: 'bg-amber-50', textColor: 'text-amber-700' },
                { key: 'learning' as const, label: '传统学习数据', desc: '成绩、出勤、作业', color: 'bg-emerald-500', lightBg: 'bg-emerald-50', textColor: 'text-emerald-700' },
              ].map(({ key, label, desc, color, lightBg, textColor }) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className={`text-xs font-semibold ${textColor}`}>{label}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">{desc}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-700 tabular-nums w-8 text-right">{sliderValues[key]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={sliderValues[key]}
                    onChange={handleSliderChange(key)}
                    className={`w-full h-2 rounded-full appearance-none cursor-pointer accent-${key === 'teaching' ? 'blue' : key === 'resource' ? 'violet' : key === 'interaction' ? 'amber' : 'emerald'}-500 bg-slate-200`}
                    style={{
                      background: `linear-gradient(to right, ${key === 'teaching' ? '#3b82f6' : key === 'resource' ? '#8b5cf6' : key === 'interaction' ? '#f59e0b' : '#10b981'} 0%, ${key === 'teaching' ? '#3b82f6' : key === 'resource' ? '#8b5cf6' : key === 'interaction' ? '#f59e0b' : '#10b981'} ${sliderValues[key]}%, #e2e8f0 ${sliderValues[key]}%, #e2e8f0 100%)`,
                    }}
                  />
                </div>
              ))}
            </div>
            {/* 总和校验 */}
            <div className={`mt-3 pt-2.5 border-t border-violet-200/60 flex items-center justify-between text-xs`}>
              <span className="text-slate-500">权重总和</span>
              <span className={`font-bold ${Math.round(sliderValues.teaching + sliderValues.resource + sliderValues.interaction + sliderValues.learning) === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {Math.round(sliderValues.teaching + sliderValues.resource + sliderValues.interaction + sliderValues.learning)}%
                {Math.round(sliderValues.teaching + sliderValues.resource + sliderValues.interaction + sliderValues.learning) !== 100 && ' ⚠️ 请调整至 100%'}
              </span>
            </div>
          </div>
        </div>

        {/* 模态特征雷达图 */}
        {exampleFeature && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-base font-semibold text-slate-800 mb-4">
              第{selectedWeek}周 · 课程模态特征雷达
            </h3>
            <div className="flex justify-center w-full h-87.5">
              <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={modalityRadarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="modality" tick={{ fill: COLORS.slate, fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} />
                <Radar
                  name="特征得分"
                  dataKey="score"
                  stroke={COLORS.learning}
                  strokeWidth={2}
                  fill={COLORS.learning}
                  fillOpacity={0.2}
                />
                <RTooltip contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }} />
              </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 space-y-2">
              {exampleFeature.modalityFeatures.map((mf, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: modalityColors[mf.modality] }} />
                  <span className="text-xs text-slate-600 flex-1 truncate">{modalityLabels[mf.modality]}</span>
                  <span className="text-xs font-bold" style={{ color: modalityColors[mf.modality] }}>{Math.round(mf.score)}分</span>
                  <span className="text-xs text-slate-400">w={mf.weight}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 模态配色（供模态特征详情使用） ──────────────────────────
const modalityColors: Record<string, string> = {
  video_emotion: '#2563eb',
  text_semantic: '#059669',
  interaction_behavior: '#d97706',
  traditional_data: '#7c3aed',
};
