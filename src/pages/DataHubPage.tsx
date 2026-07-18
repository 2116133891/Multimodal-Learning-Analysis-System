// ===== 数据源管理中心 =====
// 核心概念：统一管理多源数据接入 — 学习通、智慧树、线下监控、自有平台等
// 功能：可视化配置数据源、查看接入状态、数据质量监控、实时连接测试
import { useEffect, useState } from 'react';
import { useStore } from '../hooks/useStore';
import RechartsCard from '../components/RechartsCard';
import {
  Database, CheckCircle, XCircle, Wifi, WifiOff,
  Settings, RefreshCw, Plus, Trash2, Eye, Edit3,
  Shield, AlertCircle, Activity, Globe, Monitor,
  Video, MessageSquare, BookOpen, Camera, Upload,
  ArrowRight, ExternalLink, Loader2,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  Legend,
} from 'recharts';

// ── 数据源类型定义 ──────────────────────────────────────────
interface DataSourceConfig {
  id: string;
  name: string;
  type: 'xuexitong' | 'zhihuishu' | 'camera' | 'custom' | 'lms' | 'survey';
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
  bgColor: string;
  borderColor: string;
  status: 'connected' | 'disconnected' | 'testing' | 'error';
  lastSync: string;
  recordCount: number;
  quality: number;
  // 配置字段
  config: Record<string, string | number | boolean>;
}

// ── 默认数据源配置 ──────────────────────────────────────────
const defaultDataSources: DataSourceConfig[] = [
  {
    id: 'ds-xuexitong',
    name: '学习通 (超星)',
    type: 'xuexitong',
    label: '学习通',
    description: '超星学习通平台 — 视频学习、在线测试、讨论区、作业提交',
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    status: 'connected',
    lastSync: '2025-06-15 14:32:00',
    recordCount: 12580,
    quality: 94,
    config: { apiUrl: 'https://mooc1-api.chaoxing.com', syncInterval: '5min', enabled: true },
  },
  {
    id: 'ds-zhihuishu',
    name: '智慧树',
    type: 'zhihuishu',
    label: '智慧树',
    description: '智慧树平台 — 视频课程、随堂互动、学分课程数据',
    icon: Globe,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    status: 'connected',
    lastSync: '2025-06-15 14:28:00',
    recordCount: 8920,
    quality: 91,
    config: { apiUrl: 'https://api.zhihuishu.com', syncInterval: '10min', enabled: true },
  },
  {
    id: 'ds-camera',
    name: '线下监控摄像头',
    type: 'camera',
    label: '摄像头',
    description: '教室监控视频流 — 微表情分析、抬头率、走动轨迹、课堂行为识别',
    icon: Camera,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    status: 'connected',
    lastSync: '2025-06-15 14:35:00',
    recordCount: 45200,
    quality: 88,
    config: { rtspUrl: 'rtsp://camera-classroom-01:554/stream', fps: 30, enabled: true },
  },
  {
    id: 'ds-lms',
    name: '自有教学平台',
    type: 'lms',
    label: '自有平台',
    description: '学校自建 LMS 平台 — 学习行为、成绩、考勤、讨论区',
    icon: Database,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    status: 'connected',
    lastSync: '2025-06-15 14:30:00',
    recordCount: 23450,
    quality: 96,
    config: { apiUrl: '/api/internal/lms', syncInterval: '1min', enabled: true },
  },
  {
    id: 'ds-custom',
    name: '自定义数据源',
    type: 'custom',
    label: '自定义',
    description: '通过 RESTful API / CSV / Excel 导入的任意数据源',
    icon: Settings,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    status: 'disconnected',
    lastSync: '-',
    recordCount: 0,
    quality: 0,
    config: { format: 'api', enabled: false },
  },
  {
    id: 'ds-survey',
    name: '问卷调查平台',
    type: 'survey',
    label: '问卷',
    description: '问卷星 / 腾讯问卷 — 学生满意度、学习反馈、教学评价',
    icon: MessageSquare,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    status: 'disconnected',
    lastSync: '-',
    recordCount: 0,
    quality: 0,
    config: { platform: 'wjx', enabled: false },
  },
];

// ── 数据流趋势模拟 ──────────────────────────────────────────
function generateDataSourceTrend() {
  const data = [];
  for (let week = 1; week <= 16; week++) {
    data.push({
      week: `第${week}周`,
      xuexitong: Math.round(600 + week * 120 + (Math.random() - 0.4) * 200),
      zhihuishu: Math.round(400 + week * 80 + (Math.random() - 0.4) * 150),
      camera: Math.round(2000 + week * 200 + (Math.random() - 0.4) * 400),
      lms: Math.round(800 + week * 150 + (Math.random() - 0.4) * 250),
    });
  }
  return data;
}

