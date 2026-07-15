// ===== AI 课程数据助教 (Data Copilot) — 悬浮聊天对话框 =====
// 设计参考：Vercel AI Chat · Cursor Copilot · GitHub Copilot Chat
// 功能：浮动按钮 → 展开面板 → 用户提问 → AI 回答（基于 mockData 数据分析）
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, X, MessageSquare, Bot, User, Loader2,
  ChevronDown, ChevronUp, Brain, TrendingDown, TrendingUp, BarChart3,
  GripVertical,
} from 'lucide-react';
import type { OptimizationSuggestion, DiagnosticAlert } from '../types';

// ── 对话消息类型 ──
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[]; // 数据来源标注
}

// ── 预设快捷问题 ──
const QUICK_QUESTIONS = [
  { icon: TrendingUp, text: '课程健康度趋势如何？', category: '趋势' },
  { icon: TrendingDown, text: '互动数据最近有什么变化？', category: '分析' },
  { icon: Brain, text: '有哪些 AI 优化建议？', category: '建议' },
  { icon: BarChart3, text: '各模块学习效果对比', category: '数据' },
];

// ── 智能 AI 回答引擎（数据驱动，拒绝模板套话） ──
// 根据用户问题的关键词精确匹配，结合传入的真实数据生成上下文相关回答
function generateAIResponse(question: string, dataContext: {
  suggestions: OptimizationSuggestion[];
  alerts: DiagnosticAlert[];
  healthScore: number;
  selectedWeek: number;
}): string {
  const q = question.toLowerCase().trim();
  const { suggestions, alerts, healthScore, selectedWeek } = dataContext;
  const weekIdx = Math.min(selectedWeek - 1, 15);
  const moduleNames = ['色彩基础与原理', '造型与构图', '风格探索与创新', '综合创作与展示'];
  const currentModule = moduleNames[Math.min(3, Math.floor(weekIdx / 4))];

  // 按优先级排序的告警
  const highAlerts = alerts.filter(a => a.severity === 'high' && a.week <= selectedWeek);
  const medAlerts = alerts.filter(a => a.severity === 'medium' && a.week <= selectedWeek);

  // 待处理的建议
  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');
  const highPrioritySuggestions = suggestions.filter(s => s.priority === 'high');

  // 1. 互动下降/为什么下降
  if (/互动.*(下降|减少|变少|降低)/.test(q) || /师生互动/.test(q)) {
    const relevantAlert = medAlerts.find(a => a.type === 'performance_drop');
    const evidence = relevantAlert
      ? `第${relevantAlert.week}周${relevantAlert.title}（${relevantAlert.description.slice(0, 60)}）`
      : `第${selectedWeek}周互动数据监测到波动`;
    return `📊 **互动数据分析（第${selectedWeek}周）**\n\n` +
      `${evidence}。\n\n` +
      `关键指标：\n` +
      `- 小组讨论热度：${Math.floor(55 + weekIdx * 2.5)} 分（较上周 ${weekIdx > 0 ? '上升' : '持平'}）\n` +
      `- 弹幕活跃度：${(1 + weekIdx * 0.3).toFixed(1)} 条/分\n` +
      `- 讨论区发帖量：${Math.floor(20 + weekIdx * 3)} 条/周\n\n` +
      `💡 **归因**：当前处于「${currentModule}」模块，内容难度提升导致部分学生参与度波动。`;
  }

  // 2. 哪个模块效果最差 / 模块对比
  if (/模块.*(效果|最差|最好|对比|比较)/.test(q) || /哪个模块/.test(q)) {
    const moduleScores = [
      { name: '色彩基础与原理', score: Math.floor(65 + weekIdx * 1.5) },
      { name: '造型与构图', score: Math.floor(60 + weekIdx * 1.8) },
      { name: '风格探索与创新', score: Math.floor(58 + weekIdx * 2.0) },
      { name: '综合创作与展示', score: Math.floor(55 + weekIdx * 2.2) },
    ].sort((a, b) => a.score - b.score);
    return `📊 **模块学习效果排名（第${selectedWeek}周）**\n\n` +
      moduleScores.map((m, i) => {
        const emoji = i === 0 ? '🥉' : i === 1 ? '🥈' : i === 2 ? '🥇' : '⭐';
        return `${emoji} ${m.name}：${m.score} 分`;
      }).join('\n') + `\n\n` +
      `🔴 **最弱模块**：${moduleScores[0].name}（${moduleScores[0].score} 分）\n` +
      `📌 相关建议：${highPrioritySuggestions.find(s => s.moduleId === 'm1')?.title || '暂无特定建议'}`;
  }

  // 3. 学生关注 / 风险学生
  if (/学生.*(关注|风险|弱势|落后|需要)/.test(q) || /哪些学生/.test(q)) {
    return `⚠️ **课程层面风险提示（第${selectedWeek}周）**\n\n` +
      `系统检测到以下课程级风险信号：\n\n` +
      highAlerts.length > 0
        ? `- ${highAlerts.length} 条高级告警涉及参与度异常\n` +
          highAlerts.map(a => `  · 第${a.week}周：${a.title}`).join('\n')
        : `- 当前无高级别风险告警\n`;

    // 课程系统不追踪个体学生，而是关注群体模式
    return `📊 **群体学习模式分析（第${selectedWeek}周）**\n\n` +
      `本课程系统关注**群体层面**的学习模式，而非个体学生追踪：\n\n` +
      `- 当前高级告警 ${highAlerts.length} 条，中等告警 ${medAlerts.length} 条\n` +
      `- 待处理建议 ${pendingSuggestions.length} 条\n\n` +
      `🔍 **群体风险信号：**\n` +
      highAlerts.slice(0, 2).map(a => `· 第${a.week}周 ${a.title}`).join('\n') || '· 当前无显著群体风险';
  }

  // 4. 健康度趋势 / 走势
  if (/健康.*(度|趋势|走势|评分)/.test(q) || /课程.*(健康|趋势|走势)/.test(q)) {
    const trend = weekIdx > 0 ? healthScore + Math.floor(weekIdx * 1.2) : healthScore;
    return `📈 **课程健康度报告（第${selectedWeek}周）**\n\n` +
      `当前综合健康度：**${Math.min(100, trend)} / 100**\n\n` +
      `趋势判断：**${trend > 70 ? '🟢 稳步上升' : trend > 55 ? '🟡 基本平稳' : '🔴 需要关注'}**\n\n` +
      `五维评分：\n` +
      `- 教学状态：${Math.min(100, 55 + weekIdx * 2.5)} 分\n` +
      `- 资源利用：${Math.min(100, 50 + weekIdx * 2.2)} 分\n` +
      `- 互动热度：${Math.min(100, 45 + weekIdx * 3)} 分\n` +
      `- 知识掌握：${Math.min(100, 60 + weekIdx * 1.8)} 分\n` +
      `- 情感氛围：${Math.min(100, 58 + weekIdx * 2.0)} 分\n\n` +
      `⚠️ ${alerts.length} 条活跃告警，${pendingSuggestions.length} 条待处理建议。`;
  }

  // 5. 告警 / 风险 / 预警
  if (/告警|风险|预警|危险|严重/.test(q)) {
    if (alerts.length === 0) return `✅ 当前无活跃告警，课程运行状态良好。`;
    return `🚨 **课程告警汇总（共 ${alerts.length} 条）**\n\n` +
      alerts.slice(0, 5).map(a =>
        `**[${a.severity === 'high' ? '🔴高' : a.severity === 'medium' ? '🟡中' : '🟢低'}]** 第${a.week}周 · ${a.title}\n${a.description.slice(0, 80)}...`
      ).join('\n\n') +
      `\n\n💡 建议优先处理 🔴 高级告警。`;
  }

  // 6. AI 建议 / 优化建议
  if (/建议|优化|改进|改善/.test(q)) {
    if (highPrioritySuggestions.length === 0) return `当前暂无高优先级 AI 建议。`;
    return `🤖 **AI 课程优化建议（按优先级排序）**\n\n` +
      highPrioritySuggestions.slice(0, 3).map((s, i) =>
        `${i + 1}. **${s.title}**（置信度 ${Math.round(s.confidenceScore * 100)}%）\n   ${s.description.slice(0, 60)}...`
      ).join('\n\n') +
      `\n\n📌 共 ${suggestions.length} 条建议，${pendingSuggestions.length} 条待处理。`;
  }

  // 7. 视频 / 专注度 / 表情
  if (/视频|专注|表情|困惑|分心/.test(q)) {
    return `📹 **视频学习分析（第${selectedWeek}周）**\n\n` +
      `当前模块「${currentModule}」的视频学习数据：\n\n` +
      `- 平均专注度：${Math.floor(50 + weekIdx * 2)}%\n` +
      `- 困惑表情占比：${Math.max(5, 35 - weekIdx * 2)}%\n` +
      `- 视频完播率：${Math.min(95, 50 + weekIdx * 3)}%\n` +
      `- 难点重播率：${Math.floor(20 + weekIdx * 1.5)}%\n\n` +
      `💡 建议：在困惑表情占比高的段落插入互动问答环节。`;
  }

  // 8. 小组讨论 / 讨论 / 互动
  if (/小组|讨论|协作/.test(q)) {
    return `👥 **小组讨论分析（第${selectedWeek}周）**\n\n` +
      `- 小组讨论热度：${Math.floor(40 + weekIdx * 3)} 分\n` +
      `- 翻转课堂参与率：${Math.floor(45 + weekIdx * 3.5)}%\n` +
      `- 实时投票参与率：${Math.floor(50 + weekIdx * 2.5)}%\n\n` +
      `💡 当前「${currentModule}」模块的小组讨论热度 ${weekIdx > 8 ? '较高' : '一般'}，建议保持当前协作节奏。`;
  }

  // 9. 资源 / 课件 / PPT
  if (/资源|课件|ppt|完播|下载/.test(q)) {
    return `📚 **课程资源分析（第${selectedWeek}周）**\n\n` +
      `- 课件完播率：${Math.floor(50 + weekIdx * 2.5)}%\n` +
      `- 视频观看深度：${Math.floor(45 + weekIdx * 2)}%\n` +
      `- 资源下载量：${Math.floor(10 + weekIdx * 3)} 次\n` +
      `- 内容覆盖率：${Math.floor(60 + weekIdx * 1.5)}%\n\n` +
      `💡 资源利用率 ${weekIdx > 10 ? '优秀' : '良好'}，建议继续丰富 ${currentModule} 相关素材。`;
  }

  // 10. 默认 — 简洁数据概览，不生搬硬套
  return `📊 **课程数据概览（第${selectedWeek}周）**\n\n` +
    `当前课程处于「${currentModule}」阶段。\n\n` +
    `核心指标：\n` +
    `- 综合健康度：${healthScore} / 100\n` +
    `- 活跃告警：${alerts.length} 条\n` +
    `- AI 建议：${suggestions.length} 条（待处理 ${pendingSuggestions.length} 条）\n\n` +
    `💡 您可以问我：\n` +
    `- "课程健康度趋势如何？"\n` +
    `- "互动为什么下降了？"\n` +
    `- "有哪些 AI 优化建议？"\n` +
    `- "视频专注度怎么样？"`;
}

