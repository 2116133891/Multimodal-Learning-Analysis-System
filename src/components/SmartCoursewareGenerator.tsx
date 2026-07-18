// ===== AI 智能课件生成入口组件 =====
// 设计参考：Notion AI · GitHub Copilot · Cursor Composer
// 功能：展示智能课件生成入口，支持选择薄弱知识点 → 一键生成课件大纲
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, FileText, CheckCircle, AlertCircle,
  X, ChevronRight, Loader2, Copy, TrendingDown, Target,
} from 'lucide-react';

interface WeakKnowledgePoint {
  id: string;
  module: string;
  name: string;
  score: number;
  evidence: string;
  metric: { label: string; value: string; unit: string };
}

// ── 从数据推导薄弱知识点 ──
function deriveWeakKnowledgePoints(selectedWeek: number, suggestions: any[]): WeakKnowledgePoint[] {
  return [
    {
      id: 'wk1',
      module: '色彩基础与原理',
      name: '色彩三要素（色相/明度/纯度）',
      score: 42,
      evidence: '线上视频困惑表情占比 42%（课程均值 12%），课前测验通过率仅 35%',
      metric: { label: '测验通过率', value: '35', unit: '%' },
    },
    {
      id: 'wk3',
      module: '风格探索与创新',
      name: '后印象派风格理解',
      score: 48,
      evidence: '视频完播率从 88% 骤降至 52%，"后印象派"段落重播率 67%',
      metric: { label: '视频完播率', value: '52', unit: '%' },
    },
    {
      id: 'wk2',
      module: '造型与构图',
      name: '透视基础与空间关系',
      score: 51,
      evidence: '30% 学生造型得分低于 70 分，视频分心率在第 6 周升至 42%',
      metric: { label: '造型得分', value: '62', unit: '分' },
    },
  ];
}

interface SmartCoursewareGeneratorProps {
  suggestions: any[];
  selectedWeek?: number;
}

