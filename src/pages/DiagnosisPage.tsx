// ===== 动态诊断页面 =====
import { useEffect, useState } from 'react';
import { useStore } from '../hooks/useStore';
import CardChart from '../components/CardChart';
import { AlertTriangle, ArrowRight, Monitor, Users, Clock, TrendingDown, BookOpen, Wifi, WifiOff, Activity, Zap, Database, ArrowDown, BarChart3, GraduationCap } from 'lucide-react';

// ── O2O 混合式教学断点诊断模拟数据 ────────────────────────────
interface O2OBreakpoint {
  phase: '课前线上' | '课中线下' | '课后线上';
  studentsEntered: number;
  studentsExited: number;
  avgScore: number;
  avgEngagement: number;
  keyRisk: string;
}

const o2oBreakpoints: O2OBreakpoint[] = [
  {
    phase: '课前线上',
    studentsEntered: 42,
    studentsExited: 8,
    avgScore: 58,
    avgEngagement: 62,
    keyRisk: '视频完播率仅 52%，"后印象派"段落重播率 67%',
  },
  {
    phase: '课中线下',
    studentsEntered: 34,
    studentsExited: 3,
    avgScore: 74,
    avgEngagement: 78,
    keyRisk: '实操环节参与率 91%，但小组讨论深度不足',
  },
  {
    phase: '课后线上',
    studentsEntered: 31,
    studentsExited: 6,
    avgScore: 65,
    avgEngagement: 55,
    keyRisk: '拓展讨论帖回复率仅 43%，自主延伸学习动力不足',
  },
];

// 计算各环节流失人数和流失率
const totalEntered = o2oBreakpoints[0].studentsEntered;
const totalLost = o2oBreakpoints.reduce((s, bp) => s + bp.studentsExited, 0);
const totalRetained = o2oBreakpoints[o2oBreakpoints.length - 1].studentsEntered;

// ── O2O 全景数据流配置 ────────────────────────────────────────
interface O2ODataFlowPhase {
  label: string;
  icon: typeof Wifi;
  gradient: string;
  bgGradient: string;
  borderColor: string;
  badgeBg: string;
  badgeColor: string;
  metrics: { label: string; value: string; unit: string; icon: typeof Activity }[];
  modalities: { label: string; color: string; value: number }[];
  description: string;
}

const o2oDataFlows: O2ODataFlowPhase[] = [
  {
    label: '课前阶段',
    icon: Wifi,
    gradient: 'from-violet-500 to-purple-600',
    bgGradient: 'bg-gradient-to-br from-violet-50 to-purple-50',
    borderColor: 'border-violet-200',
    badgeBg: 'bg-violet-100',
    badgeColor: 'text-violet-700',
    description: '线上自主学习阶段 — 视频预习、在线测试、知识摸底',
    metrics: [
      { label: '平均预习时长', value: '47', unit: 'min', icon: Clock },
      { label: '平均测试得分', value: '58', unit: '分', icon: BarChart3 },
      { label: '视频完播率', value: '52', unit: '%', icon: Activity },
    ],
    modalities: [
      { label: '视频微表情', color: '#8b5cf6', value: 62 },
      { label: '在线测试', color: '#a78bfa', value: 58 },
      { label: '登录频次', color: '#c4b5fd', value: 74 },
    ],
  },
  {
    label: '课中阶段',
    icon: Users,
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    borderColor: 'border-emerald-200',
    badgeBg: 'bg-emerald-100',
    badgeColor: 'text-emerald-700',
    description: '线下深度互动阶段 — 微表情分析、交互追踪、实操演练',
    metrics: [
      { label: '平均参与度', value: '78', unit: '%', icon: Activity },
      { label: '实操完成率', value: '91', unit: '%', icon: CheckCircle },
      { label: '小组协作分', value: '72', unit: '分', icon: BarChart3 },
    ],
    modalities: [
      { label: '视频专注度', color: '#10b981', value: 78 },
      { label: '交互频次', color: '#059669', value: 85 },
      { label: '实操得分', color: '#6ee7b7', value: 72 },
    ],
  },
  {
    label: '课后阶段',
    icon: BookOpen,
    gradient: 'from-blue-500 to-indigo-600',
    bgGradient: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    borderColor: 'border-blue-200',
    badgeBg: 'bg-blue-100',
    badgeColor: 'text-blue-700',
    description: '线上延伸学习阶段 — 讨论区语义分析、作业互评、知识巩固',
    metrics: [
      { label: '讨论发帖量', value: '127', unit: '条', icon: Database },
      { label: '语义情感分', value: '0.68', unit: '', icon: Activity },
      { label: '互评完成率', value: '76', unit: '%', icon: BarChart3 },
    ],
    modalities: [
      { label: '文本情感', color: '#3b82f6', value: 68 },
      { label: '讨论活跃', color: '#2563eb', value: 74 },
      { label: '作业互评', color: '#60a5fa', value: 76 },
    ],
  },
];

