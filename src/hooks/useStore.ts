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
  suggestions: OptimizationSuggestion[];
  alerts: DiagnosticAlert[];
  dataQuality: DataQualityMetrics | null;
  weeklyAggregates: any[];
  multimodalFeatures: MultimodalFeatureVector[];
  studentProfiles: StudentMultimodalProfile[];
  interventions: InterventionEffectiveness[];

  // 教师决策日志
  decisionLogs: TeacherDecisionLog[];

  // 加载状态
  loading: boolean;
  error: string | null;

  // 操作
  fetchData: () => Promise<void>;
  refreshSuggestions: () => Promise<void>;
  submitTeacherDecision: (suggestionId: string, action: string, decision?: string, rejectReason?: string, feedback?: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  courseInfo: null, students: [], records: [], vitalityScores: [], suggestions: [],
  alerts: [], dataQuality: null, weeklyAggregates: [],
  multimodalFeatures: [], studentProfiles: [], interventions: [],
  decisionLogs: [], loading: false, error: null,

  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const [courseInfo, students, records, vitalityScores, suggestions, alerts, dataQuality, weeklyAggregates, multimodalFeatures] = await Promise.all([
        api.getCourse(), api.getStudents(), api.getRecords(), api.getVitalityScores(),
        api.getSuggestions(), api.getAlerts(), api.getDataQuality(),
        api.getWeeklyAggregates(), api.getMultimodalFeatures(),
        // 学生画像和干预数据从本地生成（不需要API）
        [] as any[], [] as any[]
      ]);
      set({ courseInfo, students, records, vitalityScores, suggestions, alerts, dataQuality, weeklyAggregates, multimodalFeatures, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  refreshSuggestions: async () => {
    try {
      const suggestions = await api.getSuggestions();
      set({ suggestions });
    } catch (e) {
      console.error('刷新建议失败:', e);
    }
  },

  submitTeacherDecision: async (suggestionId: string, action: string, decision?: string, rejectReason?: string, feedback?: string) => {
    try {
      const status = action === 'approve' ? 'accepted' : action === 'reject' ? 'rejected' : 'modified';
      await api.submitDecision(suggestionId, status, decision, rejectReason, feedback);
      // 记录决策日志
      const log: TeacherDecisionLog = {
        id: `log_${Date.now()}`,
        suggestionId,
        action: action as TeacherDecisionLog['action'],
        rejectReason: rejectReason as any,
        modification: action === 'modify' ? decision : undefined,
        feedbackToAI: feedback,
        timestamp: new Date().toISOString(),
      };
      set({ decisionLogs: [...get().decisionLogs, log] });
    } catch (e) {
      console.error('提交决策失败:', e);
    }
  },
}));
