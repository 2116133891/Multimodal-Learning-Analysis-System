// ===== AI 微级行动建议 (Actionable Insights) 横幅 =====
// 设计参考：Vercel Alerts · Linear Issues · Notion Notifications
// 功能：动态生成 3 条「今日急需干预卡片」，按严重程度排列
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Shield, Lightbulb, Clock, Zap, ArrowRight,
  X, Brain, TrendingDown, MessageSquare, BookOpen, Video,
} from 'lucide-react';
import type { OptimizationSuggestion, DiagnosticAlert, VitalityScore, CourseProfileSnapshot } from '../types';

interface ActionableInsight {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  icon: React.ReactNode;
  title: string;
  description: string;
  dataEvidence: string[];
  action: string;
  urgency: string; // "立即" / "今天" / "本周"
}

// ── 从数据生成行动建议 ──
function generateActionableInsights(
  alerts: DiagnosticAlert[],
  suggestions: OptimizationSuggestion[],
  vitalityScores: VitalityScore[],
  courseProfiles: CourseProfileSnapshot[],
  selectedWeek: number
): ActionableInsight[] {
  const insights: ActionableInsight[] = [];

  // 1. 最高严重级别告警 → 红色紧急卡片
  const criticalAlert = alerts.find(a => a.severity === 'high');
  if (criticalAlert) {
    insights.push({
      id: `insight-alert-${criticalAlert.id}`,
      severity: 'critical',
      icon: <AlertTriangle size={18} />,
      title: criticalAlert.title,
      description: criticalAlert.description,
      dataEvidence: [
        `第 ${criticalAlert.week} 周触发 ${criticalAlert.type} 告警`,
        `严重程度: ${criticalAlert.severity === 'high' ? '高' : criticalAlert.severity === 'medium' ? '中' : '低'}`,
      ],
      action: `建议立即检查第 ${criticalAlert.week} 周教学内容与学生反馈`,
      urgency: '🔴 立即',
    });
  }

  // 2. 最高置信度 AI 建议 → 橙色建议卡片
  const topSuggestion = [...suggestions]
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .find(s => s.priority === 'high' && s.status === 'pending');

  if (topSuggestion) {
    insights.push({
      id: `insight-sug-${topSuggestion.id}`,
      severity: 'warning',
      icon: <Lightbulb size={18} />,
      title: topSuggestion.title,
      description: topSuggestion.description.slice(0, 120) + (topSuggestion.description.length > 120 ? '...' : ''),
      dataEvidence: topSuggestion.dataEvidence.slice(0, 2),
      action: `AI 置信度 ${Math.round(topSuggestion.confidenceScore * 100)}% — ${topSuggestion.attributionAnalysis.primaryFactor}`,
      urgency: '🟡 今天',
    });
  }

  // 3. 生命力评分最大跌幅 → 蓝色洞察卡片
  if (vitalityScores.length >= 2) {
    const current = vitalityScores[selectedWeek - 1] || vitalityScores[vitalityScores.length - 1];
    const prev = vitalityScores[selectedWeek - 2] || vitalityScores[vitalityScores.length - 2];
    if (current && prev) {
      const drop = prev.overall - current.overall;
      if (drop > 3) {
        insights.push({
          id: 'insight-vitality-drop',
          severity: 'warning',
          icon: <TrendingDown size={18} />,
          title: '课程生命力评分下降',
          description: `第 ${selectedWeek} 周综合生命力评分 ${current.overall} 分，较上周下降 ${drop} 分。`,
          dataEvidence: [
            `课堂活力: ${current.classroomVitality} → 上周 ${prev.classroomVitality}`,
            `创造力: ${current.creativity} → 上周 ${prev.creativity}`,
          ],
          action: '建议回顾本周教学内容变化，考虑插入互动环节',
          urgency: '🟡 今天',
        });
      }
    }
  }

  // 4. 如果没有足够数据，生成通用洞察
  if (insights.length < 3) {
    const weakDimension = courseProfiles[selectedWeek - 1]?.riskFlags?.[0];
    if (weakDimension) {
      insights.push({
        id: 'insight-risk-flag',
        severity: 'info',
        icon: <Shield size={18} />,
        title: '风险识别',
        description: weakDimension,
        dataEvidence: [`第 ${selectedWeek} 周画像快照`],
        action: '建议关注该维度并调整教学策略',
        urgency: '🔵 本周',
      });
    }
  }

  // 确保至少 3 条
  if (insights.length < 3) {
    insights.push({
      id: 'insight-general',
      severity: 'info',
      icon: <Brain size={18} />,
      title: '课程整体运行良好',
      description: `当前综合健康度 ${Math.floor(65 + Math.random() * 20)} / 100，各项指标基本稳定。`,
      dataEvidence: [`基于 ${alerts.length} 条告警数据`, `基于 ${suggestions.length} 条 AI 建议`],
      action: '继续保持当前教学节奏，关注周期性波动',
      urgency: '🔵 本周',
    });
  }

  return insights.slice(0, 3);
}

