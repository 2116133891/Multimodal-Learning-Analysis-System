// ===== 数据融合页面（重构：Recharts 学术图表） =====
import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../hooks/useStore';
import RechartsCard from '../components/RechartsCard';
import {
  GitMerge,
  Clock,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, Legend as RLegend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, AreaChart, Area,
} from 'recharts';

// ── 学术配色 ──────────────────────────────────────────────
const COLORS = {
  video: '#2563eb',        // 科技蓝 — 视频微表情
  text: '#059669',         // 护眼绿 — 文本语义
  interaction: '#d97706',  // 琥珀橙 — 交互行为
  traditional: '#7c3aed',  // 紫罗兰 — 传统数据
  early: '#dc2626',        // 警示红 — 早融合
  late: '#4f46e5',         // 靛蓝 — 晚融合
  accent: '#8b5cf6',       // 紫色 — 情绪值
  slate: '#475569',
};

const modalityLabels: Record<string, string> = {
  video_emotion: '视频微表情',
  text_semantic: '文本语义',
  interaction_behavior: '交互行为',
  traditional_data: '传统学习数据',
};

export default function FusionPage() {
  const { records, multimodalFeatures, courseInfo, fetchData } = useStore();
  const [selectedWeek, setSelectedWeek] = useState(8);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── 按周统计三种模态的平均特征 ──────────────────────────
  const weeklyModalities = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => {
      const week = i + 1;
      const weekFeatures = multimodalFeatures.filter(f => f.week === week);
      if (weekFeatures.length === 0) return { week, video: 0, text: 0, interaction: 0, traditional: 0 };

      const videoScores = weekFeatures.flatMap(f => f.modalityFeatures.filter(m => m.modality === 'video_emotion').map(m => m.score));
      const textScores = weekFeatures.flatMap(f => f.modalityFeatures.filter(m => m.modality === 'text_semantic').map(m => m.score));
      const interactionScores = weekFeatures.flatMap(f => f.modalityFeatures.filter(m => m.modality === 'interaction_behavior').map(m => m.score));
      const traditionalScores = weekFeatures.flatMap(f => f.modalityFeatures.filter(m => m.modality === 'traditional_data').map(m => m.score));

      return {
        week: `第${week}周`,
        video: videoScores.length > 0 ? Math.round(videoScores.reduce((a, b) => a + b, 0) / videoScores.length) : 0,
        text: textScores.length > 0 ? Math.round(textScores.reduce((a, b) => a + b, 0) / textScores.length) : 0,
        interaction: interactionScores.length > 0 ? Math.round(interactionScores.reduce((a, b) => a + b, 0) / interactionScores.length) : 0,
        traditional: traditionalScores.length > 0 ? Math.round(traditionalScores.reduce((a, b) => a + b, 0) / traditionalScores.length) : 0,
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

  // ── 模拟 45 分钟课堂的多模态时序数据 ────────────────────
  // 为选中学生生成一节课的模拟数据：视频专注度、交互频率、情绪值
  const classTimelineData = useMemo(() => {
    if (selectedFeatures.length === 0) return [];

    // 取该周第一个学生的特征作为基础
    // 确认有选中周的数据
    const points: Array<{
      time: string;
      minute: number;
      focus: number;
      interaction: number;
      emotion: number;
    }> = [];

    for (let minute = 0; minute <= 45; minute += 1) {
      // 模拟课堂节奏：导入(0-5) → 讲授(5-20) → 互动(20-35) → 总结(35-45)
      let focusBase: number;
      let interactionBase: number;
      let emotionBase: number;

      if (minute < 5) {
        // 导入阶段：快速进入状态
        focusBase = 40 + minute * 5;
        interactionBase = 2 + minute;
        emotionBase = 50 + minute * 2;
      } else if (minute < 20) {
        // 讲授阶段：专注度先升后降
        focusBase = 65 - Math.abs(minute - 12) * 1.5 + Math.random() * 5;
        interactionBase = 3 + Math.random() * 3;
        emotionBase = 55 + Math.random() * 10;
      } else if (minute < 35) {
        // 互动阶段：交互频率飙升
        focusBase = 60 + Math.random() * 10;
        interactionBase = 15 + Math.random() * 10;
        emotionBase = 65 + Math.random() * 15;
      } else {
        // 总结阶段：平稳收尾
        focusBase = 50 - (minute - 35) * 1.5 + Math.random() * 5;
        interactionBase = 8 - (minute - 35) * 0.5 + Math.random() * 3;
        emotionBase = 60 - (minute - 35) * 1 + Math.random() * 5;
      }

      points.push({
        time: `${minute}min`,
        minute,
        focus: Math.min(100, Math.max(0, Math.round(focusBase))),
        interaction: Math.min(100, Math.max(0, Math.round(interactionBase * 3))), // 缩放至 0-100
        emotion: Math.min(100, Math.max(0, Math.round(emotionBase))),
      });
    }

    return points;
  }, [selectedFeatures]);

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
        <p className="text-sm text-slate-500 mt-1">多模态特征融合引擎 — 视频微表情、文本语义、交互行为的时序对齐与融合表征</p>
      </div>

      {/* 周选择器 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
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
          该周 {selectedFeatures.length} 名学生的融合特征
        </span>
      </div>

      {/* ── 主图表：四种模态特征在 16 周时间轴上的趋势 ───── */}
      <RechartsCard
        title="四种模态特征在 16 周时间轴上的趋势对齐"
        toolbar={
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded" style={{ backgroundColor: COLORS.video }} />视频微表情</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded" style={{ backgroundColor: COLORS.text }} />文本语义</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded" style={{ backgroundColor: COLORS.interaction }} />交互行为</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded" style={{ backgroundColor: COLORS.traditional }} />传统数据</span>
          </div>
        }
      >
        <AreaChart data={weeklyModalities} margin={{ top: 10, right: 30, left: 20, bottom: 25 }}>
          <defs>
            <linearGradient id="gradVideo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.video} stopOpacity={0.15} />
              <stop offset="95%" stopColor={COLORS.video} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradText" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.text} stopOpacity={0.15} />
              <stop offset="95%" stopColor={COLORS.text} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradInteraction" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.interaction} stopOpacity={0.15} />
              <stop offset="95%" stopColor={COLORS.interaction} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradTraditional" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.traditional} stopOpacity={0.15} />
              <stop offset="95%" stopColor={COLORS.traditional} stopOpacity={0} />
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
          <Area type="monotone" dataKey="video" name="视频微表情" stroke={COLORS.video} strokeWidth={2.5} fill="url(#gradVideo)" dot={false} />
          <Area type="monotone" dataKey="text" name="文本语义" stroke={COLORS.text} strokeWidth={2.5} fill="url(#gradText)" dot={false} />
          <Area type="monotone" dataKey="interaction" name="交互行为" stroke={COLORS.interaction} strokeWidth={2.5} fill="url(#gradInteraction)" dot={false} />
          <Area type="monotone" dataKey="traditional" name="传统数据" stroke={COLORS.traditional} strokeWidth={2.5} fill="url(#gradTraditional)" dot={false} />
        </AreaChart>
      </RechartsCard>

      {/* ── 45 分钟课堂多模态时序对齐 ───────────────────── */}
      <RechartsCard
        title="45 分钟课堂多模态数据时序对齐（模拟）"
        toolbar={
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded" style={{ backgroundColor: COLORS.video }} />视频专注度</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded" style={{ backgroundColor: COLORS.text }} />交互频率</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded" style={{ backgroundColor: COLORS.accent }} />情绪值</span>
          </div>
        }
      >
        <LineChart data={classTimelineData} margin={{ top: 10, right: 30, left: 20, bottom: 25 }}>
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
            type="monotone" dataKey="focus" name="视频专注度"
            stroke={COLORS.video} strokeWidth={2.5} dot={false} connectNulls
          />
          <Line
            type="monotone" dataKey="interaction" name="交互频率"
            stroke={COLORS.text} strokeWidth={2.5} dot={false} connectNulls
          />
          <Line
            type="monotone" dataKey="emotion" name="情绪值"
            stroke={COLORS.accent} strokeWidth={2.5} dot={false} connectNulls
          />
        </LineChart>
      </RechartsCard>

      {/* ── 融合策略对比 + 模态特征详情 ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 早融合 vs 晚融合 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-4">融合策略对比（第{selectedWeek}周）</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <GitMerge size={18} className="text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">早融合 (Early Fusion)</span>
              </div>
              <p className="text-3xl font-bold text-blue-700">{avgEarlyFusion}</p>
              <p className="text-xs text-blue-600 mt-1">综合得分</p>
              <p className="text-xs text-slate-500 mt-2">特征级拼接 → 统一编码</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <GitMerge size={18} className="text-purple-600" />
                <span className="text-sm font-semibold text-purple-800">晚融合 (Late Fusion)</span>
              </div>
              <p className="text-3xl font-bold text-purple-700">{avgLateFusion}</p>
              <p className="text-xs text-purple-600 mt-1">综合得分</p>
              <p className="text-xs text-slate-500 mt-2">独立推理 → 加权投票</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">模态一致性：<span className="font-semibold text-slate-700">{avgConsistency}%</span></p>
            <div className="bg-slate-200 rounded-full h-1.5 mt-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${avgConsistency}%` }} />
            </div>
          </div>
        </div>

        {/* 模态特征雷达图 */}
        {exampleFeature && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-base font-semibold text-slate-800 mb-4">
              学生 {exampleFeature.studentId} · 第{exampleFeature.week}周 模态特征
            </h3>
            <div className="flex justify-center">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={modalityRadarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="modality" tick={{ fill: COLORS.slate, fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} />
                <Radar
                  name="特征得分"
                  dataKey="score"
                  stroke={COLORS.video}
                  strokeWidth={2}
                  fill={COLORS.video}
                  fillOpacity={0.2}
                />
                <RTooltip contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }} />
              </RadarChart>
            </div>
            <div className="mt-3 space-y-2">
              {exampleFeature.modalityFeatures.map((mf, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: modalityColors[mf.modality] }} />
                  <span className="text-xs text-slate-600 flex-1 truncate">{modalityLabels[mf.modality]}</span>
                  <span className="text-xs font-bold" style={{ color: modalityColors[mf.modality] }}>{Math.round(mf.score)}分</span>
                  <span className="text-xs text-slate-400">w={mf.weight}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 课程目标达成度 ──────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-base font-semibold text-slate-800 mb-4">课程目标达成度</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {courseInfo?.objectives.map(obj => {
            const objRecords = records.filter(r => r.objectiveId === obj.id);
            const avgScore = objRecords.length > 0
              ? Math.round(objRecords.reduce((s, r) => s + r.value, 0) / objRecords.length)
              : 0;
            const achievement = Math.min(100, Math.round((avgScore / obj.targetScore) * 100));
            return (
              <div key={obj.id} className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">{obj.dimension === 'knowledge' ? '📖' : obj.dimension === 'skill' ? '🔧' : '💡'} {obj.name}</p>
                <div className="flex items-end gap-2 mt-2">
                  <span className="text-2xl font-bold text-slate-800">{avgScore}</span>
                  <span className="text-xs text-slate-400 mb-1">/ {obj.targetScore}</span>
                </div>
                <div className="bg-slate-200 rounded-full h-2 mt-2">
                  <div className={`h-2 rounded-full ${achievement >= 90 ? 'bg-emerald-500' : achievement >= 70 ? 'bg-blue-500' : 'bg-orange-500'}`} style={{ width: `${achievement}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-1">达成率 {achievement}%</p>
              </div>
            );
          })}
        </div>
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
