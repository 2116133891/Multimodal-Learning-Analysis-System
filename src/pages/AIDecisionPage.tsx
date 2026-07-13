// ===== AI决策支持页面 =====
import { useEffect, useState } from 'react';
import { useStore } from '../hooks/useStore';
import { Brain, Check, X, Edit3, Clock, ArrowRight } from 'lucide-react';

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

export default function AIDecisionPage() {
  const { suggestions, fetchData } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Record<string, { status: string; decision?: string }>>({});

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDecision = (id: string, status: string, decision?: string) => {
    setDecisions(prev => ({ ...prev, [id]: { status, decision } }));
    // 实际场景中会调用API
    useStore.getState().refreshSuggestions();
  };

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');
  const processedSuggestions = suggestions.filter(s => s.status !== 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">AI决策支持</h2>
        <p className="text-sm text-slate-500 mt-1">人机协同驱动的课程优化决策 — AI分析与教师专业经验相结合</p>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <p className="text-2xl font-bold text-slate-800">{processedSuggestions.length}</p>
            <p className="text-sm text-slate-500">已处理</p>
          </div>
        </div>
      </div>

      {/* 建议列表 */}
      <div className="space-y-4">
        {/* 待处理建议 */}
        {pendingSuggestions.map(sug => (
          <div key={sug.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityConfig[sug.priority].bg}`}>
                    {priorityConfig[sug.priority].label}
                  </span>
                  <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                    {categoryLabels[sug.category]}
                  </span>
                  <span className="text-xs text-slate-400">第{sug.week}周</span>
                </div>
                <button
                  onClick={() => setExpandedId(expandedId === sug.id ? null : sug.id)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {expandedId === sug.id ? '收起' : '查看详情'}
                </button>
              </div>

              <h4 className="text-base font-semibold text-slate-800 mb-2">{sug.title}</h4>
              <p className="text-sm text-slate-600 mb-3">{sug.description}</p>

              {expandedId === sug.id && (
                <div className="space-y-4 mt-4">
                  {/* 数据证据 */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-slate-700 mb-2">📊 数据证据</h5>
                    <ul className="space-y-1">
                      {sug.dataEvidence.map((evidence, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                          <ArrowRight size={12} className="mt-0.5 flex-shrink-0 text-slate-400" />
                          {evidence}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 决策按钮 */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleDecision(sug.id, 'accepted')}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                    >
                      <Check size={16} /> 接受建议
                    </button>
                    <button
                      onClick={() => handleDecision(sug.id, 'rejected')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      <X size={16} /> 拒绝建议
                    </button>
                    <button
                      onClick={() => handleDecision(sug.id, 'modified')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Edit3 size={16} /> 修改后采纳
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 已处理建议 */}
        {processedSuggestions.length > 0 && (
          <>
            <h3 className="text-lg font-semibold text-slate-700 pt-4">已处理建议</h3>
            {processedSuggestions.map(sug => {
              const decision = decisions[sug.id];
              return (
                <div key={sug.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 opacity-75">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-slate-700">{sug.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          decision?.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                          decision?.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {decision?.status === 'accepted' ? '已接受' : decision?.status === 'rejected' ? '已拒绝' : '修改后采纳'}
                        </span>
                      </div>
                      {decision?.decision && (
                        <p className="text-xs text-slate-500 mt-1">{decision.decision}</p>
                      )}
                      {sug.teacherDecision && (
                        <p className="text-xs text-slate-500 mt-1">教师决策：{sug.teacherDecision}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
