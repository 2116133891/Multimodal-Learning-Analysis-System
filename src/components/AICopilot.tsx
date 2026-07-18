// ===== AI 课程数据助教 (Enhanced) — 悬浮聊天对话框 =====
// 增强：对话历史管理、防重复提交、打字机效果、错误恢复、上下文感知
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, X, Bot, User, Loader2,
  ChevronDown, ChevronUp, Brain, TrendingDown, TrendingUp,
  GripVertical, Lightbulb,
  Target, Repeat2, RefreshCw, Trash2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { OptimizationSuggestion, DiagnosticAlert, CourseProfileSnapshot } from '../types';

// ── 对话消息类型 ──
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

// ── 动态快捷问题 ──
function generateQuickQuestions(ctx: {
  alerts: DiagnosticAlert[];
  suggestions: OptimizationSuggestion[];
  healthScore: number;
  selectedWeek: number;
}): Array<{ icon: React.ComponentType<{ size?: number }>; text: string; category: string }> {
  const { alerts, suggestions, healthScore } = ctx;
  const questions: Array<{ icon: React.ComponentType<{ size?: number }>; text: string; category: string }> = [];

  if (healthScore < 60) {
    questions.push({ icon: TrendingDown, text: '当前课程存在哪些风险？如何改善？', category: '风险' });
  } else if (healthScore < 75) {
    questions.push({ icon: Brain, text: '课程还有哪些可以提升的空间？', category: '建议' });
  } else {
    questions.push({ icon: TrendingUp, text: '课程当前状态如何？哪些维度表现最好？', category: '状态' });
  }

  const highAlerts = alerts.filter(a => a.severity === 'high');
  if (highAlerts.length > 0) {
    questions.push({ icon: TrendingDown, text: `第${highAlerts[0].week}周有什么紧急预警？`, category: '预警' });
  }

  const pending = suggestions.filter(s => s.status === 'pending');
  if (pending.length > 0) {
    questions.push({ icon: Lightbulb, text: `有哪些待处理的AI优化建议？`, category: '建议' });
  }

  questions.push({ icon: Target, text: 'OBE 课程目标达成度如何？', category: 'OBE' });
  questions.push({ icon: Repeat2, text: '当前处于 PDCA 哪个阶段？', category: 'PDCA' });

  return questions.slice(0, 4);
}