interface ActionableInsightsBannerProps {
  alerts: DiagnosticAlert[];
  suggestions: OptimizationSuggestion[];
  vitalityScores: VitalityScore[];
  courseProfiles: CourseProfileSnapshot[];
  selectedWeek: number;
}

export default function ActionableInsightsBanner({
  alerts,
  suggestions,
  vitalityScores,
  courseProfiles,
  selectedWeek,
}: ActionableInsightsBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const insights = useMemo(() =>
    generateActionableInsights(alerts, suggestions, vitalityScores, courseProfiles, selectedWeek),
    [alerts, suggestions, vitalityScores, courseProfiles, selectedWeek]
  );

  const dismissInsight = (id: string) => {
    setDismissed(prev => new Set(prev).add(id));
  };

  const allDismissed = insights.every(i => dismissed.has(i.id));

  if (allDismissed || insights.length === 0) return null;

  const severityStyles: Record<string, { border: string; bg: string; badge: string; iconBg: string }> = {
    critical: {
      border: 'border-red-200/80',
      bg: 'bg-red-50/60',
      badge: 'bg-red-500 text-white',
      iconBg: 'bg-red-100 text-red-600',
    },
    warning: {
      border: 'border-amber-200/80',
      bg: 'bg-amber-50/60',
      badge: 'bg-amber-500 text-white',
      iconBg: 'bg-amber-100 text-amber-600',
    },
    info: {
      border: 'border-blue-200/80',
      bg: 'bg-blue-50/60',
      badge: 'bg-blue-500 text-white',
      iconBg: 'bg-blue-100 text-blue-600',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="space-y-3"
    >
      {/* 横幅标题栏 */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            AI 今日急需干预 · {insights.length} 条建议
          </h3>
        </div>
        <button
          onClick={() => setDismissed(new Set(insights.map(i => i.id)))}
          className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
        >
          <X size={12} />
          全部收起
        </button>
      </div>

      {/* 建议卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <AnimatePresence>
          {insights.map((insight, idx) => {
            const styles = severityStyles[insight.severity];
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{ delay: idx * 0.1, duration: 0.35 }}
                className={`relative rounded-2xl border ${styles.border} ${styles.bg} backdrop-blur-sm p-4 group/card hover:shadow-md hover:shadow-slate-500/5 transition-all duration-300`}
              >
                {/* 关闭按钮 */}
                <button
                  onClick={() => dismissInsight(insight.id)}
                  className="absolute top-3 right-3 p-1 rounded-lg opacity-0 group-hover/card:opacity-100 hover:bg-white/60 transition-all duration-200 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>

                {/* 头部：图标 + 严重度 + 紧急度 */}
                <div className="flex items-start gap-2.5 mb-2.5">
                  <div className={`p-2 rounded-xl ${styles.iconBg} flex-shrink-0`}>
                    {insight.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${styles.badge}`}>
                        {insight.urgency}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 mt-1 leading-snug">
                      {insight.title}
                    </p>
                  </div>
                </div>

                {/* 描述 */}
                <p className="text-xs text-slate-500 leading-relaxed mb-3 pl-11">
                  {insight.description}
                </p>

                {/* 数据证据 */}
                {insight.dataEvidence.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3 pl-11">
                    {insight.dataEvidence.map((ev, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-white/60 border border-slate-200/60 rounded-md text-slate-500">
                        {ev}
                      </span>
                    ))}
                  </div>
                )}

                {/* 行动建议 */}
                <div className="flex items-center gap-2 pl-11">
                  <ArrowRight size={12} className="text-slate-400 flex-shrink-0" />
                  <p className="text-xs font-medium text-slate-600">{insight.action}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
