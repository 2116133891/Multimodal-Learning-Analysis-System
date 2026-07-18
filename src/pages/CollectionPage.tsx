// ===== 数据采集页面（课程四维视角） =====
// 核心概念：采集多模态数据覆盖四个维度 — 学生学的状态、老师教的状态、平台资源质量、教学互动方式
// 重构：教/学/资源/互动四维数据采集视图 + 联动详情面板 + Recharts 图表
import { useEffect, useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import RechartsCard from '../components/RechartsCard';
import {
  Database, CheckCircle, FileText, MessageSquare, BarChart3, Eye, Mic,
  BookOpen, MessageSquare as MsgIcon, TrendingUp, TrendingDown, Activity,
  Loader2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, AreaChart, Area, Legend,
  PieChart, Pie, Cell,
} from 'recharts';

// ═══════════════════════════════════════════════════════════
//  课程四维数据采集配置
// ═══════════════════════════════════════════════════════════

const DIMENSION_COLORS = {
  learning: '#2563eb',
  teaching: '#059669',
  resource: '#7c3aed',
  interaction: '#d97706',
};

const fourDimensionConfig = {
  learning: {
    label: '学生学的状态',
    icon: Eye,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    lightText: 'text-blue-600',
    desc: '视频专注度、弹幕互动率、情绪分布、综合投入度',
    metrics: [
      { label: '视频专注度', key: 'focus' },
      { label: '弹幕互动率', key: 'danmaku' },
      { label: '情绪积极占比', key: 'sentiment' },
      { label: '综合投入度', key: 'engagement' },
    ],
    // 映射到 records 的类型
    recordTypes: ['behavior'] as const,
  },
  teaching: {
    label: '老师教的状态',
    icon: Mic,
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    lightText: 'text-emerald-600',
    desc: '讲授语速、走动轨迹、课件切换节奏、提问频次',
    metrics: [
      { label: '讲授语速', key: 'pace' },
      { label: '走动频次', key: 'movement' },
      { label: '课件切换节奏', key: 'pacing' },
      { label: '提问频次', key: 'question' },
    ],
    recordTypes: ['behavior', 'evaluation'] as const,
  },
  resource: {
    label: '平台资源质量',
    icon: BookOpen,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    lightText: 'text-purple-600',
    desc: '课件跳出率、视频回看热区、资源下载量、完播率',
    metrics: [
      { label: '课件完播率', key: 'completion' },
      { label: '视频回看热区', key: 'replay' },
      { label: '资源下载量', key: 'download' },
      { label: '内容覆盖率', key: 'coverage' },
    ],
    recordTypes: ['process'] as const,
  },
  interaction: {
    label: '教学互动方式',
    icon: MsgIcon,
    color: 'bg-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    lightText: 'text-amber-600',
    desc: '生生讨论活跃度、师生问答关联度、小组协作热度',
    metrics: [
      { label: '小组讨论热度', key: 'group' },
      { label: '师生问答频次', key: 'qa' },
      { label: '讨论区活跃度', key: 'board' },
      { label: '翻转课堂参与率', key: 'flip' },
    ],
    recordTypes: ['feedback', 'evaluation'] as const,
  },
};

// ═══════════════════════════════════════════════════════════
//  子组件 — 维度指标进度条
// ═══════════════════════════════════════════════════════════

function DimensionMetricRow({ label, value, color }: {
  label: string; value: number; color: string;
}) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold tabular-nums" style={{ color }}>{value} 分</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  主页面
// ═══════════════════════════════════════════════════════════

export default function CollectionPage() {
  const { records, dataQuality, fetchData } = useStore();
  const [activeDimension, setActiveDimension] = useState<keyof typeof fourDimensionConfig>('learning');
  const [showGenerated, setShowGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (records.length === 0) {
      fetchData();
    }
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setShowGenerated(false);
    await fetchData();
    setGenerating(false);
    setShowGenerated(true);
    setTimeout(() => setShowGenerated(false), 3000);
  };

  // ── 按维度过滤记录 ──────────────────────────────────────
  const dimensionRecords = useMemo(() => {
    const config = fourDimensionConfig[activeDimension];
    return records.filter(r => config.recordTypes.includes(r.type as typeof config.recordTypes[number]));
  }, [records, activeDimension]);

  // ── 维度周趋势数据（用于图表） ──────────────────────────
  const weeklyTrendData = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => {
      const week = i + 1;
      const weekRecords = dimensionRecords.filter(r => r.week === week);
      const avgVal = weekRecords.length > 0
        ? Math.round(weekRecords.reduce((s, r) => s + r.value, 0) / weekRecords.length)
        : 0;
      return { week: `第${week}周`, count: weekRecords.length, avg: avgVal };
    });
  }, [dimensionRecords]);

  // ── 维度指标模拟数据（基于记录数推算） ──────────────────
  const dimensionMetrics = useMemo(() => {
    const total = dimensionRecords.length;
    const base = total > 0 ? Math.round(50 + (total % 50)) : 60;
    return fourDimensionConfig[activeDimension].metrics.map((m, i) => ({
      ...m,
      value: Math.min(100, Math.max(20, base + (i - 1) * 8 + (total % 15))),
    }));
  }, [dimensionRecords, activeDimension]);

  // ── 模态分布数据（用于饼图） ────────────────────────────
  const modalityPieData = useMemo(() => {
    const types = ['behavior', 'process', 'outcome', 'evaluation', 'feedback'] as const;
    const typeLabels: Record<string, string> = {
      behavior: '行为数据',
      process: '过程数据',
      outcome: '成果数据',
      evaluation: '评价数据',
      feedback: '反馈数据',
    };
    return types.map(t => {
      const count = records.filter(r => r.type === t).length;
      return { name: typeLabels[t], value: count };
    }).filter(d => d.value > 0);
  }, [records]);

  const PIE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];

  // ── 数据质量 ────────────────────────────────────────────
  const completeness = dataQuality?.completeness ?? 0;
  const timeliness = dataQuality?.timeliness ?? 0;
  const accuracy = dataQuality?.accuracy ?? 0;

  return (
    <div className="space-y-6">
      {/* ═══════ 顶部标题栏 ═══════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">数据采集</h2>
          <p className="text-sm text-slate-500 mt-1">
            多源数据采集 — 学习通 · 智慧树 · 线下监控 · 自有平台 · 摄像头
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Database size={16} />
          )}
          {generating ? '生成中...' : '一键生成模拟数据'}
        </button>
      </div>

      {/* 生成提示 */}
      {showGenerated && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
          <CheckCircle size={20} className="text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-700">模拟数据生成成功！共 {records.length} 条记录。</p>
        </div>
      )}

      {/* ═══════ 数据质量概览 ═══════ */}
      {dataQuality && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: '数据完整性', value: completeness, color: '#3b82f6' },
            { label: '数据及时性', value: timeliness, color: '#10b981' },
            { label: '数据准确性', value: accuracy, color: '#8b5cf6' },
            { label: '总记录数', value: `${records.length.toLocaleString()} 条`, color: '#f59e0b', isText: true },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <p className="text-sm text-slate-500 mb-2">{item.label}</p>
              {item.isText ? (
                <p className="text-2xl font-bold text-slate-800">{item.value}</p>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${item.value}%`, backgroundColor: item.color }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 tabular-nums">{item.value}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ═══════ 课程四维数据采集概览 ═══════ */}
      <div className="bg-linear-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-4">课程四维数据采集体系</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.entries(fourDimensionConfig) as Array<[keyof typeof fourDimensionConfig, typeof fourDimensionConfig.learning]>).map(([key, config]) => {
            const Icon = config.icon;
            const dimRecords = records.filter(r => config.recordTypes.includes(r.type as typeof config.recordTypes[number]));
            const count = dimRecords.length;
            const avgVal = dimRecords.length > 0
              ? Math.round(dimRecords.reduce((s, r) => s + r.value, 0) / dimRecords.length)
              : 0;
            const trend = avgVal >= 65 ? 'up' : avgVal >= 45 ? 'stable' : 'down';

            return (
              <button
                key={key}
                onClick={() => setActiveDimension(key)}
                className={`bg-white rounded-xl border-2 shadow-sm p-5 text-left transition-all duration-200 hover:shadow-md ${
                  activeDimension === key
                    ? `${config.borderColor} ring-2 ring-offset-1`
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                style={activeDimension === key ? { ringColor: DIMENSION_COLORS[key] } : undefined}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2.5 rounded-lg ${config.color} text-white shadow-sm`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{config.label}</h4>
                    <p className="text-[10px] text-slate-400">{count} 条记录</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">{config.desc}</p>
                <div className="space-y-2">
                  {config.metrics.map((m, mi) => (
                    <div key={mi} className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{m.label}</span>
                      <div className="flex items-center gap-2">
                        {trend === 'up' && <TrendingUp size={12} className="text-emerald-500" />}
                        {trend === 'down' && <TrendingDown size={12} className="text-red-500" />}
                        <span className="font-semibold tabular-nums" style={{ color: DIMENSION_COLORS[key] }}>
                          {avgVal} 分
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════ 选中维度详情面板 ═══════ */}
      {(() => {
        const config = fourDimensionConfig[activeDimension];
        const Icon = config.icon;

        return (
          <>
            {/* 维度详情头部 */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${config.color} text-white`}>
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800">{config.label} — 采集详情</h3>
                  <p className="text-xs text-slate-400 mt-0.5">共 {dimensionRecords.length} 条记录 · 平均 {dimensionMetrics[0]?.value ?? 0} 分</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* 左侧：指标卡片 */}
                <div className="lg:col-span-1 p-6 border-b lg:border-b-0 lg:border-r border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">核心指标</h4>
                  <div className="space-y-4">
                    {dimensionMetrics.map((m) => (
                      <DimensionMetricRow
                        key={m.key}
                        label={m.label}
                        value={m.value}
                        color={DIMENSION_COLORS[activeDimension]}
                      />
                    ))}
                  </div>
                </div>

                {/* 中间：周趋势柱状图 */}
                <div className="lg:col-span-1 p-6 border-b lg:border-b-0 lg:border-r border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">周分布趋势</h4>
                  <div className="w-full h-70">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="week" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <RTooltip
                          contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            fontSize: '12px',
                          }}
                          formatter={(value: number, name: string) => [
                            name === 'count' ? `${value} 条` : `${value} 分`,
                            name === 'count' ? '记录数' : '平均分',
                          ]}
                        />
                        <Bar dataKey="count" name="记录数" fill={DIMENSION_COLORS[activeDimension]} radius={[4, 4, 0, 0]} opacity={0.6} />
                        <Bar dataKey="avg" name="平均分" fill={DIMENSION_COLORS[activeDimension]} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 右侧：模态分布饼图 */}
                <div className="lg:col-span-1 p-6">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">数据模态分布</h4>
                  <div className="w-full h-70">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={modalityPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {modalityPieData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <RTooltip
                          contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            fontSize: '12px',
                          }}
                        />
                        <Legend
                          formatter={(value: string) => <span className="text-xs text-slate-600">{value}</span>}
                          wrapperStyle={{ fontSize: '11px', marginTop: '8px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* 维度趋势面积图（全宽） */}
            <RechartsCard
              title={`${config.label} — 16 周趋势`}
              description={`近 16 周 ${config.label} 的平均分变化趋势`}
              accent={
                activeDimension === 'learning' ? 'blue'
                  : activeDimension === 'teaching' ? 'emerald'
                  : activeDimension === 'resource' ? 'purple'
                  : 'amber'
              }
            >
              <div className="w-full h-87.5">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyTrendData}>
                    <defs>
                      <linearGradient id={`trendGrad-${activeDimension}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={DIMENSION_COLORS[activeDimension]} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={DIMENSION_COLORS[activeDimension]} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <RTooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [`${value} 分`, '平均分']}
                    />
                    <Area
                      type="monotone"
                      dataKey="avg"
                      name="平均分"
                      stroke={DIMENSION_COLORS[activeDimension]}
                      strokeWidth={2.5}
                      fill={`url(#trendGrad-${activeDimension})`}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </RechartsCard>
          </>
        );
      })()}

      {/* ═══════ 五类原始数据总览 ═══════ */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-slate-400" />
          五类原始数据总览
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[
            { type: 'behavior', label: '教学行为数据', icon: BarChart3, color: '#3b82f6', desc: '讲授语速、情绪饱满度、走动频次、课堂互动' },
            { type: 'process', label: '资源使用数据', icon: Database, color: '#10b981', desc: '课件完播率、难点回放率、视频观看深度、资料下载' },
            { type: 'outcome', label: '课程成果数据', icon: CheckCircle, color: '#8b5cf6', desc: '目标达成度、模块得分、作品质量、课程进化' },
            { type: 'evaluation', label: '教师评价数据', icon: FileText, color: '#f59e0b', desc: '课堂表现评语、教学状态评估、资源反馈' },
            { type: 'feedback', label: '课程反馈数据', icon: MessageSquare, color: '#ec4899', desc: '学生问卷评分、满意度调查、改进建议' },
          ].map(({ type, label, icon: Icon, color, desc }) => {
            const count = records.filter(r => r.type === type).length;
            const typeRecords = records.filter(r => r.type === type);
            const avgVal = typeRecords.length > 0
              ? Math.round(typeRecords.reduce((s, r) => s + r.value, 0) / typeRecords.length)
              : 0;

            return (
              <div
                key={type}
                className="group p-4 bg-slate-50/60 rounded-xl border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-white shadow-sm group-hover:scale-105 transition-transform">
                    <Icon size={18} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </div>
                  <span className="text-xs px-2 py-1 bg-white rounded-full text-slate-500 font-medium shadow-sm tabular-nums">
                    {count} 条
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-700 mb-1">{label}</h4>
                <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">{desc}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">平均</span>
                  <span className="font-bold tabular-nums" style={{ color }}>{avgVal} 分</span>
                </div>
                <div className="mt-2 h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${avgVal}%`, backgroundColor: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