// ── 构建系统提示词 ──
function buildSystemPrompt(ctx: {
  courseName: string;
  courseType: string;
  semester: string;
  totalStudents: number;
  selectedWeek: number;
  healthScore: number;
  healthGrade: string;
  riskFlags: string[];
  improvementSignals: string[];
  vitalityScores: Array<{ week: number; overall: number; classroomVitality: number; creativity: number; learningPerception: number; resourceExtension: number; courseEvolution: number }>;
  fusionWeights: { teaching: number; resource: number; interaction: number; learning: number };
  alertSummary: string;
  suggestionSummary: string;
  currentProfile?: CourseProfileSnapshot | null;
  obeAchievement?: number;
  pdcaStage?: string;
}): string {
  const { courseName, courseType, semester, totalStudents, selectedWeek, healthScore, healthGrade, riskFlags, improvementSignals, vitalityScores, fusionWeights, alertSummary, suggestionSummary, currentProfile, obeAchievement, pdcaStage } = ctx;

  const recentVitality = vitalityScores.slice(-4).map(v =>
    `第${v.week}周: 总体${v.overall}分, 课堂活力${v.classroomVitality}分, 创造力${v.creativity}分, 学习感知${v.learningPerception}分, 资源延续${v.resourceExtension}分, 课程进化${v.courseEvolution}分`
  ).join('\n');

  const weightDesc = `当前多模态融合权重配置：教学状态${fusionWeights.teaching}%、平台资源${fusionWeights.resource}%、师生互动${fusionWeights.interaction}%、传统学习数据${fusionWeights.learning}%`;

  const fiveDimDesc = currentProfile ? `
## 五维指标详情（第${selectedWeek}周）
- 学生学的状态：情绪投入 ${currentProfile.dimension.teachingState.emotionalEngagement} 分
- 老师教的状态：讲授语速 ${currentProfile.dimension.teachingState.teachingPace} 分
- 平台资源质量：课件完播率 ${currentProfile.dimension.resourceUtilization.slideCompletionRate}%
- 教学互动方式：小组讨论热度 ${currentProfile.dimension.interactionMethod.groupDiscussionHeat} 分
- 教学方法适配：平均 ${Math.round(Object.values(currentProfile.dimension.teachingMethod || {}).reduce((s: number, v: number) => s + v, 0) / 8)} 分` : '';

  const obeDesc = obeAchievement ? `\n- OBE 目标达成度：${obeAchievement}%` : '';
  const pdcaDesc = pdcaStage ? `\n- 当前 PDCA 阶段：${pdcaStage.toUpperCase()}（${pdcaStage === 'plan' ? '计划' : pdcaStage === 'do' ? '执行' : pdcaStage === 'check' ? '检查' : '处理'}）` : '';

  return `你是一位专业的课程数据分析助手，同时精通教育测量学与多模态学习分析。请根据以下课程数据，用简洁、专业的中文回答用户问题。

## 课程基本信息
- 课程名称：${courseName}
- 课程类型：${courseType}
- 学期：${semester}
- 学生人数：${totalStudents}人
- 当前分析周次：第 ${selectedWeek} 周

## 课程健康度
- 综合健康度：${healthScore}/100
- 健康等级：${healthGrade}
${pdcaDesc}
${obeDesc}

## 五维指标详情
${fiveDimDesc || '暂无详细五维数据'}

## 风险标签（当前周）
${riskFlags.length > 0 ? riskFlags.map(f => `· ${f}`).join('\n') : '· 当前无风险项'}

## 改善信号（当前周）
${improvementSignals.length > 0 ? improvementSignals.map(s => `· ${s}`).join('\n') : '· 暂无显著改善信号'}

## 最近4周生命力趋势
${recentVitality || '暂无数据'}

## 多模态融合权重配置
${weightDesc}

## 课程告警摘要（最多3条）
${alertSummary || '当前无活跃告警'}

## AI优化建议摘要（最多2条待处理）
${suggestionSummary || '暂无待处理建议'}

## 回答规则
1. 回答必须基于以上提供的真实数据，不要编造不存在的信息
2. 如果用户问的问题超出了你掌握的数据范围，诚实告知
3. 回答要简洁明了，重点突出，适当使用 emoji 增强可读性
4. 涉及数据对比时，给出具体数值
5. 给出建议时，要具体可执行，避免空泛的表述
6. 每次回答控制在 300 字以内
7. 如果用户问到融合权重相关的配置，请解释权重对分析结果的影响
8. 回答中可以引用五维指标（学生学、老师教、资源、互动、方法）的具体数据
9. 如果涉及 OBE 目标，请关注知识、技能、态度三维目标的达成情况
10. 如果涉及 PDCA，请根据当前阶段给出针对性的建议
11. 始终从**课程整体**角度分析问题，而非仅关注个别学生
12. 强调课程持续改进（CQI）的理念`;
}

