// ===== AI 智能课件生成入口组件 =====
// 设计参考：Notion AI · GitHub Copilot · Cursor Composer
// 功能：展示智能课件生成入口，支持选择薄弱知识点 → 一键生成课件大纲
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Sparkles, FileText, CheckCircle, AlertCircle,
  X, ChevronRight, Loader2, Lightbulb, Target,
} from 'lucide-react';

interface WeakKnowledgePoint {
  id: string;
  module: string;
  name: string;
  score: number;
  evidence: string;
}

// ── 从数据推导薄弱知识点 ──
function deriveWeakKnowledgePoints(selectedWeek: number, suggestions: any[]): WeakKnowledgePoint[] {
  const points: WeakKnowledgePoint[] = [
    {
      id: 'wk1',
      module: '色彩基础与原理',
      name: '色彩三要素（色相/明度/纯度）',
      score: 42,
      evidence: '线上视频困惑表情占比 42%（课程均值 12%），课前测验通过率仅 35%',
    },
    {
      id: 'wk2',
      module: '造型与构图',
      name: '透视基础与空间关系',
      score: 51,
      evidence: '30% 学生造型得分低于 70 分，视频分心率在第 6 周升至 42%',
    },
    {
      id: 'wk3',
      module: '风格探索与创新',
      name: '后印象派风格理解',
      score: 48,
      evidence: '视频完播率从 88% 骤降至 52%，"后印象派"段落重播率 67%',
    },
  ];
  return points.sort((a, b) => a.score - b.score);
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

  const weakPoints = deriveWeakKnowledgePoints(selectedWeek, suggestions);
  const weakest = weakPoints[0];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);

    // 模拟 AI 生成进度
    const steps = [10, 25, 40, 55, 70, 85, 95, 100];
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 300));
      setProgress(step);
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    setOutline(`📋 **${weakest.module} — ${weakest.name} 补充课件大纲**

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
  };

  return (
    <div className="relative">
      {/* ── 入口卡片（未生成时显示） ── */}
      <AnimatePresence mode="wait">
        {!generated && !isGenerating && (
          <motion.div
            key="entry"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50/80 via-white/90 to-violet-50/80 backdrop-blur-xl p-5 shadow-sm hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-300"
          >
            {/* 头部 */}
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 flex-shrink-0">
                <Sparkles size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-800">AI 智能课件生成</h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded-md">NEW</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  基于本周薄弱知识点，自动生成补充课件大纲，形成教学改进闭环
                </p>
              </div>
            </div>

            {/* 薄弱知识点 */}
            <div className="mt-4 p-3 bg-white/70 rounded-xl border border-indigo-100/60">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertCircle size={12} className="text-red-400" />
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">本周最薄弱知识点</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{weakest.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{weakest.evidence}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-lg font-bold text-red-500 tabular-nums">{weakest.score}</p>
                  <p className="text-[10px] text-slate-400">/ 100</p>
                </div>
              </div>
            </div>

            {/* 生成按钮 */}
            <motion.button
              onClick={handleGenerate}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl font-medium text-sm shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:from-indigo-600 hover:to-violet-700 transition-all duration-300"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <FileText size={16} />
              根据薄弱知识点自动生成课件大纲
              <ChevronRight size={16} />
            </motion.button>

            {/* 功能亮点 */}
            <div className="mt-3 flex items-center gap-4 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle size={10} className="text-emerald-400" />
                一键生成
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle size={10} className="text-emerald-400" />
                数据驱动
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle size={10} className="text-emerald-400" />
                闭环优化
              </span>
            </div>
          </motion.div>
        )}

        {/* ── 生成中状态 ── */}
        {isGenerating && (
          <motion.div
            key="generating"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="rounded-2xl border border-indigo-200/60 bg-white/90 backdrop-blur-xl p-6 shadow-sm"
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative w-16 h-16 mb-4">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
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
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={20} className="text-indigo-500 animate-spin" />
                </div>
              </div>

              <p className="text-sm font-semibold text-slate-700 mb-1">AI 正在生成课件大纲...</p>
              <p className="text-xs text-slate-400 mb-4">分析薄弱知识点 · 设计教学结构 · 生成互动环节</p>

              {/* 进度条 */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2 tabular-nums">{progress}%</p>

              {/* 生成步骤 */}
              <div className="mt-4 w-full space-y-2">
                {[
                  { label: '分析本周薄弱知识点', done: progress >= 25 },
                  { label: '检索历史教学数据', done: progress >= 50 },
                  { label: '生成课件结构与内容', done: progress >= 75 },
                  { label: '添加互动环节与配套资源', done: progress >= 100 },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {step.done ? (
                      <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200 flex-shrink-0" />
                    )}
                    <span className={step.done ? 'text-slate-600' : 'text-slate-400'}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── 生成完成状态 ── */}
        {generated && outline && (
          <motion.div
            key="generated"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-emerald-200/60 bg-white/90 backdrop-blur-xl shadow-sm overflow-hidden"
          >
            {/* 成功头部 */}
            <div className="px-5 py-4 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border-b border-emerald-100/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500 text-white">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">课件大纲生成完成</h4>
                  <p className="text-[10px] text-slate-400">基于 {weakest.name} 薄弱点分析</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={handleGenerate}
                  className="p-2 hover:bg-white/60 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                  title="重新生成"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Loader2 size={14} className="animate-spin" />
                </motion.button>
                <motion.button
                  onClick={handleReset}
                  className="p-2 hover:bg-white/60 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                  title="关闭"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X size={14} />
                </motion.button>
              </div>
            </div>

            {/* 大纲内容 */}
            <div className="p-5 max-h-[400px] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(148,163,184,0.2) transparent' }}>
              <pre className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-sans">
                {outline}
              </pre>
            </div>

            {/* 操作栏 */}
            <div className="px-5 py-3 border-t border-slate-100/80 flex items-center justify-between bg-slate-50/50">
              <span className="text-[10px] text-slate-400">
                包含 {outline.split('━━━').length - 1} 个模块 · 预计 55 分钟
              </span>
              <div className="flex items-center gap-2">
                <motion.button
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  导出 PDF
                </motion.button>
                <motion.button
                  className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg shadow-sm hover:shadow-md transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  推送到教学平台
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
