// ===== 多模态学习分析课程管理系统 - 数据类型定义 =====

// 多模态数据类型
export type DataType = 'behavior' | 'process' | 'outcome' | 'evaluation' | 'feedback';

// 课程模块
export interface CourseModule {
  id: string;
  name: string;
  weekRange: [number, number];
  description: string;
}

// 课程目标
export interface Objective {
  id: string;
  name: string;
  moduleIds: string[];
  dimension: 'knowledge' | 'skill' | 'attitude';
  targetScore: number;
}

// 单条学习数据记录
export interface LearningRecord {
  id: string;
  type: DataType;
  studentId: string;
  moduleId: string;
  objectiveId?: string;
  week: number;
  timestamp: string;
  value: number;        // 量化值 0-100
  rawValue: string;     // 原始值（文本/JSON）
  metadata: Record<string, any>;
}

// 学生信息
export interface Student {
  id: string;
  name: string;
  avatar?: string;
}

// 课程状态（数据融合后的结果）
export interface CourseState {
  moduleId: string;
  moduleName: string;
  week: number;
  engagementScore: number;    // 参与度 0-100
  knowledgeMastery: number[]; // 各目标掌握度
  riskStudents: string[];     // 风险学生ID列表
  overallHealth: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'improving' | 'stable' | 'declining';
}

// AI优化建议
export type SuggestionCategory = 'rhythm' | 'task' | 'evaluation' | 'resource';
export type SuggestionPriority = 'high' | 'medium' | 'low';
export type SuggestionStatus = 'pending' | 'accepted' | 'rejected' | 'modified';

export interface OptimizationSuggestion {
  id: string;
  moduleId: string;
  week: number;
  category: SuggestionCategory;
  priority: SuggestionPriority;
  title: string;
  description: string;
  dataEvidence: string[];     // 支撑数据
  status: SuggestionStatus;
  teacherDecision?: string;
  createdAt: string;
}

// 课程生命力评分
export interface VitalityScore {
  week: number;
  classroomVitality: number;  // 0-100
  creativity: number;
  learningPerception: number;
  resourceExtension: number;
  courseEvolution: number;
  overall: number;
}

// 改进记录
export interface ImprovementRecord {
  id: string;
  week: number;
  suggestionId: string;
  suggestionTitle: string;
  actionTaken: string;
  beforeScore: VitalityScore;
  afterScore?: VitalityScore;
  createdAt: string;
}

// 课程基本信息
export interface CourseInfo {
  name: string;
  type: string;
  semester: string;
  instructor: string;
  totalWeeks: number;
  totalStudents: number;
  modules: CourseModule[];
  objectives: Objective[];
}

// 诊断告警
export interface DiagnosticAlert {
  id: string;
  week: number;
  type: 'low_engagement' | 'knowledge_gap' | 'performance_drop' | 'anomaly';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  studentId?: string;
  moduleId?: string;
}

// 数据质量指标
export interface DataQualityMetrics {
  completeness: number;  // 0-100
  timeliness: number;    // 0-100
  accuracy: number;      // 0-100
  recordCounts: Record<DataType, number>;
}