const PIE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];

export default function DataHubPage() {
  const { records, fetchData } = useStore();
  const [dataSources, setDataSources] = useState<DataSourceConfig[]>(defaultDataSources);
  const [dataSourceTrend] = useState(generateDataSourceTrend);
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingSource, setTestingSource] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 总记录数
  const totalRecords = dataSources.reduce((s, ds) => s + ds.recordCount, 0);
  const connectedCount = dataSources.filter(ds => ds.status === 'connected').length;
  const avgQuality = Math.round(dataSources.filter(ds => ds.status === 'connected').reduce((s, ds) => s + ds.quality, 0) / Math.max(connectedCount, 1));

  // 测试连接
  const handleTestConnection = async (id: string) => {
    setTestingSource(id);
    await new Promise(r => setTimeout(r, 2000));
    setTestingSource(null);
    setDataSources(prev => prev.map(ds =>
      ds.id === id ? { ...ds, status: 'connected' as const, lastSync: new Date().toLocaleString('zh-CN') } : ds
    ));
  };

  // 切换启用/禁用
  const toggleSource = (id: string) => {
    setDataSources(prev => prev.map(ds =>
      ds.id === id
        ? { ...ds, status: ds.status === 'connected' ? 'disconnected' as const : 'connected' as const }
        : ds
    ));
  };

  // 删除数据源
  const deleteSource = (id: string) => {
    setDataSources(prev => prev.filter(ds => ds.id !== id));
  };

  // 添加数据源
  const handleAddSource = () => {
    const newId = `ds-custom-${Date.now()}`;
    setDataSources(prev => [...prev, {
      id: newId,
      name: '新数据源',
      type: 'custom',
      label: '新数据源',
      description: '自定义数据源接入',
      icon: Database,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      status: 'disconnected',
      lastSync: '-',
      recordCount: 0,
      quality: 0,
      config: { enabled: false },
    }]);
    setShowAddModal(false);
  };

  // 数据源类型分布
  const typeDistribution = [
    { name: '学习通', value: 12580 },
    { name: '智慧树', value: 8920 },
    { name: '摄像头', value: 45200 },
    { name: '自有平台', value: 23450 },
  ];

  return (
    <div className="space-y-6">
      {/* ── 顶部标题栏 ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">数据源管理中心</h2>
          <p className="text-sm text-slate-500 mt-1">
            统一管理多源数据接入 · 学习通 · 智慧树 · 线下监控 · 自有平台 · 自定义数据源
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => dataSources.forEach(ds => ds.status === 'connected' && handleTestConnection(ds.id))}
            className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} />
            全部重连
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} />
            添加数据源
          </button>
        </div>
      </div>

      {/* ── 概览统计卡片 ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '已接入数据源', value: `${connectedCount}/${dataSources.length}`, icon: Wifi, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: '总数据记录数', value: totalRecords.toLocaleString(), icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: '平均数据质量', value: `${avgQuality}%`, icon: Shield, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: '实时数据流', value: '活跃', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-100' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
              <div className={`p-3 ${stat.bg} rounded-lg`}>
                <Icon size={22} className={stat.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 数据源卡片网格 ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dataSources.map((ds) => {
          const Icon = ds.icon;
          return (
            <div
              key={ds.id}
              className={`bg-white rounded-xl border-2 ${ds.borderColor} shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer`}
              onClick={() => setShowDetail(showDetail === ds.id ? null : ds.id)}
            >
              {/* 状态条 */}
              <div className={`h-1 ${ds.status === 'connected' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : ds.status === 'testing' ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-slate-200'}`} />

              <div className="p-5">
                {/* 头部 */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${ds.bgColor}`}>
                      <Icon size={20} className={ds.color} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{ds.name}</h4>
                      <p className="text-[10px] text-slate-400">{ds.label}</p>
                    </div>
                  </div>
                  {/* 状态徽章 */}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    ds.status === 'connected' ? 'bg-emerald-100 text-emerald-700' :
                    ds.status === 'testing' ? 'bg-amber-100 text-amber-700' :
                    ds.status === 'error' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {ds.status === 'connected' ? (
                      <><CheckCircle size={10} /> 已连接</>
                    ) : ds.status === 'testing' ? (
                      <><Loader2 size={10} className="animate-spin" /> 测试中</>
                    ) : ds.status === 'error' ? (
                      <><XCircle size={10} /> 错误</>
                    ) : (
                      <><WifiOff size={10} /> 未连接</>
                    )}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-4 leading-relaxed">{ds.description}</p>

                {/* 统计数据 */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <p className="text-sm font-bold text-slate-700">{ds.recordCount.toLocaleString()}</p>
                    <p className="text-[9px] text-slate-400">记录数</p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <p className="text-sm font-bold text-slate-700">{ds.quality}%</p>
                    <p className="text-[9px] text-slate-400">质量</p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <p className="text-[10px] font-medium text-slate-600 truncate">{ds.lastSync !== '-' ? ds.lastSync.split(' ')[1] : '-'}</p>
                    <p className="text-[9px] text-slate-400">最后同步</p>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleTestConnection(ds.id); }}
                    className="flex-1 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
                    disabled={testingSource === ds.id}
                  >
                    {testingSource === ds.id ? <Loader2 size={12} className="animate-spin" /> : <Wifi size={12} />}
                    测试连接
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSource(ds.id); }}
                    className={`py-1.5 px-3 text-xs text-white rounded-lg transition-colors flex items-center gap-1 ${
                      ds.status === 'connected' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
                    }`}
                  >
                    {ds.status === 'connected' ? '断开' : '启用'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSource(ds.id); }}
                    className="py-1.5 px-2 text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 数据流趋势 + 类型分布 ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 各数据源流入趋势 */}
        <div className="lg:col-span-2">
          <RechartsCard title="多源数据流入趋势（16周）" description="学习通 · 智慧树 · 摄像头 · 自有平台" accent="blue">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={dataSourceTrend}>
                <defs>
                  <linearGradient id="xxtGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                  <linearGradient id="zhsGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.15} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                  <linearGradient id="camGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient>
                  <linearGradient id="lmsGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="xuexitong" name="学习通" stroke="#3b82f6" strokeWidth={2} fill="url(#xxtGrad)" dot={false} />
                <Area type="monotone" dataKey="zhihuishu" name="智慧树" stroke="#10b981" strokeWidth={2} fill="url(#zhsGrad)" dot={false} />
                <Area type="monotone" dataKey="camera" name="摄像头" stroke="#8b5cf6" strokeWidth={2} fill="url(#camGrad)" dot={false} />
                <Area type="monotone" dataKey="lms" name="自有平台" stroke="#f59e0b" strokeWidth={2} fill="url(#lmsGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </RechartsCard>
        </div>

        {/* 数据源类型分布 */}
        <div>
          <RechartsCard title="数据源类型分布" accent="emerald">
            <div className="w-full h-87.5">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {typeDistribution.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RTooltip formatter={(value: number) => [`${value.toLocaleString()} 条`, '记录数']} />
                  <Legend formatter={(value: string) => <span className="text-xs text-slate-600">{value}</span>} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </RechartsCard>
        </div>
      </div>

      {/* ── 数据质量对比 ───────────────────────────────────── */}
      <RechartsCard title="各数据源质量评分对比" accent="purple">
        <div className="w-full h-87.5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dataSources.filter(ds => ds.status === 'connected').map(ds => ({
                name: ds.label,
                quality: ds.quality,
                records: ds.recordCount,
              }))}
              margin={{ top: 10, right: 30, left: 20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
              <RTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Bar dataKey="quality" name="质量评分" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </RechartsCard>

      {/* ── 添加数据源模态框 ────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">添加新数据源</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">数据源名称</label>
                  <input
                    type="text"
                    placeholder="例如：课堂录像系统"
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">数据源类型</label>
                  <select className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                    <option value="api">RESTful API 对接</option>
                    <option value="csv">CSV / Excel 文件导入</option>
                    <option value="database">数据库直连 (MySQL/PostgreSQL)</option>
                    <option value="rtsp">RTSP 视频流</option>
                    <option value="webhook">Webhook 推送</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">接入地址 / 文件路径</label>
                  <input
                    type="text"
                    placeholder="https://api.example.com/data 或 /path/to/file.csv"
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">同步频率</label>
                  <select className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                    <option value="1min">每分钟</option>
                    <option value="5min">每5分钟</option>
                    <option value="10min">每10分钟</option>
                    <option value="1h">每小时</option>
                    <option value="manual">手动触发</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddSource}
                  className="px-5 py-2 text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-sm"
                >
                  <Plus size={14} />
                  添加数据源
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