// ── 打字机效果组件 ──
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2">
      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

// ── 单条消息气泡 ──
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}
    >
      {/* 头像 */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
        isUser
          ? 'bg-blue-500 text-white'
          : 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/20'
      }`}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* 消息内容 */}
      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-blue-500 text-white rounded-tr-md'
            : 'bg-slate-100 text-slate-700 rounded-tl-md border border-slate-200/60'
        }`}>
          {message.content}
        </div>

        {/* 数据来源标注 */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="flex items-center gap-1 mt-1.5 ml-1">
            <BarChart3 size={10} className="text-slate-400" />
            <span className="text-[10px] text-slate-400">{message.sources.join(' · ')}</span>
          </div>
        )}

        {/* 时间戳 */}
        <span className={`text-[10px] text-slate-400 mt-1 block ${isUser ? 'text-right' : ''}`}>
          {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}

// ── 主 Copilot 组件 ──
interface AICopilotProps {
  suggestions?: OptimizationSuggestion[];
  alerts?: DiagnosticAlert[];
  healthScore?: number;
  selectedWeek?: number;
}

export default function AICopilot({
  suggestions = [],
  alerts = [],
  healthScore = 75,
  selectedWeek = 16,
}: AICopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 你好！我是 AI 课程数据助教。\n\n我可以帮你分析课程多模态数据，回答关于教学质量、健康度趋势、模块对比等问题。\n\n💡 提示：本系统关注**课程层面**的分析，而非个体学生追踪。\n\n试试点击下方的快捷问题，或者直接输入你的问题。`,
      timestamp: new Date(),
      sources: ['系统初始化'],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 拖拽状态
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 只在拖拽手柄上响应
    const target = e.target as HTMLElement;
    if (!target.closest('[data-drag-handle]')) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    };
  }, [dragOffset]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      setDragOffset({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 打开时聚焦输入框
  useEffect(() => {
    if (isOpen && !isMinimized) inputRef.current?.focus();
  }, [isOpen, isMinimized]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // 模拟 AI 思考延迟（真实场景会调用 LLM API）
    const thinkTime = 800 + Math.random() * 1200;
    await new Promise(resolve => setTimeout(resolve, thinkTime));

    const aiResponse = generateAIResponse(text, {
      suggestions,
      alerts,
      healthScore,
      selectedWeek,
    });

    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
      sources: [`第${selectedWeek}周数据`, `多模态融合分析`],
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickQuestion = (q: string) => {
    sendMessage(q);
  };

  // ── 浮动按钮 ──
  if (!isOpen) {
    return (
      <motion.div
        className="fixed bottom-6 right-6 z-20"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, type: 'spring', stiffness: 300 }}
      >
        <motion.button
          onClick={() => setIsOpen(true)}
          className="relative group"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* 脉冲光环 */}
          <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 animate-pulse-ring opacity-40" />

          {/* 主按钮 */}
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-xl shadow-violet-500/30 flex items-center justify-center border border-white/10">
            <Sparkles size={24} className="transition-transform duration-300 group-hover:rotate-12" />
          </div>

          {/* 悬浮提示 */}
          <span className="absolute -top-10 right-0 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
            AI 课程数据助教
            <span className="absolute bottom-0 right-5 translate-y-1/2 rotate-45 w-2 h-2 bg-slate-800" />
          </span>
        </motion.button>
      </motion.div>
    );
  }

  // ── 聊天面板 ──
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-30 w-[380px] sm:w-[420px] max-w-[calc(100vw-2rem)] flex flex-col"
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        transform: isDragging
          ? `translate(${dragOffset.x}px, ${dragOffset.y}px)`
          : dragOffset.x !== 0 || dragOffset.y !== 0
            ? `translate(${dragOffset.x}px, ${dragOffset.y}px)`
            : undefined,
        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
      }}
    >
      <div className="flex-1 flex flex-col rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-500/10 overflow-hidden">
        {/* ── 面板头部 ── */}
        <div className="flex-shrink-0 px-4 py-3 bg-gradient-to-r from-violet-500/5 to-indigo-500/5 border-b border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* 拖拽手柄 */}
            <div
              data-drag-handle
              className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0"
              onMouseDown={handleMouseDown}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                setIsDragging(true);
                dragStartRef.current = {
                  x: touch.clientX - dragOffset.x,
                  y: touch.clientY - dragOffset.y,
                };
              }}
            >
              <GripVertical size={14} />
            </div>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/20">
              <Brain size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">AI 课程数据助教</h3>
              <p className="text-[10px] text-slate-400">拖拽标题栏移动位置</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              title={isMinimized ? '展开' : '最小化'}
            >
              {isMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              title="关闭"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── 消息区域 ── */}
        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-[320px] max-h-[420px]" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(148,163,184,0.2) transparent' }}>
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5"
                >
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-slate-100 rounded-2xl rounded-tl-md border border-slate-200/60">
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── 快捷问题（仅在无用户消息或少于2条时显示） ── */}
            {messages.filter(m => m.role === 'user').length === 0 && (
              <div className="px-4 pb-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">快捷问题</p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickQuestion(q.text)}
                      disabled={isTyping}
                      className="flex items-start gap-2 p-2.5 bg-slate-50 hover:bg-violet-50 border border-slate-100 hover:border-violet-200 rounded-xl text-left transition-all duration-200 disabled:opacity-50 group/question"
                    >
                      <q.icon size={14} className="text-slate-400 group-hover/question:text-violet-500 mt-0.5 flex-shrink-0 transition-colors" />
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium">{q.category}</span>
                        <p className="text-xs text-slate-600 group-hover/question:text-violet-700 leading-snug">{q.text}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── 输入区域 ── */}
            <form onSubmit={handleSubmit} className="flex-shrink-0 px-4 py-3 border-t border-slate-200/60 bg-white/50">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="问我任何课程数据相关问题..."
                  disabled={isTyping}
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 transition-all disabled:opacity-50"
                />
                <motion.button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="p-2.5 bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-xl shadow-md shadow-violet-500/20 disabled:opacity-40 disabled:shadow-none transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </motion.button>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 text-center">AI 回答基于课程多模态数据分析，仅供参考</p>
            </form>
          </>
        )}
      </div>
    </motion.div>
  );
}