// 检查圈图标（用于课中阶段）
function CheckCircle(props: { size?: number; className?: string }) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export default function DiagnosisPage() {
  const { records, alerts, fetchData } = useStore();
  const [activeTab, setActiveTab] = useState<'alerts' | 'o2o'>('alerts');

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
        <p className="text-sm text-slate-500 mt-1">基于多源数据联动的课程动态诊断 — 从"结果评价"向"过程诊断"转变</p>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          O2O 混合式教学多模态数据全景流转视图
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        {/* 顶部装饰渐变条 */}
        <div className="h-1 bg-gradient-to-r from-violet-500 via-emerald-500 to-blue-500" />

        {/* 标题区 */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-blue-600 rounded-xl shadow-sm">
                <Zap size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">O2O 混合式教学多模态数据全景流转</h3>
                <p className="text-xs text-slate-500 mt-0.5">课前线上 → 课中线下 → 课后线上 · 三阶段多模态数据融合追踪</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span className="px-2 py-1 bg-slate-100 rounded-md">3 阶段</span>
              <span className="px-2 py-1 bg-slate-100 rounded-md">9 模态指标</span>
              <span className="px-2 py-1 bg-slate-100 rounded-md">30 人班级</span>
            </div>
          </div>
        </div>

        {/* 三阶段数据流卡片 */}
        <div className="p-6">
          <div className="flex items-stretch gap-0">
            {o2oDataFlows.map((phase, idx) => {
              const Icon = phase.icon;
              const bp = o2oBreakpoints[idx];
              const retentionRate = Math.round(((bp.studentsEntered - bp.studentsExited) / bp.studentsEntered) * 100);

              return (
                <div key={idx} className="flex-1">
                  {/* 阶段卡片 */}
                  <div className={`rounded-xl border-2 ${phase.borderColor} ${phase.bgGradient} p-5 h-full flex flex-col relative overflow-hidden`}>
                    {/* 背景装饰 */}
                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${phase.gradient} opacity-5 rounded-full -translate-y-6 translate-x-6`} />

                    {/* 阶段头部 */}
                    <div className="flex items-center gap-2 mb-4 relative">
                      <div className={`p-2 bg-white rounded-lg shadow-sm border ${phase.borderColor}`}>
                        <Icon size={16} className={`text-transparent bg-clip-text bg-gradient-to-r ${phase.gradient}`} />
                      </div>
                      <div>
                        <span className={`text-xs px-2 py-0.5 ${phase.badgeBg} ${phase.badgeColor} rounded-full font-medium`}>
                          阶段 {idx + 1}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-lg font-bold text-slate-800 mb-1">{phase.label}</h4>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">{phase.description}</p>

                    {/* 关键指标 */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {phase.metrics.map((m, mi) => (
                        <div key={mi} className="bg-white/80 backdrop-blur-sm rounded-lg p-2.5 border border-slate-100 text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <m.icon size={10} className="text-slate-400" />
                          </div>
                          <p className="text-base font-bold text-slate-800">{m.value}{m.unit ? <span className="text-xs font-normal text-slate-400">{m.unit}</span> : ''}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{m.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* 模态数据进度条 */}
                    <div className="space-y-2.5 mb-4 flex-1">
                      {phase.modalities.map((mod, mi) => (
                        <div key={mi}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-500">{mod.label}</span>
                            <span className="font-semibold text-slate-700">{mod.value}%</span>
                          </div>
                          <div className="w-full bg-white/60 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${phase.gradient} transition-all duration-1000`}
                              style={{ width: `${mod.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 留存率标签 */}
                    <div className="pt-3 border-t border-slate-200/60">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">留存率</span>
                        <span className={`font-bold text-transparent bg-clip-text bg-gradient-to-r ${phase.gradient}`}>
                          {retentionRate}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 阶段间箭头连接器 */}
                  {idx < o2oDataFlows.length - 1 && (
                    <div className="flex items-center justify-center w-10 flex-shrink-0 -mx-1 z-10 relative">
                      <div className="flex flex-col items-center">
                        <ArrowDown size={16} className="text-slate-300" />
                        <div className="w-px h-3 bg-slate-300" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 底部总览统计 */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-slate-400">全程参与</p>
                <p className="text-lg font-bold text-slate-800">{totalEntered}<span className="text-xs text-slate-400">人</span></p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400">最终留存</p>
                <p className="text-lg font-bold text-emerald-600">{totalRetained}<span className="text-xs text-slate-400">人</span></p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400">总流失</p>
                <p className="text-lg font-bold text-red-500">-{totalLost}<span className="text-xs text-slate-400">人</span></p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">最大流失断点</p>
              <p className="text-sm font-bold text-indigo-600">
                {o2oBreakpoints.reduce((max, bp) =>
                  (bp.studentsExited / bp.studentsEntered) >
                  (max.studentsExited / max.studentsEntered) ? bp : max
                , o2oBreakpoints[0]).phase}
                <span className="text-xs text-slate-400 ml-1">
                  （{Math.round((o2oBreakpoints.reduce((max, bp) =>
                    (bp.studentsExited / bp.studentsEntered) >
                    (max.studentsExited / max.studentsEntered) ? bp : max
                  , o2oBreakpoints[0]).studentsExited / o2oBreakpoints[0].studentsEntered * 100))}%）
                </span>
              </p>
            </div>
          </div>
        </div>
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

      {/* ═══════════════════════════════════════════════════
          O2O 混合式教学状态断点诊断
          ═══════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 rounded-2xl border-2 border-indigo-100 shadow-sm overflow-hidden">
        {/* 标题栏 */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
          <div className="flex items-center gap-3">
            <Monitor size={22} />
            <div>
              <h3 className="text-base font-bold">课前 - 课中 - 课后 O2O 状态断点诊断</h3>
              <p className="text-xs text-indigo-200 mt-0.5">混合式教学全流程学习流失追踪 · 识别线上/线下断点环节</p>
            </div>
          </div>
        </div>

        {/* Tab 切换 */}
        <div className="flex border-b border-indigo-100">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'alerts'
                ? 'text-indigo-700 border-b-2 border-indigo-600 bg-white'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <AlertTriangle size={14} className="inline mr-1.5 -mt-0.5" />
            告警总览
          </button>
          <button
            onClick={() => setActiveTab('o2o')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'o2o'
                ? 'text-indigo-700 border-b-2 border-indigo-600 bg-white'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Wifi size={14} className="inline mr-1.5 -mt-0.5" />
            O2O 漏斗诊断
          </button>
        </div>

        {activeTab === 'alerts' && (
          <div className="p-6">
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
        )}

        {activeTab === 'o2o' && (
          <div className="p-6 space-y-6">
            {/* 桑基式漏斗：学生数量流转 */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Users size={16} className="text-indigo-500" />
                混合式学习流转漏斗
              </h4>
              <div className="flex items-stretch gap-0">
                {o2oBreakpoints.map((bp, idx) => {
                  const lostPct = Math.round((bp.studentsExited / bp.studentsEntered) * 100);
                  const Icon = idx === 0 ? Wifi : idx === 1 ? Users : BookOpen;
                  const borderColor = idx === 0 ? 'border-indigo-300' : idx === 1 ? 'border-emerald-300' : 'border-blue-300';
                  const bgColor = idx === 0 ? 'bg-indigo-50' : idx === 1 ? 'bg-emerald-50' : 'bg-blue-50';
                  const textColor = idx === 0 ? 'text-indigo-700' : idx === 1 ? 'text-emerald-700' : 'text-blue-700';
                  return (
                    <div key={idx} className="flex-1">
                      <div className={`rounded-xl border-2 ${borderColor} ${bgColor} p-4 h-full`}>
                        <div className="flex items-center gap-2 mb-3">
                          <Icon size={18} className={textColor} />
                          <span className="text-sm font-bold text-slate-800">{bp.phase}</span>
                        </div>

                        {/* 人数流转动效 */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">进入</span>
                            <span className="font-bold text-slate-800">{bp.studentsEntered} 人</span>
                          </div>
                          <div className="flex items-center justify-center">
                            <ArrowRight size={14} className="text-slate-300" />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">留存</span>
                            <span className="font-bold text-emerald-600">{bp.studentsEntered - bp.studentsExited} 人</span>
                          </div>
                          <div className="flex items-center justify-center">
                            <TrendingDown size={14} className="text-red-400" />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">流失</span>
                            <span className="font-bold text-red-500">-{bp.studentsExited} 人 ({lostPct}%)</span>
                          </div>
                        </div>

                        {/* 进度条：留存率 */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                            <span>留存率</span>
                            <span className="font-semibold text-slate-700">
                              {Math.round(((bp.studentsEntered - bp.studentsExited) / bp.studentsEntered) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                idx === 0 ? 'bg-indigo-500' : idx === 1 ? 'bg-emerald-500' : 'bg-blue-500'
                              }`}
                              style={{
                                width: `${((bp.studentsEntered - bp.studentsExited) / bp.studentsEntered) * 100}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* 关键指标 */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-white rounded-lg p-2 border border-slate-100 text-center">
                            <p className="text-xs text-slate-400">均分</p>
                            <p className="text-lg font-bold text-slate-700">{bp.avgScore}</p>
                          </div>
                          <div className="bg-white rounded-lg p-2 border border-slate-100 text-center">
                            <p className="text-xs text-slate-400">参与度</p>
                            <p className="text-lg font-bold text-slate-700">{bp.avgEngagement}%</p>
                          </div>
                        </div>

                        {/* 风险标签 */}
                        <div className="flex items-start gap-1.5 bg-white/70 rounded-lg p-2 border border-slate-100">
                          <AlertTriangle size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-slate-600 leading-relaxed">{bp.keyRisk}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* 总览卡片：最终留存 */}
                <div className="w-36 flex-shrink-0 ml-2">
                  <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-4 h-full flex flex-col justify-center items-center text-center">
                    <p className="text-xs text-indigo-200 mb-1">全程留存</p>
                    <p className="text-3xl font-bold">{totalRetained}<span className="text-sm font-normal text-indigo-200">/{totalEntered}</span></p>
                    <p className="text-xs text-indigo-200 mt-1">
                      流失 {totalLost} 人 ({Math.round((totalLost / totalEntered) * 100)}%)
                    </p>
                    <div className="mt-3 pt-3 border-t border-white/20 w-full">
                      <p className="text-[10px] text-indigo-200 leading-relaxed">
                        最大断点在{' '}
                        <span className="font-bold text-white">
                          {o2oBreakpoints.reduce((max, bp) =>
                            (bp.studentsExited / bp.studentsEntered) >
                            (max.studentsExited / max.studentsEntered) ? bp : max
                          , o2oBreakpoints[0]).phase}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* O2O 断点诊断结论 */}
            <div className="bg-white rounded-xl border border-indigo-100 p-4">
              <h5 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Clock size={14} className="text-indigo-500" />
                诊断结论
              </h5>
              <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                <p>
                  <strong className="text-indigo-700">课前线上环节流失最高（{Math.round((o2oBreakpoints[0].studentsExited / o2oBreakpoints[0].studentsEntered) * 100)}%）</strong>，
                  主要原因为"后印象派"等抽象概念视频段理解门槛高、缺乏即时互动反馈。
                  建议将线上视频拆分为 ≤8 分钟的微课片段，并嵌入随堂即时测验。
                </p>
                <p>
                  <strong className="text-emerald-700">课中线下环节留存最佳（仅 {Math.round((o2oBreakpoints[1].studentsExited / o2oBreakpoints[1].studentsEntered) * 100)}% 流失）</strong>，
                  实操演示和面对面指导有效弥补了线上学习缺口。但小组讨论深度不足，
                  建议引入结构化讨论框架（如"思考-配对-分享"）。
                </p>
                <p>
                  <strong className="text-blue-700">课后线上环节再次流失（{Math.round((o2oBreakpoints[2].studentsExited / o2oBreakpoints[2].studentsEntered) * 100)}%）</strong>，
                  自主延伸学习动力不足。建议设置"线上-线下"衔接型任务（如线下课堂布置任务 → 线上讨论区协作 → 下次课堂展示）。
                </p>
              </div>
            </div>

            {/* 线上/线下流失分布图 */}
            <CardChart
              title="线上 vs 线下环节流失分布"
              option={{
                tooltip: { trigger: 'axis' as const, axisPointer: { type: 'shadow' as const } },
                legend: { data: ['流失人数', '留存人数'], bottom: 0 },
                xAxis: {
                  type: 'category' as const,
                  data: o2oBreakpoints.map(bp => bp.phase),
                },
                yAxis: { type: 'value' as const },
                series: [
                  {
                    name: '流失人数', type: 'bar' as const, stack: 'total',
                    data: o2oBreakpoints.map(bp => bp.studentsExited),
                    itemStyle: { color: '#ef4444', borderRadius: [0, 0, 0, 0] },
                  },
                  {
                    name: '留存人数', type: 'bar' as const, stack: 'total',
                    data: o2oBreakpoints.map(bp => bp.studentsEntered - bp.studentsExited),
                    itemStyle: { color: '#3b82f6', borderRadius: [6, 6, 0, 0] },
                  },
                ],
                grid: { left: 60, right: 20, top: 20, bottom: 50 },
              }}
              height={220}
            />
          </div>
        )}
      </div>
    </div>
  );
}
