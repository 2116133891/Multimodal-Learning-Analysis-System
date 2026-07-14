// ===== 动态诊断页面 =====
import { useEffect, useState } from 'react';
import { useStore } from '../hooks/useStore';
import CardChart from '../components/CardChart';
import { AlertTriangle, ArrowRight, Monitor, Users, Clock, TrendingDown, BookOpen, Wifi, WifiOff } from 'lucide-react';

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
