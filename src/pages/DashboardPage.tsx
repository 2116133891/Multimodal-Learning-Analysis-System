// ===== 企业级数字驾驶舱 — 课程全局画像与健康度监控 =====
// 设计参考：Vercel Dashboard · Tremor React · Linear App
// 核心特性：毛玻璃卡片 · Sparkline 微图表 · Staggered 入场动画 · 等宽数字 · 渐进层次
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../hooks/useStore';
import StatCard from '../components/StatCard';
import CardChart from '../components/CardChart';
import RechartsCard from '../components/RechartsCard';
import AICopilot from '../components/AICopilot';
import ActionableInsightsBanner from '../components/ActionableInsightsBanner';
import SmartCoursewareGenerator from '../components/SmartCoursewareGenerator';
import {
  TrendingUp, TrendingDown, Minus, Users, AlertTriangle, Target, Activity,
  HeartPulse, Repeat2, Cpu, Database, Zap, Globe, Shield, Eye, Radio,
  BarChart3, Layers, Network, Mic, BookOpen, MessageSquare,
  Play, Headphones, Video, FileText, Download, Thermometer,
  Award, Star, Sparkles, ArrowUpRight, ArrowDownRight, Brain, Lightbulb,
  Clock, BarChart3 as BarChart3Icon, LineChart, PieChart,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Legend, BarChart, Bar, PieChart as RPieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

// ═══════════════════════════════════════════════════════════
//  辅助函数 — 数据生成
// ═══════════════════════════════════════════════════════════

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

// 系统运行模拟数据
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

// 实时日志
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

// ═══════════════════════════════════════════════════════════
//  子组件 — 迷你 Sparkline
// ═══════════════════════════════════════════════════════════

function MiniSparkline({ data, color, height = 32 }: { data: number[]; color: string; height?: number }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const isUp = data[data.length - 1] >= data[0];

  return (
    <svg viewBox="0 0 100 100" className="w-full" style={{ height: `${height}px`, preserveAspectRatio: 'none' }}>
      <defs>
        <linearGradient id={`spark-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon
        points={`0,100 ${points} 100,100`}
        fill={`url(#spark-grad-${color.replace('#', '')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {/* 末端圆点 */}
      <circle
        cx="100"
        cy={100 - ((data[data.length - 1] - min) / range) * 100}
        r="3"
        fill={color}
        vectorEffect="non-scaling-stroke"
        className={isUp ? 'animate-soft-pulse' : ''}
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════
//  子组件 — 进度环
// ═══════════════════════════════════════════════════════════

function ProgressRing({ value, max = 100, size = 48, color = '#3b82f6', label }: {
  value: number; max?: number; size?: number; color?: string; label?: string;
}) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / max) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={4} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="progress-ring"
        />
      </svg>
      {label && <span className="text-[10px] text-slate-400 font-medium">{label}</span>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  子组件 — 指标行（Bar + Label）
// ═══════════════════════════════════════════════════════════

function MetricRow({ icon, label, value, unit, color, trend }: {
  icon: React.ReactNode; label: string; value: number; unit: string; color: string; trend?: 'up' | 'down' | 'stable';
}) {
  const pct = Math.min(100, Math.max(0, value));
  const barColor = trend === 'up' ? 'from-emerald-400 to-emerald-500' :
                   trend === 'down' ? 'from-red-400 to-red-500' :
                   `from-${color}-400 to-${color}-500`;

  return (
    <div className="group/metric">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-slate-500 flex items-center gap-1.5 group-hover/metric:text-slate-600 transition-colors">
          <span className="w-4 h-4 flex items-center justify-center text-slate-400">{icon}</span>
          {label}
        </span>
        <span className="font-semibold tabular-nums text-slate-700">
          {value}<span className="text-[10px] text-slate-400 ml-0.5">{unit}</span>
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  主页面
// ═══════════════════════════════════════════════════════════

export default function DashboardPage() {
  const { courseInfo, records, alerts, vitalityScores, courseProfiles, loading, fetchData } = useStore();
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
  useEffect(() => { fetchData(); }, [fetchData]);

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
      const newLog = { time: timeStr, msg: generateLogMessage(), category: logTemplates[Math.floor(Math.random() * logTemplates.length)].category };
      setLiveLogs(prev => { const next = [...prev, newLog]; return next.slice(-50); });
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
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, []);
  useEffect(() => { scrollToEnd(); }, [liveLogs, scrollToEnd]);

  // 日志颜色映射
  const categoryColor: Record<string, string> = {
    teaching: 'text-blue-400', resource: 'text-emerald-400', interaction: 'text-amber-400',
    health: 'text-purple-400', improvement: 'text-cyan-400', alert: 'text-red-500',
    fusion: 'text-indigo-400', stream: 'text-slate-400',
  };
  const categoryBadge: Record<string, string> = {
    teaching: 'bg-blue-500/10 text-blue-400 border-blue-500/20', resource: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    interaction: 'bg-amber-500/10 text-amber-400 border-amber-500/20', health: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    improvement: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', alert: 'bg-red-500/20 text-red-500 border-red-500/40',
    fusion: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', stream: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  // 当前周画像数据
  const currentProfile = profileHealthData[selectedWeek - 1];
  const currentTeaching = teachingTrend[selectedWeek - 1];
  const currentResource = resourceTrend[selectedWeek - 1];
  const currentInteraction = interactionTrend[selectedWeek - 1];

  // 为 StatCard sparkline 准备数据
  const sparklineHealth = useMemo(() => profileHealthData.slice(0, selectedWeek).map(d => ({ value: d.health })), [profileHealthData, selectedWeek]);
  const sparklineTeaching = useMemo(() => teachingTrend.slice(0, selectedWeek).map(d => ({ value: d.emotion })), [teachingTrend, selectedWeek]);
  const sparklineResource = useMemo(() => resourceTrend.slice(0, selectedWeek).map(d => ({ value: d.completion })), [resourceTrend, selectedWeek]);
  const sparklineInteraction = useMemo(() => interactionTrend.slice(0, selectedWeek).map(d => ({ value: d.group })), [interactionTrend, selectedWeek]);

  // 风险/改善标签
  const riskTags = currentProfile
    ? [
        ...(currentTeaching.pace < 60 ? ['讲授语速偏慢'] : []),
        ...(currentResource.completion < 60 ? ['课件完播率偏低'] : []),
        ...(currentInteraction.group < 40 ? ['小组讨论冷淡'] : []),
        ...(currentTeaching.emotion < 60 ? ['情绪饱满度不足'] : []),
      ]
    : [];
  const improvementSignals = currentProfile
    ? [
        ...(currentTeaching.eyeContact > 70 ? ['眼神交流充分'] : []),
        ...(currentResource.watchDepth > 70 ? ['视频学习深度良好'] : []),
        ...(currentInteraction.poll > 70 ? ['实时投票参与率高'] : []),
        ...(currentInteraction.group > 70 ? ['小组讨论活跃'] : []),
      ]
    : [];

  // 生命力 sparkline
  const vitalitySparkline = useMemo(() =>
    vitalityScores.slice(0, selectedWeek).map(d => ({ value: d.overall })),
    [vitalityScores, selectedWeek]
  );

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

  // ── Stagger container variants ──
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ═══════════════════════════════════════════════════════
          顶部标题栏
          ═══════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">课程全局画像</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {courseInfo?.name} · {courseInfo?.semester} · {courseInfo?.type}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* 实时监控徽章 */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/5 border border-emerald-200/40 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-semibold text-emerald-700">实时监控中</span>
          </span>
          {/* 周选择器 */}
          <select
            value={selectedWeek}
            onChange={e => setSelectedWeek(Number(e.target.value))}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-sm bg-white/80 backdrop-blur-sm text-slate-600 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all cursor-pointer appearance-none pr-8"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
          >
            {Array.from({ length: 16 }, (_, i) => (
              <option key={i + 1} value={i + 1}>第{i + 1}周</option>
            ))}
          </select>
          {/* 刷新时间 */}
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">最后刷新</p>
            <p className="text-xs font-mono text-slate-500 tabular-nums">
              {new Date().toLocaleTimeString('zh-CN', { hour12: false })}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════
          AI 微级行动建议横幅
          ═══════════════════════════════════════════════════════ */}
      <ActionableInsightsBanner
        alerts={alerts}
        suggestions={[]}
        vitalityScores={vitalityScores}
        courseProfiles={courseProfiles || []}
        selectedWeek={selectedWeek}
      />

      {/* ═══════════════════════════════════════════════════════
          核心指标卡片 — 5 列等宽 Grid
          ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div variants={itemVariants}>
          <StatCard
            label="课程综合健康度"
            value={currentProfile?.health ?? healthScore}
            subtitle="满分 100"
            icon={<Thermometer size={16} />}
            trend="up"
            trendValue={`+${(currentProfile?.health ?? 75) - 55}`}
            color="blue"
            sparklineData={sparklineHealth}
            accentBorder
            delay={0}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatCard
            label="教师教学状态"
            value={currentTeaching?.emotion ?? 72}
            subtitle={`语速 ${(currentTeaching?.pace ?? 70)} · 提问 ${(currentTeaching?.questionRate ?? 12)}次/节`}
            icon={<Mic size={16} />}
            trend="up"
            trendValue="+3.2%"
            color="emerald"
            sparklineData={sparklineTeaching}
            accentBorder
            delay={1}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatCard
            label="课程资源利用率"
            value={currentResource?.completion ?? 78}
            subtitle={`完播率 ${(currentResource?.completion ?? 78)}% · 下载 ${(currentResource?.download ?? 50)}次`}
            icon={<BookOpen size={16} />}
            trend="up"
            trendValue="+5.1%"
            color="purple"
            sparklineData={sparklineResource}
            accentBorder
            delay={2}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatCard
            label="互动方式热度"
            value={currentInteraction?.group ?? 68}
            subtitle={`讨论 ${(currentInteraction?.group ?? 68)} · 投票 ${(currentInteraction?.poll ?? 75)}%`}
            icon={<MessageSquare size={16} />}
            trend="up"
            trendValue="+2.8%"
            color="amber"
            sparklineData={sparklineInteraction}
            accentBorder
            delay={3}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatCard
            label="AI 多源融合"
            value={currentLatency}
            subtitle={`GPU ${(currentGpu)}% · 并发 ${currentConcurrency}`}
            icon={<Cpu size={16} />}
            trend="down"
            trendValue={`-${(14.2 - currentLatency).toFixed(1)}ms`}
            color="cyan"
            delay={4}
          />
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          第一行双列：雷达图 + 健康度趋势
          ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <RechartsCard title="课程三维画像雷达" description={`第${selectedWeek}周多模态能力维度`} accent="blue" delay={5}>
            <ResponsiveContainer width="100%" height={380}>
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} />
                <Radar
                  name="课程画像" dataKey="A" stroke="#3b82f6" strokeWidth={2.5} fill="#3b82f6" fillOpacity={0.15}
                />
                <RTooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', marginTop: '8px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </RechartsCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <RechartsCard title="课程健康度趋势" description="16 周综合健康度与分项走势" accent="emerald" delay={6}>
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
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', fontSize: '12px' }}
                  formatter={(value: number, name: string) => [`${value}分`, name === 'health' ? '综合健康度' : name === 'teaching' ? '教学状态' : name === 'resource' ? '资源利用' : '互动热度']}
                />
                <Area type="monotone" dataKey="health" name="综合健康度" stroke="#10b981" strokeWidth={2.5} fill="url(#healthGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="teaching" name="教学状态" stroke="#3b82f6" strokeWidth={1.5} fill="transparent" dot={false} strokeDasharray="4 3" />
                <Area type="monotone" dataKey="resource" name="资源利用" stroke="#8b5cf6" strokeWidth={1.5} fill="transparent" dot={false} strokeDasharray="4 3" />
                <Area type="monotone" dataKey="interaction" name="互动热度" stroke="#f59e0b" strokeWidth={1.5} fill="transparent" dot={false} strokeDasharray="4 3" />
              </AreaChart>
            </ResponsiveContainer>
          </RechartsCard>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          第二行：教学 + 资源 + 互动（三列）
          ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 教师教学状态 */}
        <motion.div variants={itemVariants}>
          <RechartsCard title="教师教学状态" accent="emerald" delay={7}>
            <div className="space-y-4">
              <MetricRow icon={<Play size={14} />} label="讲授语速" value={currentTeaching?.pace ?? 70} unit="%" color="emerald" trend="up" />
              <MetricRow icon={<Star size={14} />} label="情绪饱满度" value={currentTeaching?.emotion ?? 72} unit="%" color="blue" trend="up" />
              <MetricRow icon={<Eye size={14} />} label="眼神交流" value={currentTeaching?.eyeContact ?? 68} unit="%" color="purple" trend="up" />
              <MetricRow icon={<Headphones size={14} />} label="提问频次" value={(currentTeaching?.questionRate ?? 12) * 4} unit="%" color="amber" trend="stable" />
              <MetricRow icon={<Users size={14} />} label="走动频次" value={(currentTeaching?.movement ?? 15) * 3} unit="%" color="cyan" trend="up" />
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <MiniSparkline data={teachingTrend.slice(0, 8).map(d => d.emotion)} color="#10b981" height={48} />
            </div>
          </RechartsCard>
        </motion.div>

        {/* 课程资源利用率 */}
        <motion.div variants={itemVariants}>
          <RechartsCard title="课程资源利用率" accent="purple" delay={8}>
            <div className="space-y-4">
              <MetricRow icon={<Video size={14} />} label="课件完播率" value={currentResource?.completion ?? 78} unit="%" color="purple" trend="up" />
              <MetricRow icon={<Play size={14} />} label="视频观看深度" value={currentResource?.watchDepth ?? 72} unit="%" color="indigo" trend="up" />
              <MetricRow icon={<Repeat2 size={14} />} label="难点回放率" value={currentResource?.replay ?? 35} unit="%" color="amber" trend="down" />
              <MetricRow icon={<Download size={14} />} label="资源下载量" value={Math.min(100, currentResource?.download ?? 50)} unit="%" color="teal" trend="up" />
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <MiniSparkline data={resourceTrend.slice(0, 8).map(d => d.completion)} color="#8b5cf6" height={48} />
            </div>
          </RechartsCard>
        </motion.div>

        {/* 互动方式热度 */}
        <motion.div variants={itemVariants}>
          <RechartsCard title="互动方式与热度" accent="amber" delay={9}>
            <div className="space-y-4">
              <MetricRow icon={<Users size={14} />} label="小组讨论" value={currentInteraction?.group ?? 68} unit="分" color="amber" trend="up" />
              <MetricRow icon={<MessageSquare size={14} />} label="师生问答" value={Math.min(100, (currentInteraction?.qa ?? 10) * 5)} unit="%" color="blue" trend="up" />
              <MetricRow icon={<Globe size={14} />} label="讨论区" value={Math.min(100, currentInteraction?.board ?? 35)} unit="%" color="emerald" trend="stable" />
              <MetricRow icon={<Radio size={14} />} label="实时投票" value={currentInteraction?.poll ?? 75} unit="%" color="cyan" trend="up" />
              <MetricRow icon={<Zap size={14} />} label="弹幕" value={Math.min(100, (currentInteraction?.danmaku ?? 5) * 6)} unit="%" color="pink" trend="stable" />
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <MiniSparkline data={interactionTrend.slice(0, 8).map(d => d.group)} color="#f59e0b" height={48} />
            </div>
          </RechartsCard>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          第三行：风险 + 改善 + 系统监控
          ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 风险标签 */}
        <motion.div variants={itemVariants}>
          <RechartsCard title="风险识别" accent="red" delay={10}>
            <div className="space-y-2.5">
              {riskTags.length > 0 ? (
                riskTags.map((tag, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-2.5 p-2.5 bg-red-50/60 rounded-xl border border-red-100/60"
                  >
                    <TrendingDown size={14} className="text-red-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-red-700">{tag}</span>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Shield size={28} className="text-emerald-400 mb-2 opacity-60" />
                  <p className="text-sm text-emerald-600 font-medium">当前无风险项</p>
                  <p className="text-xs text-slate-400 mt-0.5">所有维度均在健康范围内</p>
                </div>
              )}
            </div>
          </RechartsCard>
        </motion.div>

        {/* 改善信号 */}
        <motion.div variants={itemVariants}>
          <RechartsCard title="改善信号" accent="emerald" delay={11}>
            <div className="space-y-2.5">
              {improvementSignals.length > 0 ? (
                improvementSignals.map((sig, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-2.5 p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100/60"
                  >
                    <TrendingUp size={14} className="text-emerald-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-emerald-700">{sig}</span>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Lightbulb size={28} className="text-amber-400 mb-2 opacity-60" />
                  <p className="text-sm text-amber-600 font-medium">暂无显著改善信号</p>
                  <p className="text-xs text-slate-400 mt-0.5">持续观察中</p>
                </div>
              )}
            </div>
          </RechartsCard>
        </motion.div>

        {/* 系统运行监控 */}
        <motion.div variants={itemVariants}>
          <RechartsCard title="系统运行监控" accent="cyan" delay={12}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1.5"><Clock size={12} />AI 推理延迟</span>
                <span className="text-sm font-mono font-semibold tabular-nums text-blue-600">{currentLatency} <span className="text-xs text-slate-400">ms</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1.5"><Cpu size={12} />GPU 利用率</span>
                <span className="text-sm font-mono font-semibold tabular-nums text-purple-600">{currentGpu}<span className="text-xs text-slate-400">%</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1.5"><Network size={12} />并发处理</span>
                <span className="text-sm font-mono font-semibold tabular-nums text-emerald-600">{currentConcurrency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1.5"><Database size={12} />数据吞吐量</span>
                <span className="text-sm font-mono font-semibold tabular-nums text-amber-600">{currentThroughput} <span className="text-xs text-slate-400">KB/s</span></span>
              </div>

              {/* 24h 热力柱状图 */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">今日数据处理分布</p>
                <div className="flex gap-px h-12 items-end">
                  {Array.from({ length: 24 }, (_, h) => {
                    const height = Math.max(8, Math.sin(h / 24 * Math.PI * 2) * 80 + (Math.random() - 0.5) * 20);
                    const intensity = height > 60 ? 'bg-blue-500' : height > 35 ? 'bg-blue-400' : 'bg-blue-300';
                    return (
                      <motion.div
                        key={h}
                        className={`flex-1 rounded-sm ${intensity} opacity-60 hover:opacity-100 transition-opacity cursor-pointer`}
                        style={{ height: `${height}%` }}
                        whileHover={{ scaleY: 1.15 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </RechartsCard>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          第四行：数据流 + 实时日志
          ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 实时数据吞吐量 */}
        <motion.div variants={itemVariants}>
          <RechartsCard
            title="多源数据融合吞吐"
            description={`${currentThroughput} KB/s 实时吞吐`}
            accent="blue"
            delay={13}
            toolbar={
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-lg border border-blue-100">
                <Activity size={12} className="text-blue-500" />
                <span className="text-[11px] font-semibold text-blue-600 tabular-nums">{currentThroughput} KB/s</span>
              </span>
            }
          >
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
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', fontSize: '12px' }}
                  formatter={(value: number) => [`${value} KB/s`, '吞吐量']}
                />
                <Area
                  type="monotone" dataKey="throughput" name="throughput"
                  stroke="#3b82f6" strokeWidth={2.5} fill="url(#streamGrad)" dot={false}
                  activeDot={{ r: 5, strokeWidth: 0, fill: '#3b82f6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </RechartsCard>
        </motion.div>

        {/* 实时多模态数据流 — 暗色主题 */}
        <motion.div variants={itemVariants}>
          <div className="relative rounded-2xl border border-slate-700/60 bg-slate-900/80 backdrop-blur-xl shadow-sm overflow-hidden group hover:border-slate-600/60 transition-colors duration-300">
            {/* 顶部渐变条 */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500" />

            <div className="px-5 pt-4 pb-3 border-b border-slate-700/60 flex items-center justify-between">
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
              <span className="text-xs font-mono text-slate-500 tabular-nums">{liveLogs.length} 条</span>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1.5 min-h-0 max-h-[340px]" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(71,85,105,0.3) transparent' }}>
              {liveLogs.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-xs text-slate-600">正在连接数据流...</p>
                </div>
              )}
              <AnimatePresence mode="popLayout">
                {liveLogs.map((log, idx) => (
                  <motion.div
                    key={`${log.time}-${idx}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-2 text-xs font-mono"
                  >
                    <span className="text-slate-600 flex-shrink-0 tabular-nums">{log.time}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 border ${categoryBadge[log.category] || categoryBadge.stream}`}>
                      {log.category}
                    </span>
                    <span className="text-slate-400 leading-relaxed truncate">{log.msg}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* 底部状态栏 */}
            <div className="px-4 py-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 font-mono tabular-nums">
              <span>队列: {liveLogs.length}/50</span>
              <span>吞吐: {currentThroughput} KB/s</span>
              <span>延迟: {currentLatency}ms</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          底部：课程模块 + 诊断告警 + 生命力趋势 + AI 课件生成
          ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 课程模块 */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <RechartsCard title="课程模块" accent="indigo" delay={14}>
            <div className="space-y-2.5">
              {courseInfo?.modules.map((mod, i) => (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-100/80 hover:bg-slate-50 hover:border-slate-200/80 transition-colors duration-200"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{mod.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{mod.description}</p>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg border border-blue-100/80 whitespace-nowrap">
                    第{mod.weekRange[0]}–{mod.weekRange[1]}周
                  </span>
                </motion.div>
              ))}
            </div>
          </RechartsCard>
        </motion.div>

        {/* 诊断告警 */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <RechartsCard title="课程健康预警" accent="amber" delay={15}>
            <div className="space-y-2.5">
              {alerts.slice(0, 5).map((alert, i) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  className="flex items-start gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100/80 hover:bg-slate-50 transition-colors duration-200"
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    alert.severity === 'high' ? 'bg-red-500 shadow-sm shadow-red-500/40' :
                    alert.severity === 'medium' ? 'bg-amber-400' : 'bg-yellow-300'
                  }`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700">
                      第{alert.week}周 · {alert.title}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed line-clamp-2">{alert.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </RechartsCard>
        </motion.div>

        {/* 课程生命力趋势 */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <RechartsCard title="课程生命力趋势" description="五维生命力综合评分" accent="purple" delay={16}>
            <div className="flex items-center gap-6 mb-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tabular-nums text-gradient-purple">{vitalityScores[selectedWeek - 1]?.overall ?? 75}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <MiniSparkline data={vitalitySparkline} color="#8b5cf6" height={40} />
            </div>
            <ResponsiveContainer width="100%" height={130}>
              <AreaChart data={vitalityScores.slice(0, selectedWeek)}>
                <defs>
                  <linearGradient id="vitalityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', fontSize: '12px' }} />
                <Area type="monotone" dataKey="overall" name="总体" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#vitalityGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </RechartsCard>
        </motion.div>

        {/* AI 智能课件生成入口 */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <SmartCoursewareGenerator suggestions={[]} selectedWeek={selectedWeek} />
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          AI 课程数据助教 — 悬浮聊天入口
          ═══════════════════════════════════════════════════════ */}
      <AICopilot
        suggestions={[]}
        alerts={alerts}
        healthScore={healthScore}
        selectedWeek={selectedWeek}
      />
    </motion.div>
  );
}
