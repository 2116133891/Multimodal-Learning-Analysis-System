// ===== 数字驾驶舱 — 系统总览（科技感重构） =====
import { useEffect, useState, useRef, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import StatCard from '../components/StatCard';
import CardChart from '../components/CardChart';
import RechartsCard from '../components/RechartsCard';
import {
  TrendingUp, Users, AlertTriangle, Target, Activity,
  Cpu, Database, Zap, Globe, Shield, Eye, Radio,
  BarChart3, Layers, Network,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend } from 'recharts';

// ── 实时日志消息模板 ──────────────────────────────────────────
const logTemplates = [
  { category: 'video', msg: '捕获学生 {id} 视频微表情异常，置信度 {conf}%，情绪：{emo}' },
  { category: 'text', msg: '线上讨论区语义分析完毕，{id} 发言情感得分 {score}' },
  { category: 'interaction', msg: '学生 {id} 交互行为频次突降，偏离基线 {dev}%' },
  { category: 'fusion', msg: '多模态特征融合完成，{id} 一致性评分 {cons}%' },
  { category: 'diagnosis', msg: '第 {week} 周动态诊断引擎触发，检测到 {issue}' },
  { category: 'ai', msg: 'AI 建议生成完毕，类别：{cat}，优先级：{pri}' },
  { category: 'intervention', msg: '教学干预已部署，模块 {mod}，预期效果 +{eff}%' },
  { category: 'stream', msg: '实时数据流吞吐 {throughput} KB/s，队列深度 {depth}' },
  { category: 'model', msg: 'AI 模型推理延迟 {latency}ms，GPU 利用率 {gpu}%' },
  { category: 'alert', msg: '⚠ 告警升级：{id} 连续 {cnt} 周参与度低于阈值' },
];

const emojiOptions = ['confused', 'bored', 'frustrated', 'distracted', 'focused'];
const issueOptions = ['知识断层', '参与度骤降', '认知过载', '小组协作失衡'];
const catOptions = ['rhythm', 'task', 'evaluation', 'resource'];
const priOptions = ['high', 'medium', 'low'];
const modOptions = ['m1', 'm2', 'm3', 'm4'];

function randomStudentId() {
  const n = Math.floor(Math.random() * 30) + 1;
  return `S${String(n).padStart(3, '0')}`;
}

function generateLogMessage() {
  const tpl = logTemplates[Math.floor(Math.random() * logTemplates.length)];
  let msg = tpl.msg
    .replace('{id}', randomStudentId())
    .replace('{conf}', Math.floor(75 + Math.random() * 24))
    .replace('{score}', (Math.random() * 2 - 1).toFixed(2))
    .replace('{dev}', Math.floor(15 + Math.random() * 45))
    .replace('{cons}', Math.floor(60 + Math.random() * 39))
    .replace('{week}', Math.floor(Math.random() * 16) + 1)
    .replace('{issue}', issueOptions[Math.floor(Math.random() * issueOptions.length)])
    .replace('{cat}', catOptions[Math.floor(Math.random() * catOptions.length)])
    .replace('{pri}', priOptions[Math.floor(Math.random() * priOptions.length)])
    .replace('{mod}', modOptions[Math.floor(Math.random() * modOptions.length)])
    .replace('{eff}', Math.floor(5 + Math.random() * 25))
    .replace('{throughput}', Math.floor(120 + Math.random() * 880))
    .replace('{depth}', Math.floor(10 + Math.random() * 200))
    .replace('{latency}', Math.floor(8 + Math.random() * 45))
    .replace('{gpu}', Math.floor(45 + Math.random() * 50))
    .replace('{emo}', emojiOptions[Math.floor(Math.random() * emojiOptions.length)])
    .replace('{cnt}', Math.floor(1 + Math.random() * 3));
  return msg;
}

// ── 系统健康模拟数据 ──────────────────────────────────────────
function generateHealthData() {
  const data = [];
  let concurrency = 120;
  let latency = 15;
  let gpu = 55;
  for (let i = 0; i < 30; i++) {
    concurrency = Math.max(50, Math.min(300, concurrency + (Math.random() - 0.45) * 30));
    latency = Math.max(5, Math.min(80, latency + (Math.random() - 0.5) * 10));
    gpu = Math.max(30, Math.min(95, gpu + (Math.random() - 0.5) * 15));
    data.push({
      time: `${String(Math.floor(i / 5)).padStart(2, '0')}:${String((i % 5) * 12).padStart(2, '0')}`,
      concurrency: Math.round(concurrency),
      latency: Math.round(latency * 10) / 10,
      gpu: Math.round(gpu),
    });
  }
  return data;
}

// ── 实时数据流模拟（Recharts AreaChart） ──────────────────────
function generateStreamData() {
  const data = [];
  let val = 200;
  for (let i = 0; i < 20; i++) {
    val = Math.max(50, Math.min(500, val + (Math.random() - 0.45) * 80));
    data.push({ time: `${String(i).padStart(2, '0')}:00`, throughput: Math.round(val) });
  }
  return data;
}

export default function DashboardPage() {
  const { courseInfo, records, alerts, vitalityScores, loading, fetchData } = useStore();
  const [healthScore, setHealthScore] = useState(75);
  const [liveLogs, setLiveLogs] = useState<Array<{ time: string; msg: string; category: string }>>([]);
  const [healthData] = useState(generateHealthData);
  const [streamData, setStreamData] = useState(generateStreamData);
  const [currentConcurrency, setCurrentConcurrency] = useState(186);
  const [currentLatency, setCurrentLatency] = useState(14.2);
  const [currentGpu, setCurrentGpu] = useState(62);
  const [currentThroughput, setCurrentThroughput] = useState(347);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 从 records 计算健康度
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (records.length > 0) {
      const week8 = records.filter(r => r.week === 8 && r.type === 'behavior');
      const avg = week8.length > 0 ? Math.round(week8.reduce((s, r) => s + r.value, 0) / week8.length) : 75;
      setHealthScore(avg);
    }
  }, [records]);

  // 实时日志流
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const newLog = {
        time: timeStr,
        msg: generateLogMessage(),
        category: logTemplates[Math.floor(Math.random() * logTemplates.length)].category,
      };
      setLiveLogs(prev => {
        const next = [...prev, newLog];
        return next.slice(-50); // 最多保留 50 条
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // 实时指标跳动
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentConcurrency(p => Math.max(80, Math.min(350, p + Math.floor((Math.random() - 0.45) * 40))));
      setCurrentLatency(p => Math.max(5, Math.min(60, +(p + (Math.random() - 0.5) * 8).toFixed(1))));
      setCurrentGpu(p => Math.max(30, Math.min(95, p + Math.floor((Math.random() - 0.45) * 12))));
      setCurrentThroughput(p => Math.max(100, Math.min(1000, p + Math.floor((Math.random() - 0.45) * 100))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // 数据流图表更新
  useEffect(() => {
    const interval = setInterval(() => {
      setStreamData(prev => {
        const lastVal = prev[prev.length - 1]?.throughput ?? 200;
        const newVal = Math.max(50, Math.min(500, lastVal + (Math.random() - 0.45) * 80));
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        return [...prev.slice(-19), { time: timeStr, throughput: Math.round(newVal) }];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 日志自动滚动到底部
  const scrollToEnd = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [liveLogs, scrollToEnd]);

  // 日志颜色映射
  const categoryColor: Record<string, string> = {
    video: 'text-red-400',
    text: 'text-blue-400',
    interaction: 'text-amber-400',
    fusion: 'text-purple-400',
    diagnosis: 'text-emerald-400',
    ai: 'text-cyan-400',
    intervention: 'text-orange-400',
    stream: 'text-slate-400',
    model: 'text-pink-400',
    alert: 'text-red-500',
  };

  const categoryBadge: Record<string, string> = {
    video: 'bg-red-500/10 text-red-400 border-red-500/20',
    text: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    interaction: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    fusion: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    diagnosis: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    ai: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    intervention: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    stream: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    model: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    alert: 'bg-red-500/20 text-red-500 border-red-500/40',
  };

  // 多模态数据总量
  const totalModalityFeatures = records.length;
  const totalSuggestions = courseInfo?.modules?.length ? courseInfo.modules.length * 3 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="mt-3 text-sm text-slate-500">正在加载驾驶舱数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ═══ 顶部标题栏 ═══ */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-800">数字驾驶舱</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-emerald-700">系统运行中</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {courseInfo?.name} · {courseInfo?.semester} · {courseInfo?.type} · 多模态学习分析平台
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">最后刷新</p>
          <p className="text-sm font-mono text-slate-600">
            {new Date().toLocaleTimeString('zh-CN', { hour12: false })}
          </p>
        </div>
      </div>

      {/* ═══ 核心指标卡片（4 张大卡） ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 累计处理多模态数据量 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -translate-y-6 translate-x-6 opacity-50 group-hover:scale-110 transition-transform" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">累计处理多模态数据量</p>
              <Database size={18} className="text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-slate-800">
              {(totalModalityFeatures / 1000).toFixed(1)}<span className="text-lg text-slate-400">K</span>
            </p>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <TrendingUp size={12} /> 较昨日 +{(Math.random() * 5 + 2).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* 精准干预次数 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -translate-y-6 translate-x-6 opacity-50 group-hover:scale-110 transition-transform" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">精准干预次数</p>
              <Shield size={18} className="text-emerald-500" />
            </div>
            <p className="text-3xl font-bold text-slate-800">
              {alerts.filter(a => a.severity === 'high').length + 12}
            </p>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <TrendingUp size={12} /> 干预有效率 89%
            </p>
          </div>
        </div>

        {/* 课程活力指数 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full -translate-y-6 translate-x-6 opacity-50 group-hover:scale-110 transition-transform" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">课程活力指数</p>
              <Activity size={18} className="text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-slate-800">
              {vitalityScores.length > 0 ? vitalityScores[vitalityScores.length - 1].overall : 0}
              <span className="text-lg text-slate-400">/100</span>
            </p>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <TrendingUp size={12} /> 较期初 +{vitalityScores.length > 1 ? vitalityScores[vitalityScores.length - 1].overall - vitalityScores[0].overall : 15} 分
            </p>
          </div>
        </div>

        {/* AI 模型推理状态 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -translate-y-6 translate-x-6 opacity-50 group-hover:scale-110 transition-transform" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">AI 推理延迟</p>
              <Zap size={18} className="text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-slate-800">
              {currentLatency}
              <span className="text-lg text-slate-400"> ms</span>
            </p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Cpu size={12} /> GPU {currentGpu}% · 并发 {currentConcurrency}
            </p>
          </div>
        </div>
      </div>

      {/* ═══ 系统运行监控 ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：并发数据流趋势（Recharts） */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio size={16} className="text-blue-500" />
              <h3 className="text-sm font-semibold text-slate-700">实时数据吞吐量</h3>
            </div>
            <span className="text-xs font-mono text-blue-600">{currentThroughput} KB/s</span>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={streamData}>
                <defs>
                  <linearGradient id="streamGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <RTooltip
                  contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  formatter={(value: number) => [`${value} KB/s`, '吞吐量']}
                />
                <Area
                  type="monotone"
                  dataKey="throughput"
                  name="throughput"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#streamGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 中间：系统健康仪表盘（ECharts Gauge） */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Cpu size={16} className="text-emerald-500" />
            <h3 className="text-sm font-semibold text-slate-700">系统健康监控</h3>
          </div>
          <CardChart
            title=""
            option={{
              series: [
                {
                  type: 'gauge' as const,
                  center: ['50%', '60%'],
                  radius: '85%',
                  min: 0,
                  max: 100,
                  splitNumber: 5,
                  progress: {
                    show: true,
                    width: 18,
                    itemStyle: {
                      color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 1, y2: 0,
                        colorStops: [
                          { offset: 0, color: '#3b82f6' },
                          { offset: 0.5, color: '#10b981' },
                          { offset: 1, color: '#f59e0b' },
                        ],
                      },
                    },
                  },
                  axisLine: { lineStyle: { width: 18, color: [[1, '#e2e8f0']] } },
                  axisTick: { show: false },
                  splitLine: { length: 12, lineStyle: { width: 2, color: '#cbd5e1' } },
                  axisLabel: { distance: 22, fontSize: 10, color: '#94a3b8' },
                  anchor: { show: true, showAbove: true, size: 12, itemStyle: { color: '#3b82f6' } },
                  title: { show: false },
                  detail: {
                    valueAnimation: true,
                    fontSize: 28,
                    fontWeight: 'bold',
                    offsetCenter: [0, '30%'],
                    formatter: (v: number) => `${Math.round(v)}`,
                    color: '#1e293b',
                  },
                  data: [{ value: healthScore, name: '健康度' }],
                },
                // 小仪表：GPU 利用率
                {
                  type: 'gauge' as const,
                  center: ['25%', '85%'],
                  radius: '35%',
                  min: 0,
                  max: 100,
                  progress: { show: true, width: 8, itemStyle: { color: '#f59e0b' } },
                  axisLine: { lineStyle: { width: 8, color: [[1, '#f1f5f9']] } },
                  axisTick: { show: false },
                  splitLine: { show: false },
                  axisLabel: { show: false },
                  detail: {
                    valueAnimation: true,
                    fontSize: 14,
                    fontWeight: 'bold',
                    offsetCenter: [0, '20%'],
                    formatter: (v: number) => `${Math.round(v)}%`,
                    color: '#f59e0b',
                  },
                  title: { offsetCenter: [0, '60%'], fontSize: 10, color: '#94a3b8' },
                  data: [{ value: currentGpu, name: 'GPU' }],
                },
                // 小仪表：延迟
                {
                  type: 'gauge' as const,
                  center: ['75%', '85%'],
                  radius: '35%',
                  min: 0,
                  max: 100,
                  progress: { show: true, width: 8, itemStyle: { color: '#10b981' } },
                  axisLine: { lineStyle: { width: 8, color: [[1, '#f1f5f9']] } },
                  axisTick: { show: false },
                  splitLine: { show: false },
                  axisLabel: { show: false },
                  detail: {
                    valueAnimation: true,
                    fontSize: 14,
                    fontWeight: 'bold',
                    offsetCenter: [0, '20%'],
                    formatter: (v: number) => `${(v * 0.5).toFixed(0)}ms`,
                    color: '#10b981',
                  },
                  title: { offsetCenter: [0, '60%'], fontSize: 10, color: '#94a3b8' },
                  data: [{ value: Math.min(100, currentLatency * 2), name: '延迟' }],
                },
              ],
            }}
            height={300}
          />
        </div>

        {/* 右侧：多模态数据源状态 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Network size={16} className="text-purple-500" />
            <h3 className="text-sm font-semibold text-slate-700">多模态数据源状态</h3>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label: '视频微表情分析', status: 'active', count: '12,847 帧', color: 'bg-red-500' },
              { label: '文本语义分析', status: 'active', count: '3,256 条', color: 'bg-blue-500' },
              { label: '交互行为追踪', status: 'active', count: '45,123 次', color: 'bg-amber-500' },
              { label: '多模态特征融合', status: 'active', count: '1,260 向量', color: 'bg-purple-500' },
              { label: 'AI 建议生成', status: 'processing', count: `${totalSuggestions} 条`, color: 'bg-emerald-500' },
            ].map((source, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${source.color} ${source.status === 'processing' ? 'animate-pulse' : ''}`} />
                  <span className="text-sm text-slate-700">{source.label}</span>
                </div>
                <span className="text-xs font-mono text-slate-500">{source.count}</span>
              </div>
            ))}

            {/* 数据流热力指示 */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-2">今日数据处理分布</p>
              <div className="flex gap-0.5 h-8 items-end">
                {Array.from({ length: 24 }, (_, h) => {
                  const height = Math.max(10, Math.sin(h / 24 * Math.PI * 2) * 100 + (Math.random() - 0.5) * 30);
                  const intensity = height > 70 ? 'bg-blue-500' : height > 40 ? 'bg-blue-400' : 'bg-blue-300';
                  return (
                    <div
                      key={h}
                      className={`flex-1 rounded-sm ${intensity} opacity-70 hover:opacity-100 transition-opacity`}
                      style={{ height: `${height}%` }}
                      title={`${h}:00 - ${Math.round(height)}K ops`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>00:00</span>
                <span>12:00</span>
                <span>23:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 双列布局：课程模块 + 实时日志 ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：课程模块 + 告警 */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Layers size={18} className="text-slate-500" />
              课程模块
            </h3>
            <div className="space-y-3">
              {courseInfo?.modules.map((mod) => (
                <div key={mod.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{mod.name}</p>
                    <p className="text-xs text-slate-400">{mod.description}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    第{mod.weekRange[0]}-{mod.weekRange[1]}周
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              近期诊断告警
            </h3>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    alert.severity === 'high' ? 'bg-red-500' : alert.severity === 'medium' ? 'bg-orange-400' : 'bg-yellow-400'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      第{alert.week}周 · {alert.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{alert.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：实时多模态数据流 */}
        <div className="bg-slate-900 rounded-xl border border-slate-700 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-200">实时多模态数据流</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span className="text-[10px] font-medium text-emerald-400">LIVE</span>
              </span>
            </div>
            <span className="text-xs font-mono text-slate-500">{liveLogs.length} 条</span>
          </div>
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-2"
            style={{ maxHeight: '480px' }}
          >
            {liveLogs.length === 0 && (
              <div className="text-center py-10">
                <p className="text-xs text-slate-600">正在连接数据流...</p>
              </div>
            )}
            {liveLogs.map((log, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-xs font-mono animate-[fadeIn_0.3s_ease-in]"
              >
                <span className="text-slate-500 flex-shrink-0">{log.time}</span>
                <span className={`px-1.5 py-0.5 rounded border flex-shrink-0 ${categoryBadge[log.category] || categoryBadge.stream}`}>
                  {log.category}
                </span>
                <span className="text-slate-300 leading-relaxed">{log.msg}</span>
              </div>
            ))}
          </div>
          {/* 底部状态栏 */}
          <div className="px-4 py-2 border-t border-slate-700 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>队列深度: {liveLogs.length}/50</span>
            <span>吞吐: {currentThroughput} KB/s</span>
            <span>延迟: {currentLatency}ms</span>
          </div>
        </div>
      </div>

      {/* ═══ 底部生命力趋势 ═══ */}
      <CardChart
        title="课程生命力趋势（16周）"
        option={{
          tooltip: { trigger: 'axis' as const },
          legend: { data: ['总体', '课堂活力', '创造力', '学习感知', '资源延续', '课程进化'], bottom: 0 },
          xAxis: { type: 'category' as const, data: vitalityScores.map(v => `第${v.week}周`) },
          yAxis: { type: 'value' as const, min: 0, max: 100, axisLabel: { formatter: '{value}分' } },
          series: [
            { name: '总体', type: 'line' as const, data: vitalityScores.map(v => v.overall), smooth: true, lineStyle: { width: 3 }, itemStyle: { color: '#3b82f6' } },
            { name: '课堂活力', type: 'line' as const, data: vitalityScores.map(v => v.classroomVitality), smooth: true, itemStyle: { color: '#10b981' } },
            { name: '创造力', type: 'line' as const, data: vitalityScores.map(v => v.creativity), smooth: true, itemStyle: { color: '#f59e0b' } },
            { name: '学习感知', type: 'line' as const, data: vitalityScores.map(v => v.learningPerception), smooth: true, itemStyle: { color: '#6366f1' } },
            { name: '资源延续', type: 'line' as const, data: vitalityScores.map(v => v.resourceExtension), smooth: true, itemStyle: { color: '#ec4899' } },
            { name: '课程进化', type: 'line' as const, data: vitalityScores.map(v => v.courseEvolution), smooth: true, itemStyle: { color: '#8b5cf6' } },
          ],
        }}
        height={300}
      />
    </div>
  );
}
