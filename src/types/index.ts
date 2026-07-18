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

// ===================== 多模态时序数据（Time-Series Alignment）=====================

// 单时间点多模态对齐数据
export interface MultimodalTimeSeriesPoint {
  timestamp: string;   // ISO 时间戳
  videoEmotion: number;       // 0-1，视频微表情情绪值（专注度）
  textSentiment: number;      // 0-1，文本语义情感值
  interactionCount: number;   // 整数，交互行为频次
}

// 学生-周级别的完整多模态时序数据集
export interface StudentMultimodalTimeSeries {
  studentId: string;
  week: number;
  moduleId: string;
  // 10 个时间点对齐的多模态序列
  points: MultimodalTimeSeriesPoint[];
  // 融合后的投入度得分序列
  fusionEngagementScore: number[];
  // 各模态统计摘要
  summary: {
    avgVideoEmotion: number;
    avgTextSentiment: number;
    totalInteractions: number;
    engagementTrend: 'rising' | 'stable' | 'declining';
  };
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

// ===================== 课程画像数据（Course Profile）=====================

// 教师教学状态维度
export interface TeachingState {
  teachingPace: number;        // 讲授语速（字/分钟），标准化 0-100
  emotionalEngagement: number; // 情绪饱满度（语调变化、肢体语言丰富度）
  movementFrequency: number;   // 走动频次（每节课教室移动次数）
  eyeContactRate: number;      // 眼神交流覆盖率（%）
  questionRate: number;        // 提问频次（每节课）
  lectureRatio: number;        // 讲授占比（%）vs 学生活动占比
  pacingVariation: number;     // 语速变化系数（反映节奏感）
}

// 课程平台资源维度
export interface ResourceUtilization {
  slideCompletionRate: number;     // 课件完播率（%）
  difficultyReplayRate: number;    // 难点回放率（%）
  resourceDownloadCount: number;   // 资源下载量
  videoWatchDepth: number;         // 视频观看深度（平均看完百分比）
  materialAccessFreq: number;      // 资料访问频次（每日）
  resourceRequestCount: number;    // 资源请求量
  contentCoverage: number;         // 内容覆盖率（%）
  resourceSatisfaction: number;    // 资源满意度（%）
}

// 互动方式与教学方法维度
export interface InteractionMethod {
  qAndFFrequency: number;       // 师生问答频次（每节课）
  groupDiscussionHeat: number;  // 小组讨论热度（活跃度指数）
  danmakuActivity: number;      // 弹幕活跃度（每分钟条数）
  discussionBoardActivity: number; // 讨论区活跃度（帖子/回复数）
  peerReviewCount: number;      // 同伴互评次数
  livePollParticipation: number; // 实时投票参与率（%）
  thinkPairShareFreq: number;   // 思考-配对-分享频次
  flipClassParticipation: number; // 翻转课堂参与率（%）
}

// 教学方法维度（新增第五维度）
export interface TeachingMethod {
  caseTeachingScore: number;    // 案例教学得分（案例 richness、相关性）
  flippedClassScore: number;    // 翻转课堂得分（课前-课中-课后连贯性）
  projectBasedScore: number;    // 项目驱动得分（项目完成度、创新性）
  scaffoldedLearningScore: number; // 支架式教学得分（脚手架有效性）
  cooperativeLearningScore: number; // 合作学习得分（小组协作质量）
  inquiryBasedScore: number;    // 探究式学习得分（学生自主探究程度）
  differentiationScore: number; // 差异化教学得分（分层教学适配度）
  formativeAssessmentScore: number; // 形成性评价得分（过程性反馈频率）
}

// 教学环境维度（新增第六维度）
export interface TeachingEnvironment {
  classroomTemperature: number;   // 教室温度舒适度（标准化 0-100）
  lightingLevel: number;          // 光照强度评分
  acousticsQuality: number;       // 声学环境质量（噪音水平、回声控制）
  seatingArrangement: number;     // 座位排列合理性（U型、小组型、传统型）
  ventilationQuality: number;     // 通风换气质量
  equipmentFunctionality: number; // 教学设备完好率（投影仪、音响、空调）
  roomCapacityRatio: number;      // 教室容量利用率（%）
  accessibilityScore: number;    // 无障碍设施评分
  environmentalSatisfaction: number; // 学生对教学环境的满意度
}

// 课程画像综合维度（六维）
export interface CourseProfileDimension {
  teachingState: TeachingState;
  resourceUtilization: ResourceUtilization;
  interactionMethod: InteractionMethod;
  teachingMethod: TeachingMethod; // 第五维度：教学方法
  teachingEnvironment: TeachingEnvironment; // 第六维度：教学环境
}

// 课程画像周度快照
export interface CourseProfileSnapshot {
  week: number;
  dimension: CourseProfileDimension;
  overallHealth: number;         // 课程综合健康度 0-100
  healthGrade: 'A' | 'B' | 'C' | 'D'; // 健康等级
  riskFlags: string[];           // 风险标签
  improvementSignals: string[];  // 改善信号
  pdcaStage: 'plan' | 'do' | 'check' | 'act'; // PDCA 循环阶段
  obeAchievement: number;        // OBE 目标达成度 0-100
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