export default function SmartCoursewareGenerator({ suggestions, selectedWeek = 16 }: SmartCoursewareGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outline, setOutline] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const weakPoints = deriveWeakKnowledgePoints(selectedWeek, suggestions);
  const selected = weakPoints[selectedIndex];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);

    const steps = [10, 25, 40, 55, 70, 85, 95, 100];
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 300));
      setProgress(step);
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    setOutline(`📋 **${selected.module} — ${selected.name} 补充课件大纲**

━━━ 模块一：概念导入（10 分钟）━━━
1.1 生活案例引入：自然界中的色彩三要素
   - 日出时分的色彩变化（色相）
   - 同一物体在不同光线下的明度差异
   - 颜料调和实验演示（纯度）
1.2 快速问答检测前置知识（3 题）

━━━ 模块二：核心知识讲解（20 分钟）━━━
2.1 色相环构建实践
   - 三原色 → 间色 → 复色的渐变演示
   - 交互式色相环拖拽练习
2.2 明度阶梯训练
   - 同一色相的 10 级明度渐变
   - 学生作品对比分析
2.3 纯度对视觉冲击力的影响
   - 高纯度 vs 低纯度作品鉴赏
   - 设计应用场景对比

━━━ 模块三：互动练习（15 分钟）━━━
3.1 小组任务：给定场景，选择合适色彩方案
3.2 实时投票：哪组配色最能传达指定情绪？
3.3 弹幕互动：分享生活中的色彩发现

━━━ 模块四：巩固与拓展（10 分钟）━━━
4.1 微课视频：色彩三要素在数字绘画中的应用
4.2 推荐资源：3 个在线色彩工具链接
4.3 课后挑战：用色彩三要素原理分析一幅名画

━━━ 配套资源 ━━━
- 交互式色相环工具
- 明度渐变练习模板（PSD）
- 色彩案例分析 PPT（15 页）
- 课后自测题库（20 题）`);

    setGenerated(true);
    setIsGenerating(false);
  };

  const handleReset = () => {
    setGenerated(false);
    setProgress(0);
    setOutline('');
    setCopied(false);
  };

  const handleCopyOutline = () => {
    navigator.clipboard.writeText(outline);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative h-full flex flex-col">
      <AnimatePresence mode="wait">
        {/* ═══ 入口卡片 ═══ */}
        {!generated && !isGenerating && (
          <motion.div
            key="entry"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50/80 via-white/90 to-violet-50/80 backdrop-blur-xl shadow-sm hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col h-full overflow-hidden"
          >
            {/* 顶部渐变装饰条 */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-violet-500 opacity-80" />

            {/* 头部 */}
            <div className="px-4 pt-3.5 pb-2.5 border-b border-indigo-100/60 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
                <Sparkles size={14} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-700">AI 智能课件生成</h4>
                <p className="text-[10px] text-slate-400">基于薄弱知识点自动生成课件大纲</p>
              </div>
            </div>

            {/* 薄弱知识点选择区 */}
            <div className="px-4 pt-3 pb-2 space-y-2">
              <div className="flex items-center gap-1.5">
                <Target size={11} className="text-indigo-400" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">薄弱知识点（点击切换）</span>
              </div>

              {/* 三个知识点卡片 */}
              <div className="grid grid-cols-3 gap-1.5">
                {weakPoints.map((wp, i) => (
                  <button
                    key={wp.id}
                    onClick={() => setSelectedIndex(i)}
                    className={`rounded-lg border p-2 text-left transition-all duration-200 ${
                      i === selectedIndex
                        ? 'border-indigo-300 bg-indigo-50/80 shadow-sm'
                        : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingDown size={10} className="text-red-400" />
                      <span className="text-[10px] font-bold text-red-500">{wp.score}</span>
                    </div>
                    <p className="text-[10px] font-medium text-slate-600 leading-tight line-clamp-2">{wp.name}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{wp.module}</p>
                  </button>
                ))}
              </div>

              {/* 选中知识点的详细数据 */}
              <div className="p-2.5 bg-white/70 rounded-lg border border-indigo-100/60">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold text-slate-700">{selected.name}</p>
                  <span className="text-[10px] px-2 py-0.5 bg-red-50 text-red-600 rounded-full font-medium border border-red-100">
                    得分 {selected.score}/100
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{selected.evidence}</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-md border border-slate-100">
                    <span className="text-[10px] text-slate-400">{selected.metric.label}</span>
                    <span className="text-xs font-bold text-slate-700">{selected.metric.value}{selected.metric.unit}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 生成按钮 */}
            <div className="px-4 pt-2 pb-4 mt-auto">
              <motion.button
                onClick={handleGenerate}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-xs font-medium shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:from-indigo-600 hover:to-violet-700 transition-all duration-300"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles size={14} />
                为「{selected.name}」生成课件大纲
                <ChevronRight size={14} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ═══ 生成中状态 ═══ */}
        {isGenerating && (
          <motion.div
            key="generating"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="relative rounded-2xl border border-indigo-200/60 bg-white/90 backdrop-blur-xl shadow-sm flex flex-col h-full overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-violet-500 opacity-80" />
            <div className="px-4 pt-3 pb-2.5 border-b border-indigo-100/60 flex items-center gap-2">
              <Loader2 size={14} className="text-indigo-500 animate-spin" />
              <h4 className="text-sm font-semibold text-slate-700">AI 生成中...</h4>
            </div>
            <div className="px-4 py-5 flex-1 flex flex-col items-center justify-center text-center space-y-3">
              <div className="relative w-14 h-14">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                  <circle
                    cx="32" cy="32" r="28" fill="none" stroke="url(#gen-grad)" strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="gen-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <p className="text-xs font-medium text-slate-600">正在分析「{selected.name}」</p>
              <p className="text-[10px] text-slate-400">生成课件大纲 · 设计互动环节 · 匹配配套资源</p>
              <p className="text-xs text-indigo-500 font-bold tabular-nums">{progress}%</p>
            </div>
          </motion.div>
        )}

        {/* ═══ 生成完成状态 ═══ */}
        {generated && outline && (
          <motion.div
            key="generated"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl border border-emerald-200/60 bg-white/90 backdrop-blur-xl shadow-sm flex flex-col h-full overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500 opacity-80" />
            <div className="px-4 pt-3 pb-2.5 border-b border-emerald-100/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500 text-white">
                  <CheckCircle size={14} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700">课件大纲已生成</h4>
                  <p className="text-[10px] text-slate-400">{selected.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <motion.button
                  onClick={handleGenerate}
                  className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-slate-600"
                  title="重新生成"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Loader2 size={14} className="animate-spin" />
                </motion.button>
                <motion.button
                  onClick={handleReset}
                  className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-slate-600"
                  title="关闭"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X size={14} />
                </motion.button>
              </div>
            </div>
            <div className="px-4 pt-3 pb-2 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(148,163,184,0.2) transparent' }}>
              <pre className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap font-sans">{outline}</pre>
            </div>
            <div className="px-4 py-2 border-t border-slate-100/80 flex items-center justify-between bg-slate-50/50">
              <span className="text-[10px] text-slate-400">
                包含 {outline.split('━━━').length - 1} 个模块 · 预计 55 分钟
              </span>
              <motion.button
                onClick={handleCopyOutline}
                disabled={copied}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-lg flex items-center gap-1.5 transition-all ${
                  copied
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                {copied ? '已复制' : '复制大纲'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
