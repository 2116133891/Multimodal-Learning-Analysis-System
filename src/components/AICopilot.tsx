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
  { icon: TrendingDown, text: '这周的师生互动为什么下降了？', category: '分析' },
  { icon: BarChart3, text: '哪个模块的学习效果最差？', category: '数据' },
  { icon: Brain, text: '哪些学生需要重点关注？', category: '预警' },
  { icon: TrendingUp, text: '本周课程健康度趋势如何？', category: '趋势' },
];

// ── Mock AI 回答引擎（基于 mockData 数据分析） ──
function generateAIResponse(question: string, dataContext: {
  suggestions: OptimizationSuggestion[];
  alerts: DiagnosticAlert[];
  healthScore: number;
  selectedWeek: number;
}): string {
  const q = question.toLowerCase();

  // 互动下降分析
  if (q.includes('互动') || q.includes('下降') || q.includes('为什么')) {
    return `根据第 ${dataContext.selectedWeek} 周的多模态数据分析，师生互动下降主要由以下因素导致：\n\n` +
      `📊 **数据证据：**\n` +
      `- 小组讨论热度从上周的 72 分降至 68 分（-5.6%）\n` +
      `- 弹幕活跃度降至 ${Math.floor(2 + Math.random() * 3).toFixed(1)} 条/分，低于均值 5 条/分\n` +
      `- 讨论区发帖量同比下降 12%\n\n` +
      `🔍 **归因分析：**\n` +
      `- 主要因素：第 ${dataContext.selectedWeek} 周进入 ${['色彩基础', '造型构图', '风格探索', '综合创作'][Math.min(3, Math.floor(dataContext.selectedWeek / 4))]} 模块，内容难度跃升导致学生参与度波动\n` +
      `- 视频专注度在该周降至 ${Math.floor(45 + Math.random() * 15)}%，低于健康阈值 60%\n\n` +
      `💡 **建议：** 插入 3 分钟小组讨论环节，利用实时投票工具提升参与度。`;
  }

  // 学习效果最差模块
  if (q.includes('模块') || q.includes('效果') || q.includes('差')) {
    return `根据多模态数据融合分析，学习效果最弱的模块是：\n\n` +
      `🔴 **${['色彩基础与原理', '造型与构图', '风格探索与创新', '综合创作与展示'][Math.floor(Math.random() * 4)]}**\n\n` +
      `- 综合健康度：${Math.floor(55 + Math.random() * 15)} 分（低于课程均值 12 分）\n` +
      `- 视频专注度均值：${Math.floor(40 + Math.random() * 15)}%（困惑表情占比 ${Math.floor(25 + Math.random() * 20)}%）\n` +
      `- 测验通过率：${Math.floor(35 + Math.random() * 20)}%（目标 ≥75%）\n\n` +
      `📌 相关 AI 建议：${dataContext.suggestions.filter(s => s.priority === 'high').slice(0, 1)[0]?.title || '暂无高优先级建议'}`;
  }

  // 需要关注的学生
  if (q.includes('学生') || q.includes('关注') || q.includes('风险')) {
    const riskCount = Math.floor(3 + Math.random() * 5);
    return `🚨 **需要重点关注的学生分析：**\n\n` +
      `当前有 **${riskCount} 名学生** 的学习投入度低于健康阈值（60 分）：\n\n` +
      `- **参与度持续下降**：${Math.floor(riskCount * 0.4)} 名学生近 3 周 engagementScore 下降超过 15 分\n` +
      `- **视频专注度异常**：${Math.floor(riskCount * 0.3)} 名学生视频专注度长期低于 40%\n` +
      `- **讨论区沉默**：${Math.floor(riskCount * 0.3)} 名学生近 2 周无任何发帖/互动记录\n\n` +
      `💡 **建议干预措施：**\n` +
      `1. 发送个性化学习提醒\n` +
      `2. 安排 1 对 1 辅导\n` +
      `3. 调整学习任务难度梯度`;
  }

  // 健康度趋势
  if (q.includes('健康') || q.includes('趋势') || q.includes('走势')) {
    const direction = Math.random() > 0.3 ? '上升' : '平稳';
    return `📈 **本周课程健康度趋势报告：**\n\n` +
      `当前综合健康度：**${dataContext.healthScore} / 100**\n\n` +
      `趋势判断：**${direction}**\n\n` +
      `- 较期初变化：${direction === '上升' ? '+' : '-'}${Math.floor(5 + Math.random() * 20)} 分\n` +
      `- 教学状态维度：${Math.floor(60 + Math.random() * 25)} 分\n` +
      `- 资源利用维度：${Math.floor(55 + Math.random() * 30)} 分\n` +
      `- 互动热度维度：${Math.floor(50 + Math.random() * 35)} 分\n\n` +
      `⚠️ 当前 ${dataContext.alerts.length} 条活跃告警，${dataContext.suggestions.filter(s => s.status === 'pending').length} 条待处理建议。`;
  }

  // 默认智能回复
  return `基于当前课程多模态数据分析，我对您的问题的理解如下：\n\n` +
    `您问到"**${question}**"，这是一个很好的观察。\n\n` +
    `📊 **数据概览：**\n` +
    `- 课程综合健康度：${dataContext.healthScore}/100\n` +
    `- 活跃告警：${dataContext.alerts.length} 条\n` +
    `- 待处理建议：${dataContext.suggestions.filter(s => s.status === 'pending').length} 条\n` +
    `- 本周互动热度：${Math.floor(55 + Math.random() * 30)} 分\n\n` +
    `💡 **建议操作：**\n` +
    `您可以尝试以下更具体的问题：\n` +
    `- "这周的师生互动为什么下降了？"\n` +
    `- "哪个模块的学习效果最差？"\n` +
    `- "哪些学生需要重点关注？"\n` +
    `- "本周课程健康度趋势如何？"`;
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
      content: `👋 你好！我是 AI 课程数据助教。\n\n我可以帮你分析课程多模态数据，回答关于教学质量、学生表现、健康度趋势等问题。\n\n试试点击下方的快捷问题，或者直接输入你的问题。`,
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
