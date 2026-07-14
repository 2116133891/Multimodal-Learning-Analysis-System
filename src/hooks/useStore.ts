// ===== 全局状态管理 =====
import { create } from 'zustand';
import { api } from '../services/api';
import type {
  CourseInfo, Student, LearningRecord, VitalityScore,
  OptimizationSuggestion, DiagnosticAlert, DataQualityMetrics,
  MultimodalFeatureVector, StudentMultimodalProfile, InterventionEffectiveness,
  TeacherDecisionLog,
} from '../types';

interface AppState {
  // 基础数据
  courseInfo: CourseInfo | null;
  students: Student[];
  records: LearningRecord[];
  vitalityScores: VitalityScore[];
  alerts: DiagnosticAlert[];
  dataQuality: DataQualityMetrics | null;
  weeklyAggregates: any[];
  multimodalFeatures: MultimodalFeatureVector[];
  studentProfiles: StudentMultimodalProfile[];
  interventions: InterventionEffectiveness[];

  // AI 建议统一列表（单一数据源）
  suggestions: OptimizationSuggestion[];

  // 决策日志
  decisionLogs: TeacherDecisionLog[];

  // 加载状态
  loading: boolean;
  error: string | null;

  // 操作
  fetchData: () => Promise<void>;
  submitTeacherDecision: (
    suggestionId: string,
    action: 'approve' | 'reject' | 'modify',
    teacherDecision?: string,
    rejectReason?: string,
    feedbackToAI?: string
  ) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // 基础数据
  courseInfo: null,
  students: [],
  records: [],
  vitalityScores: [],
  alerts: [],
  dataQuality: null,
  weeklyAggregates: [],
  multimodalFeatures: [],
  studentProfiles: [],
  interventions: [],

  // AI 建议 & 决策日志
  suggestions: [],
  decisionLogs: [],
  loading: false,
  error: null,

  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const [
        courseInfo,
        students,
        records,
        vitalityScores,
        alerts,
        dataQuality,
        weeklyAggregates,
        multimodalFeatures,
      ] = await Promise.all([
        api.getCourse(),
        api.getStudents(),
        api.getRecords(),
        api.getVitalityScores(),
        api.getAlerts(),
        api.getDataQuality(),
        api.getWeeklyAggregates(),
        api.getMultimodalFeatures(),
      ]);
      set({
        courseInfo,
        students,
        records,
        vitalityScores,
        alerts,
        dataQuality,
        weeklyAggregates,
        multimodalFeatures,
      });

      // 加载 AI 建议
      const allSuggestions = await api.getSuggestions();
      set({ suggestions: allSuggestions, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  submitTeacherDecision: async (
    suggestionId: string,
    action: 'approve' | 'reject' | 'modify',
    teacherDecision?: string,
    rejectReason?: string,
    feedbackToAI?: string
  ) => {
    const { suggestions, decisionLogs } = get();
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;

    // 映射 action → status
    const statusMap: Record<string, string> = {
      approve: 'accepted',
      reject: 'rejected',
      modify: 'modified',
    };
    const status = statusMap[action];

    try {
      await api.submitDecision(suggestionId, status, teacherDecision, rejectReason, feedbackToAI);
    } catch (e) {
      console.warn('后端决策接口不可用，使用本地模式:', e);
    }

    // 更新 suggestion 的 status
    const updatedSuggestions = suggestions.map(s => {
      if (s.id === suggestionId) {
        return {
          ...s,
          status: status as 'accepted' | 'rejected' | 'modified',
          teacherDecision: teacherDecision || s.teacherDecision,
          rejectReason: (rejectReason || s.rejectReason) as any,
        };
      }
      return s;
    });

    // 生成决策日志
    const newLog: TeacherDecisionLog = {
      id: `log_${Date.now()}`,
      suggestionId,
      action,
      timestamp: new Date().toISOString(),
    };
    if (action === 'reject') {
      (newLog as any).rejectReason = rejectReason;
    }
    if (action === 'modify') {
      (newLog as any).modification = teacherDecision;
    }
    if (feedbackToAI) {
      newLog.feedbackToAI = feedbackToAI;
    }

    set({
      suggestions: updatedSuggestions,
      decisionLogs: [...decisionLogs, newLog],
    });
  },
}));
