// ===== 全局状态管理 =====
import { create } from 'zustand';
import { api } from '../services/api';
import type { CourseInfo, Student, LearningRecord, VitalityScore, OptimizationSuggestion, DiagnosticAlert, DataQualityMetrics } from '../types';

interface AppState {
  // 数据
  courseInfo: CourseInfo | null;
  students: Student[];
  records: LearningRecord[];
  vitalityScores: VitalityScore[];
  suggestions: OptimizationSuggestion[];
  alerts: DiagnosticAlert[];
  dataQuality: DataQualityMetrics | null;
  weeklyAggregates: any[];

  // 加载状态
  loading: boolean;
  error: string | null;

  // 操作
  fetchData: () => Promise<void>;
  refreshSuggestions: () => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
  courseInfo: null,
  students: [],
  records: [],
  vitalityScores: [],
  suggestions: [],
  alerts: [],
  dataQuality: null,
  weeklyAggregates: [],
  loading: false,
  error: null,

  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const [courseInfo, students, records, vitalityScores, suggestions, alerts, dataQuality, weeklyAggregates] = await Promise.all([
        api.getCourse(),
        api.getStudents(),
        api.getRecords(),
        api.getVitalityScores(),
        api.getSuggestions(),
        api.getAlerts(),
        api.getDataQuality(),
        api.getWeeklyAggregates(),
      ]);
      set({ courseInfo, students, records, vitalityScores, suggestions, alerts, dataQuality, weeklyAggregates, loading: false });
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
}));
