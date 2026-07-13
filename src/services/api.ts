// ===== API 服务层 =====
const API_BASE = '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

export const api = {
  getCourse: () => request<any>('/api/course'),
  getStudents: () => request<any[]>('/api/students'),
  getRecords: (params?: { type?: string; week?: number; moduleId?: string; studentId?: string }) => {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    if (params?.week) query.set('week', String(params.week));
    if (params?.moduleId) query.set('moduleId', params.moduleId);
    if (params?.studentId) query.set('studentId', params.studentId);
    return request<any[]>(`/api/records${query.toString() ? '?' + query.toString() : ''}`);
  },
  getDataQuality: () => request<any>('/api/data-quality'),
  getWeeklyAggregates: () => request<any[]>('/api/weekly-aggregates'),
  getCourseState: (moduleId: string, week: number) => request<any>(`/api/course-state/${moduleId}/${week}`),
  getVitalityScores: () => request<any[]>('/api/vitality'),
  getVitalityByWeek: (week: number) => request<any>(`/api/vitality/week/${week}`),
  getSuggestions: () => request<any[]>('/api/suggestions'),
  submitDecision: (id: string, status: string, teacherDecision?: string, rejectReason?: string, feedbackToAI?: string) =>
    request<any>(`/api/suggestions/${id}/decision`, {
      method: 'POST', body: JSON.stringify({ status, teacherDecision, rejectReason, feedbackToAI }),
    }),
  getAlerts: () => request<any[]>('/api/alerts'),
  getModuleWeekAgg: (moduleId: string, week: number) => request<any>(`/api/module/${moduleId}/week/${week}`),
  // 多模态数据
  getVideoMicroExpressions: (params?: { studentId?: string; week?: number }) => {
    const query = new URLSearchParams();
    if (params?.studentId) query.set('studentId', params.studentId);
    if (params?.week) query.set('week', String(params.week));
    return request<any[]>(`/api/multimodal/video${query.toString() ? '?' + query.toString() : ''}`);
  },
  getTextSemantics: (params?: { studentId?: string; week?: number; moduleId?: string }) => {
    const query = new URLSearchParams();
    if (params?.studentId) query.set('studentId', params.studentId);
    if (params?.week) query.set('week', String(params.week));
    if (params?.moduleId) query.set('moduleId', params.moduleId);
    return request<any[]>(`/api/multimodal/text${query.toString() ? '?' + query.toString() : ''}`);
  },
  getInteractionBehaviors: (params?: { studentId?: string; week?: number }) => {
    const query = new URLSearchParams();
    if (params?.studentId) query.set('studentId', params.studentId);
    if (params?.week) query.set('week', String(params.week));
    return request<any[]>(`/api/multimodal/interaction${query.toString() ? '?' + query.toString() : ''}`);
  },
  getMultimodalFeatures: (params?: { studentId?: string; week?: number }) => {
    const query = new URLSearchParams();
    if (params?.studentId) query.set('studentId', params.studentId);
    if (params?.week) query.set('week', String(params.week));
    return request<any[]>(`/api/multimodal/features${query.toString() ? '?' + query.toString() : ''}`);
  },
  getEngagementScore: (studentId: string, week: number) =>
    request<any>(`/api/engagement/${studentId}/${week}`),
  getStudentProfile: (studentId: string) => request<any>(`/api/student-profile/${studentId}`),
  getInterventions: () => request<any[]>('/api/interventions'),
  health: () => request<any>('/api/health'),
};
