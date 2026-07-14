// ===== API 服务层（含 Mock 降级机制） =====
import {
  mockCourseInfo,
  mockStudents,
  generateMockRecords,
  generateMockVitalityScores,
  mockAlerts,
  generateMockDataQuality,
  generateMockMultimodalFeatures,
  mockSuggestions,
  mockInterventions,
} from '../data/mockData';

const API_BASE = '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

/**
 * 安全请求：尝试后端 API，失败则返回对应 Mock 数据
 * 这是 Vercel 等无后端环境的核心降级机制
 */
async function requestWithFallback<T>(path: string, fallback: T): Promise<T> {
  try {
    return await request<T>(path);
  } catch {
    return fallback;
  }
}

// 预生成一次 mock records 供 getDataQuality 复用
const _mockRecords = generateMockRecords();
const _mockDataQuality = generateMockDataQuality(_mockRecords);

export const api = {
  getCourse: () => requestWithFallback<any>('/api/course', mockCourseInfo),
  getStudents: () => requestWithFallback<any[]>('/api/students', mockStudents),
  getRecords: (params?: { type?: string; week?: number; moduleId?: string; studentId?: string }) => {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    if (params?.week) query.set('week', String(params.week));
    if (params?.moduleId) query.set('moduleId', params.moduleId);
    if (params?.studentId) query.set('studentId', params.studentId);
    const path = `/api/records${query.toString() ? '?' + query.toString() : ''}`;
    return requestWithFallback<any[]>(path, _mockRecords);
  },
  getDataQuality: () => requestWithFallback<any>('/api/data-quality', _mockDataQuality),
  getWeeklyAggregates: () => requestWithFallback<any[]>('/api/weekly-aggregates', []),
  getCourseState: (moduleId: string, week: number) => requestWithFallback<any>(`/api/course-state/${moduleId}/${week}`, {}),
  getVitalityScores: () => requestWithFallback<any[]>('/api/vitality', generateMockVitalityScores()),
  getVitalityByWeek: (week: number) => requestWithFallback<any>(`/api/vitality/week/${week}`, {}),
  getSuggestions: () => requestWithFallback<any[]>('/api/suggestions', mockSuggestions),
  submitDecision: (id: string, status: string, teacherDecision?: string, rejectReason?: string, feedbackToAI?: string) =>
    requestWithFallback<any>(`/api/suggestions/${id}/decision`, {}),
  getAlerts: () => requestWithFallback<any[]>('/api/alerts', mockAlerts),
  getModuleWeekAgg: (moduleId: string, week: number) => requestWithFallback<any>(`/api/module/${moduleId}/week/${week}`, {}),
  // 多模态数据
  getVideoMicroExpressions: (params?: { studentId?: string; week?: number }) => {
    const query = new URLSearchParams();
    if (params?.studentId) query.set('studentId', params.studentId);
    if (params?.week) query.set('week', String(params.week));
    return requestWithFallback<any[]>(`/api/multimodal/video${query.toString() ? '?' + query.toString() : ''}`, []);
  },
  getTextSemantics: (params?: { studentId?: string; week?: number; moduleId?: string }) => {
    const query = new URLSearchParams();
    if (params?.studentId) query.set('studentId', params.studentId);
    if (params?.week) query.set('week', String(params.week));
    if (params?.moduleId) query.set('moduleId', params.moduleId);
    return requestWithFallback<any[]>(`/api/multimodal/text${query.toString() ? '?' + query.toString() : ''}`, []);
  },
  getInteractionBehaviors: (params?: { studentId?: string; week?: number }) => {
    const query = new URLSearchParams();
    if (params?.studentId) query.set('studentId', params.studentId);
    if (params?.week) query.set('week', String(params.week));
    return requestWithFallback<any[]>(`/api/multimodal/interaction${query.toString() ? '?' + query.toString() : ''}`, []);
  },
  getMultimodalFeatures: (params?: { studentId?: string; week?: number }) => {
    const query = new URLSearchParams();
    if (params?.studentId) query.set('studentId', params.studentId);
    if (params?.week) query.set('week', String(params.week));
    return requestWithFallback<any[]>(`/api/multimodal/features${query.toString() ? '?' + query.toString() : ''}`, generateMockMultimodalFeatures());
  },
  getEngagementScore: (studentId: string, week: number) =>
    requestWithFallback<any>(`/api/engagement/${studentId}/${week}`, {}),
  getStudentProfile: (studentId: string) => requestWithFallback<any>(`/api/student-profile/${studentId}`, {}),
  getInterventions: () => requestWithFallback<any[]>('/api/interventions', mockInterventions),
  health: () => requestWithFallback<any>('/api/health', { status: 'ok' }),
};