// ── 打字机效果组件 ──
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      <span className="text-[11px] text-slate-400 ml-2">AI 正在分析...</span>
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
      className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* 头像 */}
      <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
        isUser
          ? 'bg-blue-500 text-white'
          : 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/20'
      }`}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* 消息内容 */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-tr-md shadow-md shadow-blue-500/20'
            : 'bg-slate-50 text-slate-700 rounded-tl-md border border-slate-200/60'
        }`}>
          {message.isLoading ? (
            <TypingIndicator />
          ) : isUser ? (
            message.content
          ) : (
            <div className="prose prose-sm max-w-none prose-p:text-slate-700 prose-strong:text-slate-800 prose-headings:text-slate-800 prose-a:text-violet-600">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
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
  courseInfo?: any;
  vitalityScores?: any[];
  courseProfiles?: CourseProfileSnapshot[];
  fusionWeights?: { teaching: number; resource: number; interaction: number; learning: number };
}

export default function AICopilot({
  suggestions = [],
  alerts = [],
  healthScore = 75,
  selectedWeek = 16,
  courseInfo = null,
  vitalityScores = [],
  courseProfiles = [],
  fusionWeights = { teaching: 30, resource: 25, interaction: 25, learning: 20 },
}: AICopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 你好！我是 **AI 课程数据助教**。\n\n我的核心任务是帮助教师从**课程整体**角度进行持续改进（CQI），通过分析六维多模态数据来诊断课程状态、发现问题、提供改进建议。\n\n## 我能帮你做什么\n\n📊 **课程健康诊断** — 综合健康度、风险识别、改善信号\n👩‍🏫 **教师教学分析** — 讲授语速、情绪饱满度、提问频次\n📚 **资源质量评估** — 课件完播率、视频观看深度、资源下载\n💬 **互动方式优化** — 小组讨论、翻转课堂、实时投票\n🎯 **OBE 目标追踪** — 知识/技能/态度三维目标达成度\n🔄 **PDCA 改进闭环** — 计划→执行→检查→处理的持续循环\n\n💡 提示：本系统关注**课程层面**的分析，通过多模态数据联动促进**课程持续改进**。\n\n试试点击下方的快捷问题，或者直接输入你的问题。`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastError, setLastError] = useState('');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sendLockRef = useRef(false); // 防止重复提交

  // 拖拽
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
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

  // 聚焦输入框
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // 动态快捷问题
  const quickQuestions = generateQuickQuestions({
    alerts, suggestions, healthScore, selectedWeek,
  });

  // ── 发送消息（带防重入锁） ──
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping || sendLockRef.current) return;

    sendLockRef.current = true;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    // 添加 loading 消息
    const loadingMsg: ChatMessage = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    setLastError('');
    setIsTyping(true);

    try {
      // 构建对话历史（最近 8 条消息，控制上下文长度）
      const recentMessages = [...messages, userMsg].slice(-8);

      // 获取最新课程画像
      const latestProfile = courseProfiles?.[courseProfiles.length - 1];
      const currentProfile = courseProfiles?.[selectedWeek - 1];

      // 构建告警摘要
      const alertSummary = alerts.slice(0, 3).map(a =>
        `[${a.severity === 'high' ? '🔴高' : a.severity === 'medium' ? '🟡中' : '🟢低'}] 第${a.week}周 ${a.title}`
      ).join('\n') || '当前无活跃告警';

      // 构建建议摘要
      const pendingSuggestions = suggestions.filter(s => s.status === 'pending');
      const suggestionSummary = pendingSuggestions.slice(0, 2).map(s =>
        `[${s.priority === 'high' ? '高' : s.priority === 'medium' ? '中' : '低'}] ${s.title}`
      ).join('\n') || '暂无待处理建议';

      // 构建系统提示词
      const systemPrompt = buildSystemPrompt({
        courseName: courseInfo?.name || '未知',
        courseType: courseInfo?.type || '未知',
        semester: courseInfo?.semester || '未知',
        totalStudents: courseInfo?.totalStudents || 0,
        selectedWeek,
        healthScore: latestProfile?.overallHealth ?? healthScore,
        healthGrade: latestProfile?.healthGrade ?? 'N/A',
        riskFlags: latestProfile?.riskFlags ?? [],
        improvementSignals: latestProfile?.improvementSignals ?? [],
        vitalityScores: vitalityScores.map(v => ({ ...v })),
        fusionWeights,
        alertSummary,
        suggestionSummary,
        currentProfile,
        obeAchievement: latestProfile?.obeAchievement,
        pdcaStage: latestProfile?.pdcaStage,
      });

      // 调用 LLM
      const { callLLMChat } = await import('../services/llmApi');
      const aiContent = await callLLMChat(
        [
          { role: 'system', content: systemPrompt },
          ...recentMessages.map(m => ({ role: m.role, content: m.content })),
        ],
        { timeoutMs: 30000, maxRetries: 2 }
      );

      // 移除 loading 消息，添加 AI 回复
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        return [...filtered, {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: aiContent,
          timestamp: new Date(),
        }];
      });
    } catch (err: any) {
      const errorMsg = err?.message || '未知错误';
      setLastError(errorMsg);

      // 回退到本地模板
      const fallbackResponse = generateFallbackResponse(text, {
        healthScore, selectedWeek, alerts, suggestions, courseProfiles, courseInfo, vitalityScores,
      });

      setMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        return [...filtered, {
          id: `ai-fallback-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ AI 服务暂时不可用，以下是基于本地数据的分析：\n\n${fallbackResponse}`,
          timestamp: new Date(),
        }];
      });
    } finally {
      setIsTyping(false);
      // 延迟释放锁，防止快速连续点击
      setTimeout(() => { sendLockRef.current = false; }, 500);
    }
  }, [messages, isTyping, healthScore, selectedWeek, alerts, suggestions, courseInfo, vitalityScores, courseProfiles, fusionWeights]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickQuestion = (q: string) => {
    sendMessage(q);
  };

  // ── 清空对话 ──
  const handleClearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `👋 对话已清空。我是 **AI 课程数据助教**，帮助教师从**课程整体**角度进行持续改进（CQI）。\n\n试试点击下方的快捷问题，或者直接输入你的问题。`,
      timestamp: new Date(),
    }]);
    setLastError('');
  };

  // ── 本地回退引擎 ──
  function generateFallbackResponse(question: string, ctx: {
    healthScore: number; selectedWeek: number; alerts: DiagnosticAlert[]; suggestions: OptimizationSuggestion[];
    courseProfiles: CourseProfileSnapshot[]; courseInfo: any; vitalityScores: any[];
  }): string {
    const { healthScore, selectedWeek, alerts: al, suggestions: sg, courseProfiles: cps, courseInfo, vitalityScores: vs } = ctx;
    const q = question.toLowerCase();
    const weekIdx = Math.min(selectedWeek - 1, 15);
    const latestProfile = cps[cps.length - 1];
    const currentProfile = cps[weekIdx];
    const vitality = vs[weekIdx];

    const fiveDim = currentProfile ? {
      learning: currentProfile.dimension.teachingState.emotionalEngagement,
      teaching: currentProfile.dimension.teachingState.teachingPace,
      resource: currentProfile.dimension.resourceUtilization.slideCompletionRate,
      interaction: currentProfile.dimension.interactionMethod.groupDiscussionHeat,
      method: Math.round(Object.values(currentProfile.dimension.teachingMethod || {}).reduce((s: number, v: number) => s + v, 0) / 8),
    } : null;

    if (/健康|状态|概况/.test(q)) {
      let resp = `📈 **课程健康度报告（第${selectedWeek}周）**\n\n当前综合健康度：**${healthScore}/100**（等级 ${latestProfile?.healthGrade || 'N/A'}）\n`;
      if (fiveDim) {
        resp += `\n**五维指标：**\n`;
        resp += `· 学生学的状态：${fiveDim.learning} 分\n`;
        resp += `· 老师教的状态：${fiveDim.teaching} 分\n`;
        resp += `· 平台资源质量：${fiveDim.resource} 分\n`;
        resp += `· 教学互动方式：${fiveDim.interaction} 分\n`;
        resp += `· 教学方法适配：${fiveDim.method} 分\n`;
      }
      return resp;
    }

    if (/建议|优化|改进/.test(q)) {
      return `🤖 **AI 优化建议（共 ${sg.length} 条）**\n\n待处理 ${sg.filter(s => s.status === 'pending').length} 条，已处理 ${sg.filter(s => s.status !== 'pending').length} 条。\n\n高优先级建议 ${sg.filter(s => s.priority === 'high').length} 条。\n\n💡 前往「AI 决策支持」页面查看详情并做出决策。`;
    }

    if (/告警|风险|预警|紧急/.test(q)) {
      const high = al.filter(a => a.severity === 'high');
      return `🚨 **课程告警汇总（共 ${al.length} 条）**\n\n🔴 高级告警 ${high.length} 条：${high.slice(0, 2).map(a => `第${a.week}周 ${a.title}`).join('、') || '无'}\n🟡 中级告警 ${al.filter(a => a.severity === 'medium').length} 条\n\n💡 前往「动态诊断」页面查看详情。`;
    }

    if (/生命力|活力|创造/.test(q)) {
      const v = vitality;
      if (!v) return '暂无生命力数据。';
      return `🌱 **课程生命力（第${selectedWeek}周）**\n\n综合评分：**${v.overall}/100**\n\n五维生命力：\n· 课堂活力：${v.classroomVitality} 分\n· 创造力培养：${v.creativity} 分\n· 学习感知：${v.learningPerception} 分\n· 资源延续：${v.resourceExtension} 分\n· 课程进化：${v.courseEvolution} 分`;
    }

    if (/obe|目标|达成/.test(q)) {
      const objs = courseInfo?.objectives || [];
      if (!objs.length) return '暂无课程目标数据。';
      return `🎯 **OBE 目标达成度**\n\n课程共 ${objs.length} 个目标：\n${objs.slice(0, 3).map(o => `· ${o.name}`).join('\n')}\n\n💡 前往「课程画像详情」查看完整 OBE 达成趋势。`;
    }

    if (/pdca|循环|阶段/.test(q)) {
      const stages = ['Plan（计划）', 'Do（执行）', 'Check（检查）', 'Act（处理）'];
      const stage = stages[Math.floor((selectedWeek - 1) / 4) % 4];
      return `🔄 **PDCA 持续改进循环**\n\n当前阶段：**${stage}**（第${selectedWeek}周）\n\n• 第 1-4 周：Plan 计划\n• 第 5-8 周：Do 执行\n• 第 9-12 周：Check 检查\n• 第 13-16 周：Act 处理`;
    }

    if (/方法|教学/.test(q)) {
      if (!fiveDim) return '暂无教学方法数据。';
      return `📚 **教学方法适配度**\n\n当前教学方法综合得分：**${fiveDim.method} 分**\n\n💡 前往「课程画像详情」查看 8 种教学方法（案例教学、翻转课堂、项目驱动等）的详细数据。`;
    }

    return `📊 **课程数据概览（第${selectedWeek}周）**\n\n当前健康度：${healthScore}/100\n- 活跃告警：${al.length} 条\n- AI 建议：${sg.length} 条\n- 生命力：${vitality?.overall ?? 0}/100\n\n💡 您可以问我：健康度、建议、告警、生命力、OBE、PDCA、教学方法等。`;
  }

  // ── 浮动按钮 ──
  if (!isOpen) {
    return (
      <motion.div
        className="fixed bottom-6 right-6 z-20"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 300 }}
      >
        <motion.button
          onClick={() => setIsOpen(true)}
          className="relative group"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 animate-pulse-ring opacity-40" />
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-xl shadow-violet-500/30 flex items-center justify-center border border-white/10">
            <Sparkles size={24} className="transition-transform duration-300 group-hover:rotate-12" />
          </div>
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
      <div className="flex-1 flex flex-col rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-2xl shadow-slate-500/10 overflow-hidden">
        {/* ── 面板头部 ── */}
        <div className="shrink-0 px-4 py-3 bg-gradient-to-r from-violet-500/5 to-indigo-500/5 border-b border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              data-drag-handle
              className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors shrink-0"
              onMouseDown={handleMouseDown}
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
            {/* 清空对话 */}
            <button
              onClick={handleClearChat}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              title="清空对话"
            >
              <Trash2 size={14} />
            </button>
            {/* 最小化 */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              title={isMinimized ? '展开' : '最小化'}
            >
              {isMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
            {/* 关闭 */}
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
              <AnimatePresence mode="popLayout">
                {messages.map(msg => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
              </AnimatePresence>

              {lastError && (
                <div className="text-[10px] text-red-400 px-2 flex items-center gap-1">
                  <RefreshCw size={10} className="cursor-pointer hover:text-red-500" onClick={() => setLastError('')} />
                  {lastError}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── 快捷问题（仅在无用户消息时显示） ── */}
            {messages.filter(m => m.role === 'user').length === 0 && (
              <div className="px-4 pb-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">快捷问题</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickQuestion(q.text)}
                      disabled={isTyping}
                      className="flex items-start gap-2 p-2.5 bg-slate-50 hover:bg-violet-50 border border-slate-100 hover:border-violet-200 rounded-xl text-left transition-all duration-200 disabled:opacity-50 group/question"
                    >
                      <q.icon size={14} className="text-slate-400 group-hover/question:text-violet-500 mt-0.5 shrink-0 transition-colors" />
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
            <form onSubmit={handleSubmit} className="shrink-0 px-4 py-3 border-t border-slate-200/60 bg-white/50">
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
              <p className="text-[10px] text-slate-400 mt-2 text-center">由大模型驱动 · 六维多模态数据分析</p>
            </form>
          </>
        )}
      </div>
    </motion.div>
  );
}
