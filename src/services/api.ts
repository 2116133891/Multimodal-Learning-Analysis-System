// ===== API 服务层 =====
// 使用相对路径，由 Vite 代理转发到后端
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
  // 课程信息
  getCourse: () => request<any>('/api/course'),
  getStudents: () => request<any[]>('/api/students'),

  // 学习数据
  getRecords: (params?: { type?: string; week?: number; moduleId?: string; studentId?: string }) => {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    if (params?.week) query.set('week', String(params.week));
    if (params?.moduleId) query.set('moduleId', params.moduleId);
    if (params?.studentId) query.set('studentId', params.studentId);
    return request<any[]>(`/api/records${query.toString() ? '?' + query.toString() : ''}`);
  },

  // 数据质量
  getDataQuality: () => request<any>('/api/data-quality'),

  // 周聚合
  getWeeklyAggregates: () => request<any[]>('/api/weekly-aggregates'),

  // 课程状态
  getCourseState: (moduleId: string, week: number) =>
    request<any>(`/api/course-state/${moduleId}/${week}`),

  // 生命力评分
  getVitalityScores: () => request<any[]>('/api/vitality'),
  getVitalityByWeek: (week: number) => request<any>(`/api/vitality/week/${week}`),

  // AI建议
  getSuggestions: () => request<any[]>('/api/suggestions'),

  // 提交决策
  submitDecision: (id: string, status: string, teacherDecision?: string) =>
    request<any>(`/api/suggestions/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify({ status, teacherDecision }),
    }),

  // 诊断告警
  getAlerts: () => request<any[]>('/api/alerts'),

  // 模块聚合
  getModuleWeekAgg: (moduleId: string, week: number) =>
    request<any>(`/api/module/${moduleId}/week/${week}`),

  // 健康检查
  health: () => request<any>('/api/health'),
};
