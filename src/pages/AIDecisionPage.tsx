// ===== AI决策支持页面（重构：人机协同 + 一键干预闭环） =====
import { useEffect, useState } from 'react';
import { useStore } from '../hooks/useStore';
import { Brain, Check, X, Edit3, Clock, ChevronDown, Target, Sparkles, Send, Wand2, AlertTriangle, MessageSquare, Copy, CheckCircle2, Loader2 } from 'lucide-react';

const categoryLabels: Record<string, string> = {
  rhythm: '教学节奏调整',
  task: '任务设计优化',
  evaluation: '评价方式改革',
  resource: '资源更新建议',
};

const priorityConfig = {
  high: { label: '高优先级', bg: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  medium: { label: '中优先级', bg: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
  low: { label: '低优先级', bg: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
};

const rejectOptions: { value: string; label: string }[] = [
  { value: 'insufficient_evidence', label: '证据不足' },
  { value: 'conflicts_with_pedagogy', label: '与教学法冲突' },
  { value: 'timing_not_appropriate', label: '时机不当' },
  { value: 'too_expensive', label: '成本过高' },
  { value: 'other', label: '其他原因' },
];

// ── AI 沟通话术模板库 ──────────────────────────────────────
const interventionTemplates: Record<string, string> = {
  low_engagement: (week: number, evidence: string[], module: string) =>
    `课程第 ${week} 周整体参与度出现下降趋势。${evidence.join('。')} 建议在${module}模块增加互动环节，优化教学节奏。`,
  knowledge_gap: (week: number, evidence: string[], module: string) =>
    `多模态分析显示第 ${week} 周「${module}」模块的知识掌握度低于预期。${evidence.join('。')} 建议调整教学资源配比，增加针对性辅导材料。`,
  performance_drop: (week: number, evidence: string[], module: string) =>
    `系统监测到第 ${week} 周课程整体表现有所下滑。${evidence.join('。')} 这可能反映了教学节奏或资源适配的问题，建议审视当前教学设计。`,
  anomaly: (week: number, evidence: string[], module: string) =>
    `系统在第 ${week} 周发现了异常数据模式。${evidence.join('。')} 请检查课程设计与资源供给是否匹配，及时调整教学策略。`,
};

// ── 模态框组件 ──────────────────────────────────────────────
function InterventionModal({
  isOpen,
  onClose,
  alert,
  suggestions,
  students,
}: {
  isOpen: boolean;
  onClose: () => void;
  alert: { week: number; type: string; description: string; moduleId?: string; title: string } | null;
  suggestions: any[];
  students: any[];
}) {
  const [draftText, setDraftText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && alert) {
      setIsGenerating(true);
      // 模拟 AI 生成延迟
      const timer = setTimeout(() => {
        const evidence = alert.description.split(/[。！？]/).filter(Boolean).slice(0, 3);
        const module = alert.moduleId
          ? { m1: '色彩基础与原理', m2: '造型与构图', m3: '风格探索与创新', m4: '综合创作与展示' }[alert.moduleId]
          : '相关章节';
        const template = interventionTemplates[alert.type] || interventionTemplates.anomaly;
        setDraftText(template(alert.week, evidence, module));
        setIsGenerating(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isOpen, alert]);

  if (!isOpen || !alert) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(draftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    setIsSending(true);
    // 模拟发送延迟
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsSending(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* 模态框 */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease-out]">
        {/* 顶部渐变条 */}
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        {/* 标题栏 */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wand2 size={18} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">一键生成课程优化话术</h3>
              <p className="text-xs text-slate-500">AI 基于多源数据自动生成课程改进建议</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* 内容区 */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* 预警信息卡片 */}
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">{alert.title}</p>
                <p className="text-xs text-red-600 mt-1">{alert.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded-full">第 {alert.week} 周</span>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                    {alert.moduleId ? { m1: '色彩基础', m2: '造型构图', m3: '风格探索', m4: '综合创作' }[alert.moduleId] : '全模块'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full capitalize">
                    {alert.type === 'low_engagement' ? '参与度下降' : alert.type === 'knowledge_gap' ? '知识断层' : alert.type === 'performance_drop' ? '表现下滑' : '异常检测'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI 生成中 */}
          {isGenerating && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 size={32} className="text-blue-500 animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500">AI 正在分析多源数据...</p>
                <p className="text-xs text-slate-400 mt-1">生成课程优化建议</p>
              </div>
            </div>
          )}

          {/* 话术编辑区 */}
          {!isGenerating && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MessageSquare size={14} className="text-blue-500" />
                  AI 生成优化建议
                </label>
                <button
                  onClick={handleCopy}
                  className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1"
                >
                  {copied ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
              <textarea
                value={draftText}
                onChange={e => setDraftText(e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
                rows={6}
                placeholder="AI 生成的优化建议将显示在这里..."
              />
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                <Sparkles size={10} />
                可根据实际情况手动修改，发送前请确认内容
              </p>
            </div>
          )}

          {/* 数据依据 */}
          {!isGenerating && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <h4 className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1.5">
                <Target size={12} />
                话术生成依据
              </h4>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-blue-700">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  基于第 {alert.week} 周多模态数据分析
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-700">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  检测到 {alert.type === 'low_engagement' ? '参与度下降' : alert.type === 'knowledge_gap' ? '知识掌握不足' : alert.type === 'performance_drop' ? '表现下滑趋势' : '行为异常'}
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-700">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  结合 {alert.moduleId ? { m1: '色彩基础', m2: '造型构图', m3: '风格探索', m4: '综合创作' }[alert.moduleId] : '全模块'} 学习情况
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            取消
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setDraftText('');
                setIsGenerating(true);
                setTimeout(() => {
                  const evidence = alert.description.split(/[。！？]/).filter(Boolean).slice(0, 3);
                  const module = alert.moduleId
                    ? { m1: '色彩基础与原理', m2: '造型与构图', m3: '风格探索与创新', m4: '综合创作与展示' }[alert.moduleId]
                    : '相关章节';
                  const template = interventionTemplates[alert.type] || interventionTemplates.anomaly;
                  setDraftText(template(alert.week, evidence, module));
                  setIsGenerating(false);
                }, 600);
              }}
              className="px-4 py-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5"
            >
              <Wand2 size={14} />
              重新生成
            </button>
            <button
              onClick={handleSend}
              disabled={isSending || !draftText}
              className="px-6 py-2 text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm"
            >
              {isSending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  发送中...
                </>
              ) : (
                <>
                  <Send size={14} />
                  一键生成（模拟）
                </>
              )}
            </button>
          </div>
        </div>

        {/* 成功提示 */}
        {showSuccess && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center animate-[fadeIn_0.3s_ease-out]">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Check size={32} className="text-emerald-600" />
            </div>
            <h4 className="text-lg font-bold text-slate-800 mb-2">课程优化方案已生成</h4>
            <p className="text-sm text-slate-500 mb-1">改进建议已保存至课程优化日志</p>
            <p className="text-xs text-slate-400">该预警已标记为「已处理」</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AIDecisionPage() {
  const { suggestions, alerts, decisionLogs, fetchData, submitTeacherDecision } = useStore();
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [modifyText, setModifyText] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [handledAlerts, setHandledAlerts] = useState<Set<string>>(new Set());

  // 干预模态框状态
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<{ week: number; type: string; description: string; moduleId?: string; title: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDecision = async (suggestionId: string, action: string) => {
    await submitTeacherDecision(
      suggestionId,
      action as 'approve' | 'reject' | 'modify',
      action === 'modify' ? modifyText : undefined,
      action === 'reject' ? rejectReason : undefined,
      aiFeedback || undefined
    );
    const actionLabel = action === 'approve' ? '已采纳' : action === 'reject' ? '已拒绝' : '已修改';
    setSuccessMsg(
      `AI建议已${actionLabel}，教学干预日志已生成。决策反馈已反哺 AI 训练。`
    );
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
    setSelectedSuggestion(null);
    setRejectReason('');
    setModifyText('');
    setAiFeedback('');
  };

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');
  const processedSuggestions = suggestions.filter(s => s.status !== 'pending');
  const selected = suggestions.find(s => s.id === selectedSuggestion);

  const confidenceColor = (score: number) =>
    score >= 0.8 ? 'text-emerald-600' : score >= 0.6 ? 'text-orange-500' : 'text-red-500';
  const confidenceBg = (score: number) =>
    score >= 0.8 ? 'bg-emerald-100' : score >= 0.6 ? 'bg-orange-100' : 'bg-red-100';

  // 打开干预模态框
  const openInterventionModal = (alert: any) => {
    setSelectedAlert({
      week: alert.week,
      type: alert.type,
      description: alert.description,
      moduleId: alert.moduleId,
      title: alert.title,
    });
    setShowInterventionModal(true);
  };

  // 标记预警为已处理
  const markAsHandled = (alertId: string) => {
    setHandledAlerts(prev => new Set(prev).add(alertId));
  };

  // 高风险预警（severity === 'high' 且未处理）
  const highRiskAlerts = alerts.filter(a => a.severity === 'high' && !handledAlerts.has(a.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">AI决策支持</h2>
          <p className="text-sm text-slate-500 mt-1">
            人机协同驱动的课程优化决策 — AI分析与教师专业经验深度融合
          </p>
        </div>
      </div>

      {/* 成功提示 */}
      {showSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-pulse">
          <Check size={20} className="text-emerald-600 flex-shrink-0" />
          <p className="text-sm text-emerald-700">{successMsg}</p>
        </div>
      )}

      {/* 统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Brain size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{suggestions.length}</p>
            <p className="text-sm text-slate-500">AI课程优化建议</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-lg">
            <Clock size={24} className="text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{pendingSuggestions.length}</p>
            <p className="text-sm text-slate-500">待处理</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-lg">
            <Check size={24} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{decisionLogs.length}</p>
            <p className="text-sm text-slate-500">决策日志</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Sparkles size={24} className="text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">
              {Math.round(
                (suggestions.reduce((sum, sug) => sum + sug.confidenceScore, 0) /
                  Math.max(suggestions.length, 1)) *
                  100
              )}
              %
            </p>
            <p className="text-sm text-slate-500">AI平均置信度</p>
          </div>
        </div>
      </div>

      {/* ═══ 高风险预警 + 一键干预 ═══ */}
      {highRiskAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 rounded-xl border-2 border-red-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg animate-pulse">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-800">课程风险预警 — 需要立即优化</h3>
                <p className="text-xs text-red-600 mt-0.5">共 {highRiskAlerts.length} 条未处理的高级别课程预警</p>
              </div>
            </div>
            <span className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-full font-semibold animate-pulse">
              紧急
            </span>
          </div>

          <div className="space-y-3">
            {highRiskAlerts.map(alert => (
              <div key={alert.id} className="bg-white/80 backdrop-blur-sm rounded-xl border border-red-100 p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-bold text-red-800">{alert.title}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded-full">第 {alert.week} 周</span>
                    {alert.moduleId && (
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                        {alert.moduleId === 'm1' ? '色彩基础' : alert.moduleId === 'm2' ? '造型构图' : alert.moduleId === 'm3' ? '风格探索' : '综合创作'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{alert.description}</p>
                </div>
                <button
                  onClick={() => openInterventionModal(alert)}
                  className="flex-shrink-0 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Wand2 size={14} />
                  一键优化
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 人机协同工作台 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：AI 辅助层 */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Brain size={18} className="text-blue-600" />
            AI 辅助层 — 课程预警与建议
          </h3>
          {suggestions.map(sug => {
            const isSelected = selectedSuggestion === sug.id;
            return (
              <div
                key={sug.id}
                onClick={() => setSelectedSuggestion(isSelected ? null : sug.id)}
                className={`bg-white rounded-xl border-2 shadow-sm cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          priorityConfig[sug.priority].bg
                        }`}
                      >
                        {priorityConfig[sug.priority].label}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                        {categoryLabels[sug.category]}
                      </span>
                      <span className="text-xs text-slate-400">第{sug.week}周</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          confidenceBg(sug.confidenceScore)
                        } ${confidenceColor(sug.confidenceScore)}`}
                      >
                        置信度 {Math.round(sug.confidenceScore * 100)}%
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform ${
                        isSelected ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-1">{sug.title}</h4>
                  <p className="text-xs text-slate-600">{sug.description}</p>
                </div>

                {isSelected && (
                  <div className="px-4 pb-4 border-t border-slate-100 pt-4 space-y-4">
                    {/* 数据证据 */}
                    <div>
                      <h5 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                        <Target size={14} /> 数据证据
                      </h5>
                      <ul className="space-y-1">
                        {sug.dataEvidence.map((e, i) => (
                          <li
                            key={i}
                            className="text-xs text-slate-600 flex items-start gap-1.5"
                          >
                            <span className="text-blue-400 mt-0.5">●</span>
                            {e}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 归因分析 */}
                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                      <h5 className="text-xs font-semibold text-amber-800 mb-2">
                        🔍 归因分析
                      </h5>
                      <p className="text-xs text-amber-700 mb-2">
                        <strong>主因：</strong>{sug.attributionAnalysis.primaryFactor}
                      </p>
                      <p className="text-xs text-amber-700 mb-2">
                        <strong>促成因素：</strong>
                        {sug.attributionAnalysis.contributingFactors.join('、')}
                      </p>
                      <div className="mt-2">
                        <p className="text-xs text-amber-600 mb-1">模态贡献度：</p>
                        <div className="space-y-1">
                          {Object.entries(sug.attributionAnalysis.modalityContributions).map(
                            ([modal, contrib]) => (
                              <div key={modal} className="flex items-center gap-2">
                                <span className="text-xs text-slate-600 w-24 truncate">
                                  {modal
                                    .split('_')
                                    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                                    .join(' ')}
                                </span>
                                <div className="flex-1 bg-amber-100 rounded-full h-1.5">
                                  <div
                                    className="bg-amber-500 h-1.5 rounded-full"
                                    style={{ width: `${contrib * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-500 w-8">
                                  {Math.round(contrib * 100)}%
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 右侧：教师决策层 */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Edit3 size={18} className="text-emerald-600" />
            教师决策层 — 课程优化工作台
          </h3>

          {!selected ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 flex flex-col items-center justify-center text-center">
              <Brain size={48} className="text-slate-300 mb-4" />
              <p className="text-sm text-slate-500">请从左侧选择一条 AI 建议</p>
              <p className="text-xs text-slate-400 mt-1">查看详细信息并进行决策</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-800">{selected.title}</h4>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    priorityConfig[selected.priority].bg
                  }`}
                >
                  {priorityConfig[selected.priority].label}
                </span>
              </div>

              {/* 采纳 */}
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <Check size={16} className="text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">采纳建议</span>
                </div>
                <p className="text-xs text-emerald-600 mb-3">
                  采纳后将自动生成课程优化日志，并更新课程状态
                </p>
                <textarea
                  placeholder="输入优化措施说明（可选）..."
                  className="w-full p-2 border border-emerald-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  rows={2}
                  value={selected.teacherDecision || ''}
                  onChange={() => {}}
                />
                <button
                  onClick={() => handleDecision(selected.id, 'approve')}
                  className="mt-2 w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  ✓ 确认采纳
                </button>
              </div>

              {/* 拒绝 */}
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <X size={16} className="text-red-600" />
                  <span className="text-sm font-medium text-red-800">拒绝建议</span>
                </div>
                <p className="text-xs text-red-600 mb-2">
                  拒绝原因将反哺 AI 模型训练，提升后续课程优化建议质量
                </p>
                <select
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="w-full p-2 border border-red-200 rounded-lg text-xs bg-white mb-2 focus:ring-2 focus:ring-red-500"
                >
                  <option value="">请选择拒绝原因</option>
                  {rejectOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <textarea
                  placeholder="补充说明（可选）..."
                  className="w-full p-2 border border-red-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-red-500 resize-none"
                  rows={2}
                  value={aiFeedback}
                  onChange={e => setAiFeedback(e.target.value)}
                />
                <button
                  onClick={() => handleDecision(selected.id, 'reject')}
                  className="mt-2 w-full py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  ✗ 确认拒绝
                </button>
              </div>

              {/* 修改 */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Edit3 size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">优化课程方案</span>
                </div>
                <p className="text-xs text-blue-600 mb-2">
                  保留 AI 建议方向，但调整具体实施方案
                </p>
                <textarea
                  placeholder="描述您的修改方案..."
                  className="w-full p-2 border border-blue-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  value={modifyText}
                  onChange={e => setModifyText(e.target.value)}
                />
                <button
                  onClick={() => handleDecision(selected.id, 'modify')}
                  className="mt-2 w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={14} /> 提交修改方案
                </button>
              </div>

              {/* 决策反馈 */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Sparkles size={12} />
                  您的决策将作为反馈信号，帮助 AI 模型优化后续课程改进建议的准确性和适用性
                </p>
              </div>
            </div>
          )}

          {/* 决策历史 */}
          {decisionLogs.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h4 className="text-sm font-semibold text-slate-800 mb-3">决策日志</h4>
              <div className="space-y-2">
                {decisionLogs.map(log => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 ${
                        log.action === 'approve'
                          ? 'bg-emerald-500'
                          : log.action === 'reject'
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <div>
                      <p className="text-xs font-medium text-slate-700">
                        {log.action === 'approve'
                          ? '采纳'
                          : log.action === 'reject'
                          ? '拒绝'
                          : '修改'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {log.timestamp}
                      </p>
                      {log.feedbackToAI && (
                        <p className="text-xs text-slate-400 mt-1">
                          反馈：{log.feedbackToAI}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 已处理建议汇总 */}
          {processedSuggestions.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h4 className="text-sm font-semibold text-slate-800 mb-3">已处理建议</h4>
              <div className="space-y-2">
                {processedSuggestions.map(sug => (
                  <div
                    key={sug.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="text-xs font-medium text-slate-700">{sug.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        第{sug.week}周 · {categoryLabels[sug.category]}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        sug.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-700'
                          : sug.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {sug.status === 'accepted'
                        ? '已采纳'
                        : sug.status === 'rejected'
                        ? '已拒绝'
                        : '修改后采纳'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 一键干预模态框 */}
      <InterventionModal
        isOpen={showInterventionModal}
        onClose={() => {
          setShowInterventionModal(false);
          setSelectedAlert(null);
        }}
        alert={selectedAlert}
        suggestions={suggestions}
        students={[]}
      />
    </div>
  );
}
