// ===== 多模态学习分析课程管理系统 - 数据类型定义 =====

// ===================== 多模态数据类型 =====================

// 情绪极性（微表情分析）
export interface EmotionPolarity {
  emotion: 'happy' | 'confused' | 'focused' | 'bored' | 'surprised' | 'frustrated';
  score: number;       // 0-1，置信度
  timestamp: string;   // ISO 时间戳
}

// 视频微表情数据（按时间序列）
export interface VideoMicroExpression {
  studentId: string;
  moduleId: string;
  week: number;
  sessionId: string;   // 视频会话ID
  frames: EmotionPolarity[];  // 帧级情绪序列
  aggregated: {
    dominantEmotion: string;
    averageConfidence: number;
    engagementIndicators: number;  // 参与度指标（点头、注视等）
    distractionRate: number;       // 分心率
  };
}

// 文本语义数据（讨论区留言情感分析）
export interface TextSemanticData {
  studentId: string;
  moduleId: string;
  week: number;
  postId: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  sentimentScore: number;   // -1 ~ 1
  keywords: string[];
  topicTags: string[];
  timestamp: string;
}

// 交互行为数据
export interface InteractionBehavior {
  studentId: string;
  moduleId: string;
  week: number;
  actionType: 'click' | 'hover' | 'scroll' | 'pause' | 'seek' | 'download' | 'submit' | 'discuss';
  targetElement: string;   // 目标元素（视频/测验/讨论区等）
  duration: number;        // 停留时长（秒）
  timestamp: string;
  metadata: Record<string, any>;
}

// ===================== 传统学习记录（向后兼容）=====================

export type DataType = 'behavior' | 'process' | 'outcome' | 'evaluation' | 'feedback';

export interface LearningRecord {
  id: string;
  type: DataType;
  studentId: string;
  moduleId: string;
  objectiveId?: string;
  week: number;
  timestamp: string;
  value: number;
  rawValue: string;
  metadata: Record<string, any>;
}

// ===================== 课程基础数据 =====================

export interface CourseModule {
  id: string;
  name: string;
  weekRange: [number, number];
  description: string;
}

export interface Objective {
  id: string;
  name: string;
  moduleIds: string[];
  dimension: 'knowledge' | 'skill' | 'attitude';
  targetScore: number;
}

export interface Student {
  id: string;
  name: string;
  avatar?: string;
}

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

// ===================== 多模态融合结果 =====================

// 单模态特征向量
export interface ModalityFeature {
  modality: 'video_emotion' | 'text_semantic' | 'interaction_behavior' | 'traditional_data';
  score: number;           // 标准化得分 0-100
  weight: number;          // 融合权重
  sampleCount: number;     // 样本数量
  trend: 'rising' | 'stable' | 'falling';
}

// 多模态融合特征
export interface MultimodalFeatureVector {
  studentId: string;
  moduleId: string;
  week: number;
  timestamp: string;
  modalityFeatures: ModalityFeature[];
  // 早融合：拼接后统一编码
  earlyFusionScore: number;
  // 晚融合：各模态独立推理后投票/加权
  lateFusionScore: number;
  // 综合学习投入度
  engagementScore: number;
  // 模态一致性（各模态是否指向同一结论）
  modalityConsistency: number;
}

// ===================== 课程状态 =====================

export interface CourseState {
  moduleId: string;
  moduleName: string;
  week: number;
  engagementScore: number;
  knowledgeMastery: number[];
  riskStudents: string[];
  overallHealth: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'improving' | 'stable' | 'declining';
}

// ===================== AI 优化建议（增强版）=====================

export type SuggestionCategory = 'rhythm' | 'task' | 'evaluation' | 'resource';
export type SuggestionPriority = 'high' | 'medium' | 'low';
export type SuggestionStatus = 'pending' | 'accepted' | 'rejected' | 'modified';
export type RejectReason = 'insufficient_evidence' | 'conflicts_with_pedagogy' | 'timing_not_appropriate' | 'too_expensive' | 'other';

export interface OptimizationSuggestion {
  id: string;
  moduleId: string;
  week: number;
  category: SuggestionCategory;
  priority: SuggestionPriority;
  title: string;
  description: string;
  dataEvidence: string[];
  // 新增：AI 置信度和归因分析
  confidenceScore: number;    // 0-1，AI 建议的可信度
  attributionAnalysis: {      // 归因分析
    primaryFactor: string;    // 主因
    contributingFactors: string[]; // 促成因素
    modalityContributions: Record<string, number>; // 各模态贡献度
  };
  status: SuggestionStatus;
  teacherDecision?: string;
  rejectReason?: RejectReason;
  createdAt: string;
}

// ===================== 教师决策日志 =====================

export interface TeacherDecisionLog {
  id: string;
  suggestionId: string;
  action: 'approve' | 'reject' | 'modify';
  rejectReason?: RejectReason;
  modification?: string;
  feedbackToAI?: string;  // 反哺 AI 训练的反馈
  timestamp: string;
}

// ===================== 课程生命力评分 =====================

export interface VitalityScore {
  week: number;
  classroomVitality: number;
  creativity: number;
  learningPerception: number;
  resourceExtension: number;
  courseEvolution: number;
  overall: number;
}

// ===================== 改进记录 =====================

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

// ===================== 诊断告警 =====================

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

// ===================== 数据质量指标 =====================

export interface DataQualityMetrics {
  completeness: number;
  timeliness: number;
  accuracy: number;
  recordCounts: Record<DataType, number>;
}

// ===================== 学生多模态画像 =====================

export interface StudentMultimodalProfile {
  studentId: string;
  studentName: string;
  week: number;
  // 五维能力雷达
  abilityRadar: {
    knowledge: number;    // 知识掌握
    skill: number;        // 技能应用
    creativity: number;   // 创新能力
    collaboration: number;// 协作能力
    attitude: number;     // 学习态度
  };
  // 模态特征
  videoEmotionAvg: number;      // 视频情绪均值（专注度）
  textSentimentAvg: number;     // 文本情感均值
  interactionAvg: number;       // 交互活跃度
  engagementScore: number;      // 综合投入度
  // AI 诊断
  bottleneck: string;           // 学习瓶颈
  bottleneckScore: number;      // 瓶颈程度 0-100
  recommendations: string[];    // AI 个性化建议
  // 发展轨迹（近4周）
  trajectory: {
    week: number;
    engagementScore: number;
    abilityRadar: { knowledge: number; skill: number; creativity: number; collaboration: number; attitude: number; };
  }[];
}

// ===================== 干预有效性评估 =====================

export interface InterventionEffectiveness {
  interventionId: string;
  interventionType: string;
  description: string;
  week: number;
  // 干预前指标
  preIntervention: {
    classroomVitality: number;
    creativity: number;
    learningPerception: number;
    resourceExtension: number;
    courseEvolution: number;
    overallEngagement: number;
  };
  // 干预后指标
  postIntervention: {
    classroomVitality: number;
    creativity: number;
    learningPerception: number;
    resourceExtension: number;
    courseEvolution: number;
    overallEngagement: number;
  };
  // 改善幅度
  improvement: {
    classroomVitality: number;
    creativity: number;
    learningPerception: number;
    resourceExtension: number;
    courseEvolution: number;
    overallEngagement: number;
  };
  effectivenessScore: number;  // 0-100，干预有效性评分
}
