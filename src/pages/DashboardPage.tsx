// ===== 数字驾驶舱 — 课程全局画像与健康度监控 =====
import { useEffect, useState, useRef, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import StatCard from '../components/StatCard';
import CardChart from '../components/CardChart';
import RechartsCard from '../components/RechartsCard';
import {
  TrendingUp, Users, AlertTriangle, Target, Activity,
  Cpu, Database, Zap, Globe, Shield, Eye, Radio,
  BarChart3, Layers, Network, Mic, BookOpen, MessageSquare,
  Play, Headphones, Video, FileText, Download,
  Thermometer, TrendingDown, TrendingUp as TrendingUpIcon,
  Award, Star,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

// ── 课程画像健康度模拟数据 ──────────────────────────────────────────
function generateCourseProfileHealth() {
  const data = [];
  for (let week = 1; week <= 16; week++) {
    const base = 55 + week * 2.5 + Math.sin(week * 0.3) * 8;
    data.push({
      week: `第${week}周`,
      health: Math.min(100, Math.max(35, Math.round(base + (Math.random() - 0.5) * 10))),
      teaching: Math.min(100, Math.max(40, Math.round(45 + week * 2.2 + (Math.random() - 0.5) * 8))),
      resource: Math.min(100, Math.max(40, Math.round(50 + week * 2 + (Math.random() - 0.5) * 10))),
      interaction: Math.min(100, Math.max(35, Math.round(40 + week * 3 + (Math.random() - 0.5) * 12))),
    });
  }
  return data;
}

// ── 教师教学状态周趋势 ──────────────────────────────────────────────
function generateTeachingTrend() {
  const data = [];
  for (let week = 1; week <= 16; week++) {
    data.push({
      week: `第${week}周`,
      pace: Math.min(100, Math.max(40, Math.round(50 + week * 2 + (Math.random() - 0.4) * 10))),
      emotion: Math.min(100, Math.max(45, Math.round(48 + week * 2.5 + (Math.random() - 0.4) * 12))),
      movement: Math.min(30, Math.max(8, Math.round(12 + week * 0.5 + (Math.random() - 0.5) * 5))),
      eyeContact: Math.min(100, Math.max(40, Math.round(45 + week * 2.2 + (Math.random() - 0.4) * 10))),
      questionRate: Math.min(25, Math.max(5, Math.round(8 + week * 0.6 + (Math.random() - 0.5) * 3))),
    });
  }
  return data;
}

// ── 资源利用率周趋势 ────────────────────────────────────────────────
function generateResourceTrend() {
  const data = [];
  for (let week = 1; week <= 16; week++) {
    data.push({
      week: `第${week}周`,
      completion: Math.min(100, Math.max(40, Math.round(50 + week * 2.5 + (Math.random() - 0.4) * 8))),
      replay: Math.min(100, Math.max(15, Math.round(25 + (week > 8 ? 15 : 0) + (Math.random() - 0.5) * 20))),
      download: Math.round(10 + week * 3 + (Math.random() - 0.5) * 10),
      watchDepth: Math.min(100, Math.max(40, Math.round(50 + week * 2 + (Math.random() - 0.4) * 10))),
    });
  }
  return data;
}

// ── 互动方式周趋势 ──────────────────────────────────────────────────
function generateInteractionTrend() {
  const data = [];
  for (let week = 1; week <= 16; week++) {
    data.push({
      week: `第${week}周`,
      qa: Math.min(20, Math.max(3, Math.round(5 + (Math.random() - 0.4) * 4 + (week > 6 ? 3 : 0)))),
      group: Math.min(100, Math.max(25, Math.round(35 + week * 3 + (Math.random() - 0.4) * 15))),
      danmaku: Math.min(15, Math.max(1, Math.round(2 + (Math.random() - 0.5) * 5 + (week > 4 ? 2 : 0)))),
      board: Math.min(50, Math.max(5, Math.round(10 + week * 2 + (Math.random() - 0.5) * 10))),
      poll: Math.min(100, Math.max(40, Math.round(50 + week * 2.5 + (Math.random() - 0.4) * 15))),
    });
  }
  return data;
}

// ── 雷达图维度数据 ──────────────────────────────────────────────────
function generateRadarData(week: number) {
  return [
    { subject: '讲授语速', A: Math.min(100, 50 + week * 2.5), fullMark: 100 },
    { subject: '情绪饱满度', A: Math.min(100, 48 + week * 2.8), fullMark: 100 },
    { subject: '走动频次', A: Math.min(100, 30 + week * 1.5), fullMark: 100 },
    { subject: '眼神交流', A: Math.min(100, 45 + week * 2.2), fullMark: 100 },
    { subject: '提问频次', A: Math.min(100, 25 + week * 1.2), fullMark: 100 },
    { subject: '课件完播', A: Math.min(100, 50 + week * 2.5), fullMark: 100 },
    { subject: '视频深度', A: Math.min(100, 50 + week * 2), fullMark: 100 },
    { subject: '小组讨论', A: Math.min(100, 35 + week * 3), fullMark: 100 },
    { subject: '讨论区', A: Math.min(100, 40 + week * 2.5), fullMark: 100 },
    { subject: '翻转课堂', A: Math.min(100, 40 + week * 3.5), fullMark: 100 },
  ];
}

// ── 实时日志消息模板 ────────────────────────────────────────────────
const logTemplates = [
  { category: 'teaching', msg: '第 {week} 周教学状态扫描完成，讲授语速 {speed}字/分，情绪饱满度 {emo}%' },
  { category: 'resource', msg: '课程资源利用率更新：课件完播率 {complete}%，难点回放率 {replay}%' },
  { category: 'interaction', msg: '第 {week} 周互动数据：问答 {qa}次，小组讨论热度 {heat}，弹幕 {danmaku}条/分' },
  { category: 'health', msg: '课程健康度综合评估：{health}分，等级 {grade}，风险项 {risks} 个' },
  { category: 'improvement', msg: '第 {week} 周持续改进报告已生成，改善信号 {signals} 条' },
  { category: 'alert', msg: '⚠ 预警：第 {week} 周 {issue} 低于阈值' },
  { category: 'fusion', msg: '多源数据融合完成，教学-资源-互动三维关联度 {corr}%' },
  { category: 'stream', msg: '课程数据流吞吐 {throughput} KB/s，队列深度 {depth}' },
];

const issueOptions = ['讲授语速偏慢', '课件完播率不足', '小组讨论冷淡', '翻转课堂参与率低', '视频观看深度不够'];
const weekOptions = Array.from({ length: 16 }, (_, i) => i + 1);

function randomWeek() {
  return weekOptions[Math.floor(Math.random() * weekOptions.length)];
}

function generateLogMessage() {
  const tpl = logTemplates[Math.floor(Math.random() * logTemplates.length)];
  let msg = tpl.msg
    .replace('{week}', randomWeek())
    .replace('{speed}', Math.floor(180 + Math.random() * 120))
    .replace('{emo}', Math.floor(55 + Math.random() * 40))
    .replace('{complete}', Math.floor(50 + Math.random() * 45))
    .replace('{replay}', Math.floor(15 + Math.random() * 55))
    .replace('{qa}', Math.floor(3 + Math.random() * 15))
    .replace('{heat}', Math.floor(30 + Math.random() * 65))
    .replace('{danmaku}', (Math.random() * 10).toFixed(1))
    .replace('{health}', Math.floor(60 + Math.random() * 35))
    .replace('{grade}', ['A', 'B', 'B', 'C'][Math.floor(Math.random() * 4)])
    .replace('{risks}', Math.floor(Math.random() * 4))
    .replace('{signals}', Math.floor(2 + Math.random() * 6))
    .replace('{issue}', issueOptions[Math.floor(Math.random() * issueOptions.length)])
    .replace('{corr}', Math.floor(60 + Math.random() * 35))
    .replace('{throughput}', Math.floor(120 + Math.random() * 880))
    .replace('{depth}', Math.floor(10 + Math.random() * 200));
  return msg;
}

// ── 系统运行模拟数据 ────────────────────────────────────────────────
function generateSystemHealthData() {
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

function generateDataStreamData() {
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
  const [systemHealthData] = useState(generateSystemHealthData);
  const [streamData, setStreamData] = useState(generateDataStreamData);
  const [currentConcurrency, setCurrentConcurrency] = useState(186);
  const [currentLatency, setCurrentLatency] = useState(14.2);
  const [currentGpu, setCurrentGpu] = useState(62);
  const [currentThroughput, setCurrentThroughput] = useState(347);
  const [selectedWeek, setSelectedWeek] = useState(16);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 课程画像健康趋势
  const [profileHealthData] = useState(generateCourseProfileHealth);
  const [teachingTrend] = useState(generateTeachingTrend);
  const [resourceTrend] = useState(generateResourceTrend);
  const [interactionTrend] = useState(generateInteractionTrend);
  const [radarData] = useState(() => generateRadarData(16));

  // 从 records 计算课程健康度
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
      const tpl = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      const newLog = {
        time: timeStr,
        msg: generateLogMessage(),
        category: tpl.category,
      };
      setLiveLogs(prev => {
        const next = [...prev, newLog];
        return next.slice(-50);
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

  // 日志自动滚动
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
    teaching: 'text-blue-400',
    resource: 'text-emerald-400',
    interaction: 'text-amber-400',
    health: 'text-purple-400',
    improvement: 'text-cyan-400',
    alert: 'text-red-500',
    fusion: 'text-indigo-400',
    stream: 'text-slate-400',
  };

  const categoryBadge: Record<string, string> = {
    teaching: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    resource: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    interaction: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    health: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    improvement: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    alert: 'bg-red-500/20 text-red-500 border-red-500/40',
    fusion: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    stream: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  // 当前周画像数据
  const currentProfile = profileHealthData[selectedWeek - 1];
  const currentTeaching = teachingTrend[selectedWeek - 1];
  const currentResource = resourceTrend[selectedWeek - 1];
  const currentInteraction = interactionTrend[selectedWeek - 1];

  // 多模态数据总量
  const totalModalityFeatures = records.length;
  const totalSuggestions = courseInfo?.modules?.length ? courseInfo.modules.length * 3 : 0;

  // 本周风险标签
  const riskTags = currentProfile
    ? [
        ...(currentTeaching.pace < 60 ? ['讲授语速偏慢'] : []),
        ...(currentResource.completion < 60 ? ['课件完播率偏低'] : []),
        ...(currentInteraction.group < 40 ? ['小组讨论冷淡'] : []),
        ...(currentTeaching.emotion < 60 ? ['情绪饱满度不足'] : []),
      ]
    : [];

  // 改善信号
  const improvementSignals = currentProfile
    ? [
        ...(currentTeaching.eyeContact > 70 ? ['眼神交流充分'] : []),
        ...(currentResource.watchDepth > 70 ? ['视频学习深度良好'] : []),
        ...(currentInteraction.poll > 70 ? ['实时投票参与率高'] : []),
        ...(currentInteraction.group > 70 ? ['小组讨论活跃'] : []),
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="mt-3 text-sm text-slate-500">正在加载课程画像数据...</p>
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
            <h2 className="text-2xl font-bold text-slate-800">课程全局画像</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-emerald-700">实时监控中</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {courseInfo?.name} · {courseInfo?.semester} · {courseInfo?.type} · 多维课程画像与健康度监控
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-400">最后刷新</p>
            <p className="text-sm font-mono text-slate-600">
              {new Date().toLocaleTimeString('zh-CN', { hour12: false })}
            </p>
          </div>
          <select
            value={selectedWeek}
            onChange={e => setSelectedWeek(Number(e.target.value))}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 16 }, (_, i) => (
              <option key={i + 1} value={i + 1}>第{i + 1}周</option>
            ))}
          </select>
        </div>
      </div>

      {/* ═══ 核心指标卡片（课程健康度四维） ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 课程综合健康度 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -translate-y-6 translate-x-6 opacity-50 group-hover:scale-110 transition-transform" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">课程综合健康度</p>
              <Thermometer size={18} className="text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-slate-800">
              {currentProfile?.health ?? healthScore}<span className="text-lg text-slate-400">/100</span>
            </p>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <TrendingUp size={12} /> 较期初 +{(currentProfile?.health ?? 75) - 55} 分
            </p>
          </div>
        </div>

        {/* 教师教学状态 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -translate-y-6 translate-x-6 opacity-50 group-hover:scale-110 transition-transform" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">教师教学状态</p>
              <Mic size={18} className="text-emerald-500" />
            </div>
            <p className="text-3xl font-bold text-slate-800">
              {currentTeaching?.emotion ?? 72}<span className="text-lg text-slate-400">%</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              语速 {currentTeaching?.pace ?? 70} · 提问 {currentTeaching?.questionRate ?? 12}次/节
            </p>
          </div>
        </div>

        {/* 课程资源利用率 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full -translate-y-6 translate-x-6 opacity-50 group-hover:scale-110 transition-transform" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">课程资源利用率</p>
              <BookOpen size={18} className="text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-slate-800">
              {currentResource?.completion ?? 78}<span className="text-lg text-slate-400">%</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              完播率 {currentResource?.completion ?? 78}% · 下载 {currentResource?.download ?? 50}次
            </p>
          </div>
        </div>

        {/* 互动方式热度 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -translate-y-6 translate-x-6 opacity-50 group-hover:scale-110 transition-transform" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">互动方式热度</p>
              <MessageSquare size={18} className="text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-slate-800">
              {currentInteraction?.group ?? 68}<span className="text-lg text-slate-400">分</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              讨论 {currentInteraction?.group ?? 68} · 投票 {currentInteraction?.poll ?? 75}%
            </p>
          </div>
        </div>

        {/* AI 推理状态 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-50 rounded-full -translate-y-6 translate-x-6 opacity-50 group-hover:scale-110 transition-transform" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">AI 多源融合</p>
              <Cpu size={18} className="text-cyan-500" />
            </div>
            <p className="text-3xl font-bold text-slate-800">
              {currentLatency}<span className="text-lg text-slate-400">ms</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              GPU {currentGpu}% · 并发 {currentConcurrency}
            </p>
          </div>
        </div>
      </div>

      {/* ═══ 第一行双列：课程三维雷达 + 健康度趋势 ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 课程三维健康度雷达图 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Target size={16} className="text-blue-500" />
            <h3 className="text-sm font-semibold text-slate-700">第{selectedWeek}周 · 课程三维画像雷达</h3>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={380}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} />
                <Radar
                  name="课程画像"
                  dataKey="A"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
                <RTooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', marginTop: '8px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 课程健康度 16 周趋势 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <TrendingUpIcon size={16} className="text-emerald-500" />
            <h3 className="text-sm font-semibold text-slate-700">课程健康度趋势（16周）</h3>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={380}>
              <AreaChart data={profileHealthData}>
                <defs>
                  <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[30, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <RTooltip
                  contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  formatter={(value: number, name: string) => [`${value}分`, name === 'health' ? '综合健康度' : name === 'teaching' ? '教学状态' : name === 'resource' ? '资源利用' : '互动热度']}
                />
                <Area type="monotone" dataKey="health" name="综合健康度" stroke="#10b981" strokeWidth={2.5} fill="url(#healthGrad)" dot={false} />
                <Area type="monotone" dataKey="teaching" name="教学状态" stroke="#3b82f6" strokeWidth={1.5} fill="transparent" dot={false} />
                <Area type="monotone" dataKey="resource" name="资源利用" stroke="#8b5cf6" strokeWidth={1.5} fill="transparent" dot={false} />
                <Area type="monotone" dataKey="interaction" name="互动热度" stroke="#f59e0b" strokeWidth={1.5} fill="transparent" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ═══ 第二行：教学状态 + 资源利用率 + 互动方式（三列） ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 教师教学状态趋势 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Mic size={16} className="text-emerald-500" />
            <h3 className="text-sm font-semibold text-slate-700">教师教学状态趋势</h3>
          </div>
          <div className="p-4 space-y-3">
            {/* 讲授语速 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 flex items-center gap-1"><Play size={12} /> 讲授语速</span>
                <span className="font-semibold text-slate-700">{currentTeaching?.pace ?? 70}%</span>
              </div>
              <div className="bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${currentTeaching?.pace ?? 70}%` }} />
              </div>
            </div>
            {/* 情绪饱满度 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 flex items-center gap-1"><Star size={12} /> 情绪饱满度</span>
                <span className="font-semibold text-slate-700">{currentTeaching?.emotion ?? 72}%</span>
              </div>
              <div className="bg-slate-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${currentTeaching?.emotion ?? 72}%` }} />
              </div>
            </div>
            {/* 眼神交流 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 flex items-center gap-1"><Eye size={12} /> 眼神交流</span>
                <span className="font-semibold text-slate-700">{currentTeaching?.eyeContact ?? 68}%</span>
              </div>
              <div className="bg-slate-100 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${currentTeaching?.eyeContact ?? 68}%` }} />
              </div>
            </div>
            {/* 提问频次 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 flex items-center gap-1"><Headphones size={12} /> 提问频次</span>
                <span className="font-semibold text-slate-700">{currentTeaching?.questionRate ?? 12}次/节</span>
              </div>
              <div className="bg-slate-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (currentTeaching?.questionRate ?? 12) * 4)}%` }} />
              </div>
            </div>
            {/* 走动频次 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 flex items-center gap-1"><Users size={12} /> 走动频次</span>
                <span className="font-semibold text-slate-700">{currentTeaching?.movement ?? 15}次/节</span>
              </div>
              <div className="bg-slate-100 rounded-full h-2">
                <div className="bg-cyan-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (currentTeaching?.movement ?? 15) * 3)}%` }} />
              </div>
            </div>
          </div>
          {/* 迷你折线 */}
          <div className="px-4 pb-4">
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={teachingTrend.slice(0, 8)}>
                <Area type="monotone" dataKey="emotion" stroke="#3b82f6" strokeWidth={1.5} fill="transparent" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 课程资源利用率趋势 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <FileText size={16} className="text-purple-500" />
            <h3 className="text-sm font-semibold text-slate-700">课程资源利用率</h3>
          </div>
          <div className="p-4 space-y-3">
            {/* 课件完播率 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 flex items-center gap-1"><Video size={12} /> 课件完播率</span>
                <span className="font-semibold text-slate-700">{currentResource?.completion ?? 78}%</span>
              </div>
              <div className="bg-slate-100 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${currentResource?.completion ?? 78}%` }} />
              </div>
            </div>
            {/* 视频观看深度 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 flex items-center gap-1"><Play size={12} /> 视频观看深度</span>
                <span className="font-semibold text-slate-700">{currentResource?.watchDepth ?? 72}%</span>
              </div>
              <div className="bg-slate-100 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${currentResource?.watchDepth ?? 72}%` }} />
              </div>
            </div>
            {/* 难点回放率 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 flex items-center gap-1"><Repeat2 size={12} className="text-orange-500" /> 难点回放率</span>
                <span className="font-semibold text-slate-700">{currentResource?.replay ?? 35}%</span>
              </div>
              <div className="bg-slate-100 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${currentResource?.replay ?? 35}%` }} />
              </div>
            </div>
            {/* 资源下载量 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 flex items-center gap-1"><Download size={12} /> 资源下载</span>
                <span className="font-semibold text-slate-700">{currentResource?.download ?? 50}次</span>
              </div>
              <div className="bg-slate-100 rounded-full h-2">
                <div className="bg-teal-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, currentResource?.download ?? 50)}%` }} />
              </div>
            </div>
          </div>
          <div className="px-4 pb-4">
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={resourceTrend.slice(0, 8)}>
                <Area type="monotone" dataKey="completion" stroke="#8b5cf6" strokeWidth={1.5} fill="transparent" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 互动方式与热度趋势 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <MessageSquare size={16} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-700">互动方式与热度</h3>
          </div>
          <div className="p-4 space-y-3">
            {/* 小组讨论 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 flex items-center gap-1"><Users size={12} /> 小组讨论</span>
                <span className="font-semibold text-slate-700">{currentInteraction?.group ?? 68}分</span>
              </div>
              <div className="bg-slate-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${currentInteraction?.group ?? 68}%` }} />
              </div>
            </div>
            {/* 师生问答 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 flex items-center gap-1"><MessageSquare size={12} /> 师生问答</span>
                <span className="font-semibold text-slate-700">{currentInteraction?.qa ?? 10}次/节</span>
              </div>
              <div className="bg-slate-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (currentInteraction?.qa ?? 10) * 5)}%` }} />
              </div>
            </div>
            {/* 讨论区 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 flex items-center gap-1"><Globe size={12} /> 讨论区</span>
                <span className="font-semibold text-slate-700">{currentInteraction?.board ?? 35}条/周</span>
              </div>
              <div className="bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (currentInteraction?.board ?? 35))}%` }} />
              </div>
            </div>
            {/* 实时投票 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 flex items-center gap-1"><Radio size={12} /> 实时投票</span>
                <span className="font-semibold text-slate-700">{currentInteraction?.poll ?? 75}%</span>
              </div>
              <div className="bg-slate-100 rounded-full h-2">
                <div className="bg-cyan-500 h-2 rounded-full transition-all" style={{ width: `${currentInteraction?.poll ?? 75}%` }} />
              </div>
            </div>
            {/* 弹幕 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 flex items-center gap-1"><Zap size={12} /> 弹幕</span>
                <span className="font-semibold text-slate-700">{currentInteraction?.danmaku ?? 5}条/分</span>
              </div>
              <div className="bg-slate-100 rounded-full h-2">
                <div className="bg-pink-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (currentInteraction?.danmaku ?? 5) * 6)}%` }} />
              </div>
            </div>
          </div>
          <div className="px-4 pb-4">
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={interactionTrend.slice(0, 8)}>
                <Area type="monotone" dataKey="group" stroke="#f59e0b" strokeWidth={1.5} fill="transparent" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ═══ 第三行：风险标签 + 改善信号 + 系统监控 ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 风险标签 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            <h3 className="text-sm font-semibold text-slate-700">风险识别</h3>
          </div>
          <div className="p-5">
            {riskTags.length > 0 ? (
              <div className="space-y-2">
                {riskTags.map((tag, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-100">
                    <TrendingDown size={14} className="text-red-500 flex-shrink-0" />
                    <span className="text-xs text-red-700">{tag}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Shield size={32} className="text-emerald-400 mb-2" />
                <p className="text-sm text-emerald-600 font-medium">当前无风险项</p>
                <p className="text-xs text-slate-400 mt-1">所有维度均在健康范围内</p>
              </div>
            )}
          </div>
        </div>

        {/* 改善信号 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Award size={16} className="text-emerald-500" />
            <h3 className="text-sm font-semibold text-slate-700">改善信号</h3>
          </div>
          <div className="p-5">
            {improvementSignals.length > 0 ? (
              <div className="space-y-2">
                {improvementSignals.map((sig, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                    <TrendingUp size={14} className="text-emerald-500 flex-shrink-0" />
                    <span className="text-xs text-emerald-700">{sig}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Zap size={32} className="text-amber-400 mb-2" />
                <p className="text-sm text-amber-600 font-medium">暂无显著改善信号</p>
                <p className="text-xs text-slate-400 mt-1">持续观察中</p>
              </div>
            )}
          </div>
        </div>

        {/* 系统运行监控 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Cpu size={16} className="text-blue-500" />
            <h3 className="text-sm font-semibold text-slate-700">系统运行监控</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">AI 推理延迟</span>
              <span className="text-sm font-mono text-blue-600">{currentLatency} ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">GPU 利用率</span>
              <span className="text-sm font-mono text-purple-600">{currentGpu}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">并发处理</span>
              <span className="text-sm font-mono text-emerald-600">{currentConcurrency}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">数据吞吐量</span>
              <span className="text-sm font-mono text-amber-600">{currentThroughput} KB/s</span>
            </div>
            <div className="pt-3 border-t border-slate-100">
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
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 第四行：双列布局 — 数据流 + 实时日志 ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：实时数据吞吐量 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio size={16} className="text-blue-500" />
              <h3 className="text-sm font-semibold text-slate-700">多源数据融合吞吐</h3>
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

        {/* 右侧：实时多模态数据流 */}
        <div className="bg-slate-900 rounded-xl border border-slate-700 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-200">课程画像实时数据流</h3>
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
            className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0"
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
          <div className="px-4 py-2 border-t border-slate-700 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>队列深度: {liveLogs.length}/50</span>
            <span>吞吐: {currentThroughput} KB/s</span>
            <span>延迟: {currentLatency}ms</span>
          </div>
        </div>
      </div>

      {/* ═══ 底部：课程模块 + 生命力趋势 ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 课程模块 */}
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

        {/* 诊断告警 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            课程健康预警
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

        {/* 课程生命力趋势 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <HeartPulse size={16} className="text-purple-500" />
              课程生命力趋势
            </h3>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={vitalityScores.length > 0 ? vitalityScores : []}>
                <defs>
                  <linearGradient id="vitalityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Area type="monotone" dataKey="overall" name="总体" stroke="#8b5cf6" strokeWidth={2} fill="url(#vitalityGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
