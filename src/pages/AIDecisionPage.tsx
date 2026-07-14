// ===== AI决策支持页面（重构：人机协同） =====
import { useEffect, useState } from 'react';
import { useStore } from '../hooks/useStore';
import { Brain, Check, X, Edit3, Clock, ChevronDown, Target, Sparkles, Send } from 'lucide-react';

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

export default function AIDecisionPage() {
  const { suggestions, decisionLogs, fetchData, submitTeacherDecision } = useStore();
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [modifyText, setModifyText] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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
            <p className="text-sm text-slate-500">AI建议总数</p>
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

      {/* 人机协同工作台 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：AI 辅助层 */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Brain size={18} className="text-blue-600" />
            AI 辅助层 — 预警与建议
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
            教师决策层 — 人机协同工作台
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
                  采纳后将自动生成交付干预日志，并更新课程状态
                </p>
                <textarea
                  placeholder="输入干预措施说明（可选）..."
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
                  拒绝原因将反哺 AI 模型训练，提升后续建议质量
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
                  <span className="text-sm font-medium text-blue-800">修改干预参数</span>
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
                  您的决策将作为反馈信号，帮助 AI 模型优化后续建议的准确性和适用性
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
    </div>
  );
}
