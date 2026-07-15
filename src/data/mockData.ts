// ===== 前端可用 Mock 数据（从 server/data/mockData.ts 提取） =====
// 用于 Vercel 等无后端环境的数据降级（Fallback）
import type {
  CourseInfo, Student, LearningRecord, VitalityScore,
  OptimizationSuggestion, DiagnosticAlert, DataQualityMetrics, DataType,
  MultimodalFeatureVector, ModalityFeature,
  StudentMultimodalProfile, InterventionEffectiveness,
  StudentMultimodalTimeSeries,
  CourseProfileSnapshot, TeachingState, ResourceUtilization, InteractionMethod,
} from '../types';

// ===================== 课程信息 =====================

export const mockCourseInfo: CourseInfo = {
  name: '原画规律',
  type: '线上线下混合式',
  semester: '2025年春季',
  instructor: '柯文燕',
  totalWeeks: 16,
  totalStudents: 30,
  modules: [
    { id: 'm1', name: '色彩基础与原理', weekRange: [1, 4], description: '色彩理论、配色原则、光影表现' },
    { id: 'm2', name: '造型与构图', weekRange: [5, 8], description: '造型能力、画面构图、视觉引导' },
    { id: 'm3', name: '风格探索与创新', weekRange: [9, 12], description: '个人风格、创意表达、跨媒介尝试' },
    { id: 'm4', name: '综合创作与展示', weekRange: [13, 16], description: '完整作品创作、策展展示、反思总结' },
  ],
  objectives: [
    { id: 'o1', name: '知识目标1：掌握色彩基本原理', moduleIds: ['m1'], dimension: 'knowledge', targetScore: 85 },
    { id: 'o2', name: '知识目标2：理解造型构图法则', moduleIds: ['m2'], dimension: 'knowledge', targetScore: 80 },
    { id: 'o3', name: '技能目标1：具备色彩应用能力', moduleIds: ['m1', 'm3'], dimension: 'skill', targetScore: 85 },
    { id: 'o4', name: '技能目标2：独立完成作品创作', moduleIds: ['m3', 'm4'], dimension: 'skill', targetScore: 80 },
    { id: 'o5', name: '态度目标1：培养审美素养', moduleIds: ['m1', 'm2', 'm3', 'm4'], dimension: 'attitude', targetScore: 90 },
  ],
};

// ===================== 学生名单 =====================

const studentNames = [
  '张明', '李华', '王芳', '刘洋', '陈静',
  '杨帆', '赵磊', '黄丽', '周杰', '吴敏',
  '徐浩', '孙婷', '马超', '朱红', '胡斌',
  '林峰', '何雪', '高远', '罗刚', '梁丽',
  '宋佳', '谢鹏', '韩冰', '唐亮', '冯瑶',
  '曹骏', '邓薇', '萧峰', '田甜', '潘磊',
];

export const mockStudents: Student[] = studentNames.map((name, i) => ({
  id: `s${String(i + 1).padStart(3, '0')}`,
  name,
}));

// ===================== 传统学习记录 =====================

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateMockRecords(): LearningRecord[] {
  const records: LearningRecord[] = [];
  let id = 1;
  const rand = seededRandom(42);

  for (const student of mockStudents) {
    for (let week = 1; week <= 16; week++) {
      // behavior
      const loginCount = Math.floor(rand() * 10) + 1;
      const watchTime = Math.floor(rand() * 120) + 10;
      const posts = Math.floor(rand() * 5);
      const engagement = Math.min(100, Math.floor(loginCount * 5 + watchTime * 0.5 + posts * 8));
      const adjustedEngagement = student.id <= 's005' && week > 10
        ? Math.max(20, engagement - Math.floor(rand() * 30))
        : engagement;

      records.push({
        id: `b${String(id++).padStart(4, '0')}`,
        type: 'behavior',
        studentId: student.id,
        moduleId: week <= 4 ? 'm1' : week <= 8 ? 'm2' : week <= 12 ? 'm3' : 'm4',
        week,
        timestamp: `2025-0${week <= 4 ? week : week <= 8 ? week - 3 : week - 7}-15T14:30:00Z`,
        value: adjustedEngagement,
        rawValue: JSON.stringify({ loginCount, watchTime, posts }),
        metadata: { source: '智慧教学平台' },
      });
    }

    for (let week = 1; week <= 16; week++) {
      const homeworkScore = Math.floor(rand() * 30) + 60;
      const quizScore = Math.floor(rand() * 35) + 55;
      const interaction = Math.floor(rand() * 10) + 1;

      records.push({
        id: `p${String(id++).padStart(4, '0')}`,
        type: 'process',
        studentId: student.id,
        moduleId: week <= 4 ? 'm1' : week <= 8 ? 'm2' : week <= 12 ? 'm3' : 'm4',
        objectiveId: week <= 4 ? 'o1' : week <= 8 ? 'o2' : week <= 12 ? 'o3' : 'o4',
        week,
        timestamp: `2025-0${week <= 4 ? week : week <= 8 ? week - 3 : week - 7}-20T10:00:00Z`,
        value: Math.floor((homeworkScore + quizScore) / 2),
        rawValue: JSON.stringify({ homeworkScore, quizScore, interaction }),
        metadata: { source: '在线作业系统' },
      });
    }

    // outcome — 每周都有，模拟随课程深入成绩逐步提升
    for (let week = 1; week <= 16; week++) {
      // 学习趋势：前期 10-30 分波动，后期 30-50 分波动
      const trendOffset = Math.floor((week - 1) / 16 * 20); // 第1周偏移0，第16周偏移~19
      const examScore = Math.floor(rand() * (20 + trendOffset)) + 10 + trendOffset;
      const projectScore = Math.floor(rand() * (20 + trendOffset)) + 10 + trendOffset;
      const clampedExam = Math.min(100, Math.max(0, examScore));
      const clampedProject = Math.min(100, Math.max(0, projectScore));

      records.push({
        id: `o${String(id++).padStart(4, '0')}`,
        type: 'outcome',
        studentId: student.id,
        moduleId: week <= 4 ? 'm1' : week <= 8 ? 'm2' : week <= 12 ? 'm3' : 'm4',
        week,
        timestamp: `2025-0${Math.min(12, Math.ceil(week / 4))}-25T16:00:00Z`,
        value: Math.floor((clampedExam + clampedProject) / 2),
        rawValue: JSON.stringify({ examScore: clampedExam, projectScore: clampedProject }),
        metadata: { source: '考试系统' },
      });
    }
  }

  // evaluation (every 2 weeks)
  for (const student of mockStudents) {
    for (let week = 1; week <= 16; week += 2) {
      records.push({
        id: `e${String(id++).padStart(4, '0')}`,
        type: 'evaluation',
        studentId: student.id,
        moduleId: week <= 4 ? 'm1' : week <= 8 ? 'm2' : week <= 12 ? 'm3' : 'm4',
        week,
        timestamp: `2025-0${week <= 4 ? week : week <= 8 ? week - 3 : week - 7}-28T09:00:00Z`,
        value: Math.floor(rand() * 25) + 70,
        rawValue: '课堂表现积极，积极参与讨论',
        metadata: { source: '教师评价系统' },
      });
    }
  }

  // feedback (every 4 weeks)
  for (let week = 1; week <= 16; week += 4) {
    for (let i = 0; i < 5; i++) {
      records.push({
        id: `f${String(id++).padStart(4, '0')}`,
        type: 'feedback',
        studentId: mockStudents[Math.floor(rand() * mockStudents.length)].id,
        moduleId: week <= 4 ? 'm1' : week <= 8 ? 'm2' : week <= 12 ? 'm3' : 'm4',
        week,
        timestamp: `2025-0${week <= 4 ? week : week <= 8 ? week - 3 : week - 7}-30T18:00:00Z`,
        value: Math.floor(rand() * 30) + 65,
        rawValue: JSON.stringify({ satisfaction: 80, suggestions: '课程内容充实' }),
        metadata: { source: '课程反馈问卷' },
      });
    }
  }

  return records;
}

// ===================== 多模态特征融合结果 =====================

export function generateMockMultimodalFeatures(): MultimodalFeatureVector[] {
  const features: MultimodalFeatureVector[] = [];
  const rand = seededRandom(123);

  for (const student of mockStudents) {
    for (let week = 1; week <= 16; week++) {
      const videoScore = student.id <= 's005' && week > 10
        ? 40 + rand() * 20
        : 60 + rand() * 35;
      const textScore = 50 + rand() * 45;
      const interactionScore = student.id <= 's005' && week > 10
        ? 30 + rand() * 25
        : 55 + rand() * 40;
      const traditionalScore = 55 + rand() * 40;

      const modalityFeatures: ModalityFeature[] = [
        { modality: 'video_emotion', score: Math.min(100, videoScore), weight: 0.3, sampleCount: 20, trend: 'stable' },
        { modality: 'text_semantic', score: Math.min(100, textScore), weight: 0.25, sampleCount: Math.floor(rand() * 4) + 1, trend: 'rising' },
        { modality: 'interaction_behavior', score: Math.min(100, interactionScore), weight: 0.25, sampleCount: Math.floor(rand() * 10) + 5, trend: 'stable' },
        { modality: 'traditional_data', score: Math.min(100, traditionalScore), weight: 0.2, sampleCount: 3, trend: 'stable' },
      ];

      const earlyFusionScore = Math.round(
        modalityFeatures.reduce((s, m) => s + m.score * m.weight, 0)
      );
      const lateFusionScore = Math.min(100, Math.max(20, earlyFusionScore + Math.floor((rand() - 0.5) * 15)));
      const scores = modalityFeatures.map(m => m.score);
      const variance = scores.reduce((s, v) => s + (v - earlyFusionScore) ** 2, 0) / scores.length;
      const modalityConsistency = Math.max(0, Math.min(100, Math.round(100 - Math.sqrt(variance))));

      features.push({
        studentId: student.id,
        moduleId: week <= 4 ? 'm1' : week <= 8 ? 'm2' : week <= 12 ? 'm3' : 'm4',
        week,
        timestamp: `2025-W${week}`,
        modalityFeatures,
        earlyFusionScore,
        lateFusionScore,
        engagementScore: lateFusionScore,
        modalityConsistency,
      });
    }
  }
  return features;
}

// ===================== 生命力评分 =====================

export function generateMockVitalityScores(): VitalityScore[] {
  const scores: VitalityScore[] = [];
  const rand = seededRandom(777);
  for (let week = 1; week <= 16; week++) {
    const base = 60 + Math.sin(week * 0.4) * 15 + week * 1.2;
    scores.push({
      week,
      classroomVitality: Math.min(100, Math.max(30, Math.floor(base + rand() * 10))),
      creativity: Math.min(100, Math.max(30, Math.floor(base * 0.9 + rand() * 12))),
      learningPerception: Math.min(100, Math.max(30, Math.floor(base * 0.95 + rand() * 8))),
      resourceExtension: Math.min(100, Math.max(30, Math.floor(base * 0.85 + rand() * 15))),
      courseEvolution: Math.min(100, Math.max(30, Math.floor(base * 0.8 + rand() * 10))),
      overall: Math.min(100, Math.max(30, Math.floor(base + rand() * 5))),
    });
  }
  return scores;
}

// ===================== AI 优化建议 =====================

export const mockSuggestions: OptimizationSuggestion[] = [
  {
    id: 'sug1', moduleId: 'm1', week: 3, category: 'rhythm', priority: 'high',
    title: '建议增加色彩理论实践课时',
    description: '第3周多模态分析显示学生在色彩原理相关内容参与度显著下降。视频微表情分析表明 bored 情绪占比上升至35%，文本情感分析显示讨论区负面情绪增多。',
    dataEvidence: ['视频专注度降至42%', '讨论区情感得分-0.3', '课后测验平均分低于目标15分'],
    confidenceScore: 0.87,
    attributionAnalysis: {
      primaryFactor: '理论讲授占比过高（70%），缺乏实践环节',
      contributingFactors: ['视频分心率35%', '讨论区负面情感占比28%', '作业完成率仅62%'],
      modalityContributions: { video_emotion: 0.35, text_semantic: 0.25, interaction_behavior: 0.2, traditional_data: 0.2 },
    },
    status: 'accepted',
    teacherDecision: '采纳建议，在第5周增加了色彩搭配实践课',
    createdAt: '2025-02-20T10:00:00Z',
  },
  {
    id: 'sug2', moduleId: 'm2', week: 6, category: 'task', priority: 'high',
    title: '造型练习任务难度需分层设计',
    description: '第6周学习成果数据显示30%的学生在造型基础练习中得分低于70分。交互行为数据显示这些学生在复杂任务上的平均停留时长仅为简单任务的40%。',
    dataEvidence: ['30%学生造型得分低于70分', '交互停留时长差异达60%', '视频分心率在第6周升至42%'],
    confidenceScore: 0.91,
    attributionAnalysis: {
      primaryFactor: '任务难度梯度不合理，缺乏过渡设计',
      contributingFactors: ['任务复杂度跳跃过大', '缺少脚手架支持', '学生自评难度感知偏差'],
      modalityContributions: { video_emotion: 0.2, text_semantic: 0.15, interaction_behavior: 0.35, traditional_data: 0.3 },
    },
    status: 'accepted',
    teacherDecision: '设计了分层造型练习任务，基础组侧重几何体写生',
    createdAt: '2025-03-20T10:00:00Z',
  },
  {
    id: 'sug3', moduleId: 'm2', week: 7, category: 'evaluation', priority: 'medium',
    title: '引入过程性评价替代单一结果评价',
    description: '第7周教师评价数据显示仅凭期末作品评分无法全面反映学习过程。多模态一致性分析显示传统评价与行为数据偏差率达25%。',
    dataEvidence: ['过程性数据缺失导致评价偏差率约25%', '学生反馈评分与作品实际质量相关性弱', '模态一致性仅58%'],
    confidenceScore: 0.72,
    attributionAnalysis: {
      primaryFactor: '评价体系过于单一，缺乏过程维度',
      contributingFactors: ['期末作品占比80%', '缺少草图/修改记录评价', '同伴互评未纳入'],
      modalityContributions: { video_emotion: 0.1, text_semantic: 0.15, interaction_behavior: 0.2, traditional_data: 0.55 },
    },
    status: 'modified',
    teacherDecision: '部分采纳，增加了草图提交环节',
    createdAt: '2025-03-27T10:00:00Z',
  },
  {
    id: 'sug4', moduleId: 'm3', week: 10, category: 'resource', priority: 'medium',
    title: '补充风格探索类教学资源',
    description: '第10周文本语义分析显示讨论区"风格探索"相关话题情感得分为0.78（积极），发帖量增长40%。但现有资源库仅覆盖8种风格。',
    dataEvidence: ['讨论区发帖量增长40%', '情感得分0.78（高度积极）', '风格覆盖率仅8种'],
    confidenceScore: 0.83,
    attributionAnalysis: {
      primaryFactor: '学生兴趣高涨但资源供给不足',
      contributingFactors: ['风格探索话题占比讨论总量35%', '资源请求量居各模块首位', '学生问卷支持率85%'],
      modalityContributions: { video_emotion: 0.15, text_semantic: 0.4, interaction_behavior: 0.25, traditional_data: 0.2 },
    },
    status: 'accepted',
    teacherDecision: '建立了包含20个艺术家风格案例的资源库',
    createdAt: '2025-04-20T10:00:00Z',
  },
  {
    id: 'sug5', moduleId: 'm3', week: 11, category: 'rhythm', priority: 'low',
    title: '调整小组协作节奏',
    description: '第11周交互行为数据显示小组项目中部分学生贡献度不均衡，但教师反馈当前分组方式效果良好。',
    dataEvidence: ['3名学生贡献度超过70%', '讨论区活跃学生集中在5人'],
    confidenceScore: 0.55,
    attributionAnalysis: {
      primaryFactor: '小组分工不均，但整体协作氛围良好',
      contributingFactors: ['角色未轮换', '缺乏过程监控', '个别学生主导倾向'],
      modalityContributions: { video_emotion: 0.1, text_semantic: 0.2, interaction_behavior: 0.5, traditional_data: 0.2 },
    },
    status: 'rejected',
    rejectReason: 'conflicts_with_pedagogy' as any,
    teacherDecision: '认为当前分组方式合理',
    createdAt: '2025-04-27T10:00:00Z',
  },
  {
    id: 'sug6', moduleId: 'm4', week: 14, category: 'task', priority: 'high',
    title: '综合创作阶段需增加中期检查点',
    description: '第14周多模态综合分析显示学生普遍感到方向迷茫。视频专注度降至52分，文本情感分析显示"迷茫""不确定"关键词出现频率增加3倍。',
    dataEvidence: ['综合创作初期平均参与度仅58分', '"迷茫"关键词出现频率+300%', '视频专注度52分'],
    confidenceScore: 0.89,
    attributionAnalysis: {
      primaryFactor: '创作阶段缺乏阶段性目标和反馈机制',
      contributingFactors: ['任务开放性过高', '缺少里程碑检查', '教师指导频率不足'],
      modalityContributions: { video_emotion: 0.3, text_semantic: 0.3, interaction_behavior: 0.2, traditional_data: 0.2 },
    },
    status: 'accepted',
    teacherDecision: '设置了草图审查和初稿审查两个中期检查点',
    createdAt: '2025-05-15T10:00:00Z',
  },
  {
    id: 'sug7', moduleId: 'm4', week: 15, category: 'resource', priority: 'low',
    title: '策展展示环节可增加虚拟展厅',
    description: '第15周课程反馈数据显示实体展览满意度仅72分。文本情感分析显示"虚拟展厅""线上展示"相关讨论情感得分为0.65。',
    dataEvidence: ['展览环节满意度72分', '"虚拟展厅"讨论情感得分0.65', '线上展厅概念支持率85%'],
    confidenceScore: 0.68,
    attributionAnalysis: {
      primaryFactor: '展示形式单一，未能充分利用数字化手段',
      contributingFactors: ['实体展览覆盖范围有限', '学生数字化展示意愿高', '技术实现成本可控'],
      modalityContributions: { video_emotion: 0.1, text_semantic: 0.35, interaction_behavior: 0.15, traditional_data: 0.4 },
    },
    status: 'pending',
    createdAt: '2025-05-22T10:00:00Z',
  },
  {
    id: 'sug8', moduleId: 'm1', week: 3, category: 'rhythm', priority: 'high',
    title: '线上视频第3章出现大面积困惑表情，建议线下课堂增加 15 分钟实操演示',
    description: '线上视频学习分析显示：第 3 章"色彩三要素"视频段（12:00-18:00）学生困惑（confused）表情占比高达 42%，远高于全课程均值 12%。',
    dataEvidence: ['线上视频困惑表情占比 42%（课程均值 12%）', '讨论区"配色"提问量 +300%', '线上章节测验平均分仅 58 分（目标 ≥75）'],
    confidenceScore: 0.93,
    attributionAnalysis: {
      primaryFactor: '线上视频缺乏即时互动反馈，学生在抽象色彩概念处产生认知滞留',
      contributingFactors: ['视频讲解速度过快', '缺少随堂即时测验', '线下课堂距离线上视频间隔 3 天'],
      modalityContributions: { video_emotion: 0.45, text_semantic: 0.25, interaction_behavior: 0.2, traditional_data: 0.1 },
    },
    status: 'accepted',
    teacherDecision: '在第 4 周线下课堂增加了 15 分钟色彩调配实操环节',
    createdAt: '2025-02-22T10:00:00Z',
  },
  {
    id: 'sug9', moduleId: 'm2', week: 6, category: 'task', priority: 'high',
    title: '根据线上讨论区语义分析，建议线下翻转课堂重新分组',
    description: '线上讨论区文本语义聚类分析发现：A 同学和 B 同学在"透视基础"话题下发言语义相似度达 0.78，建议异质分组。',
    dataEvidence: ['张明 & 李华语义相似度 0.78（同水平层级）', '陈静为"透视基础"模块最高分学生（95 分）', '当前同质分组导致小组产出效率下降 35%'],
    confidenceScore: 0.88,
    attributionAnalysis: {
      primaryFactor: '当前小组为随机分配，未考虑学生能力差异与互补性',
      contributingFactors: ['翻转课堂前缺乏学情摸底', '线上-线下分组数据未打通', '缺少智能分组算法'],
      modalityContributions: { video_emotion: 0.1, text_semantic: 0.45, interaction_behavior: 0.25, traditional_data: 0.2 },
    },
    status: 'accepted',
    teacherDecision: '第 7 周采用异质分组后，小组任务完成时间缩短 40%',
    createdAt: '2025-03-22T10:00:00Z',
  },
  {
    id: 'sug10', moduleId: 'm3', week: 10, category: 'resource', priority: 'medium',
    title: '线上预习数据异常：第 10 周课前测验通过率仅 35%，线下需调整授课节奏',
    description: '线上智慧教学平台数据显示：第 10 周"风格探索"模块课前测验通过率仅 35%（历史均值 72%）。视频完播率从第 9 周的 88% 骤降至 52%。',
    dataEvidence: ['课前测验通过率 35%（历史均值 72%）', '视频完播率骤降：88% → 52%', '"后印象派"段落重播率 67%'],
    confidenceScore: 0.85,
    attributionAnalysis: {
      primaryFactor: '线上预习质量严重不足，线下课堂需从"讲授型"转为"实践型"',
      contributingFactors: ['后印象派概念抽象度高', '线上视频缺乏案例对比', '学生缺乏艺术史背景知识'],
      modalityContributions: { video_emotion: 0.3, text_semantic: 0.2, interaction_behavior: 0.35, traditional_data: 0.15 },
    },
    status: 'pending',
    createdAt: '2025-04-22T10:00:00Z',
  },
];

// ===================== 诊断告警 =====================

export const mockAlerts: DiagnosticAlert[] = [
  { id: 'a1', week: 3, type: 'low_engagement', severity: 'high', title: '参与度显著下降', description: '第3周整体参与度从第2周的78分降至62分，视频专注度降至42%，讨论区负面情绪增多。', moduleId: 'm1' },
  { id: 'a2', week: 6, type: 'knowledge_gap', severity: 'high', title: '造型基础掌握不足', description: '第6周学习成果数据显示30%学生在造型基础考核中得分低于70分。', moduleId: 'm2' },
  { id: 'a3', week: 6, type: 'performance_drop', severity: 'medium', title: '课堂互动率降低', description: '第6-7周课堂互动参与率连续两周下降，从平均85次/周降至55次/周。', moduleId: 'm2' },
  { id: 'a4', week: 10, type: 'anomaly', severity: 'medium', title: '讨论区发帖量异常激增', description: '第10周讨论区发帖量较前两周增长40%，文本情感分析显示积极情绪占比达78%。', moduleId: 'm3' },
  { id: 'a5', week: 14, type: 'low_engagement', severity: 'medium', title: '创作阶段迷茫感', description: '第14周综合创作初期，学生平均参与度仅58分，文本分析显示"迷茫"关键词出现频率增加3倍。', moduleId: 'm4' },
  { id: 'a6', week: 15, type: 'knowledge_gap', severity: 'low', title: '作品评价标准理解偏差', description: '第15周教师评价中发现部分学生对作品评价标准理解不一致。', moduleId: 'm4' },
  { id: 'a7', week: 3, type: 'anomaly', severity: 'high', title: '线上→线下知识断层预警', description: '线上视频第3章"色彩三要素"困惑表情占比42%（均值12%），课前测验通过率仅35%。', moduleId: 'm1' },
  { id: 'a8', week: 6, type: 'performance_drop', severity: 'medium', title: '翻转课堂分组效率预警', description: '线上讨论区语义聚类显示当前小组存在严重同质化，导致小组任务产出效率下降35%。', moduleId: 'm2' },
  { id: 'a9', week: 10, type: 'low_engagement', severity: 'high', title: '线上预习严重不足，线下需转型', description: '第10周线上视频完播率从88%骤降至52%，"后印象派"段落重播率67%。', moduleId: 'm3' },
];

// ===================== 数据质量指标 =====================

export function generateMockDataQuality(records: LearningRecord[]): DataQualityMetrics {
  const typeCounts: Record<DataType, number> = { behavior: 0, process: 0, outcome: 0, evaluation: 0, feedback: 0 };
  records.forEach(r => { typeCounts[r.type]++; });
  const totalExpected = mockStudents.length * 16 * 3;
  const totalActual = records.length;
  const completeness = Math.min(100, Math.floor((totalActual / totalExpected) * 100));
  return { completeness, timeliness: 85, accuracy: 92, recordCounts: typeCounts };
}

// ===================== 学生画像数据 =====================

export function generateMockStudentProfiles(): StudentMultimodalProfile[] {
  const profiles: StudentMultimodalProfile[] = [];
  const bottlenecks = [
    { name: '视频学习专注度下降', score: 72, recs: ['建议增加视频互动环节', '引入分段学习策略'] },
    { name: '讨论区参与度不足', score: 58, recs: ['设置强制性讨论配额', '引入同伴互评机制'] },
    { name: '知识迁移能力薄弱', score: 65, recs: ['增加案例变式练习', '设置跨模块综合任务'] },
    { name: '创作自信心不足', score: 50, recs: ['设置阶段性作品展示', '提供正向反馈激励机制'] },
    { name: '时间管理能力欠缺', score: 68, recs: ['制定周学习计划模板', '设置里程碑提醒'] },
    { name: '无明显瓶颈，学习状态良好', score: 15, recs: ['保持当前学习节奏', '可尝试拓展高阶内容'] },
  ];
  const rand = seededRandom(999);

  for (const student of mockStudents) {
    const bn = bottlenecks[Math.floor(rand() * bottlenecks.length)];
    const trajectory = Array.from({ length: 4 }, (_, i) => {
      const w = 13 + i;
      const base = 60 + Math.sin(w * 0.5) * 15 + w * 1.5;
      return {
        week: w,
        engagementScore: Math.min(100, Math.max(30, Math.round(base + rand() * 10))),
        abilityRadar: {
          knowledge: Math.min(100, Math.max(40, Math.round(60 + rand() * 35))),
          skill: Math.min(100, Math.max(40, Math.round(55 + rand() * 40))),
          creativity: Math.min(100, Math.max(35, Math.round(50 + rand() * 45))),
          collaboration: Math.min(100, Math.max(40, Math.round(55 + rand() * 40))),
          attitude: Math.min(100, Math.max(50, Math.round(60 + rand() * 35))),
        },
      };
    });

    profiles.push({
      studentId: student.id,
      studentName: student.name,
      week: 16,
      abilityRadar: trajectory[3].abilityRadar,
      videoEmotionAvg: Math.min(100, Math.max(20, Math.round(55 + rand() * 40))),
      textSentimentAvg: Math.min(100, Math.max(10, Math.round(40 + rand() * 55))),
      interactionAvg: Math.min(100, Math.max(15, Math.round(45 + rand() * 50))),
      engagementScore: Math.min(100, Math.max(25, Math.round(50 + rand() * 45))),
      bottleneck: bn.name,
      bottleneckScore: bn.score,
      recommendations: bn.recs,
      trajectory,
    });
  }
  return profiles;
}

// ===================== 干预有效性数据 =====================

export const mockInterventions: InterventionEffectiveness[] = [
  {
    interventionId: 'int1',
    interventionType: '教学节奏调整',
    description: '第3周增加色彩理论实践课时，采用案例教学法',
    week: 3,
    preIntervention: { classroomVitality: 58, creativity: 52, learningPerception: 60, resourceExtension: 55, courseEvolution: 48, overallEngagement: 62 },
    postIntervention: { classroomVitality: 78, creativity: 65, learningPerception: 75, resourceExtension: 68, courseEvolution: 62, overallEngagement: 80 },
    improvement: { classroomVitality: 20, creativity: 13, learningPerception: 15, resourceExtension: 13, courseEvolution: 14, overallEngagement: 18 },
    effectivenessScore: 82,
  },
  {
    interventionId: 'int2',
    interventionType: '任务分层设计',
    description: '第6周设计分层造型练习任务，基础组侧重几何体写生，提高组侧重人物速写',
    week: 6,
    preIntervention: { classroomVitality: 62, creativity: 55, learningPerception: 58, resourceExtension: 60, courseEvolution: 50, overallEngagement: 58 },
    postIntervention: { classroomVitality: 80, creativity: 72, learningPerception: 76, resourceExtension: 70, courseEvolution: 65, overallEngagement: 78 },
    improvement: { classroomVitality: 18, creativity: 17, learningPerception: 18, resourceExtension: 10, courseEvolution: 15, overallEngagement: 20 },
    effectivenessScore: 85,
  },
  {
    interventionId: 'int3',
    interventionType: '资源更新',
    description: '第10周建立20个艺术家风格案例资源库，制作5个风格分析短视频',
    week: 10,
    preIntervention: { classroomVitality: 68, creativity: 60, learningPerception: 65, resourceExtension: 52, courseEvolution: 55, overallEngagement: 65 },
    postIntervention: { classroomVitality: 82, creativity: 78, learningPerception: 78, resourceExtension: 75, courseEvolution: 70, overallEngagement: 80 },
    improvement: { classroomVitality: 14, creativity: 18, learningPerception: 13, resourceExtension: 23, courseEvolution: 15, overallEngagement: 15 },
    effectivenessScore: 78,
  },
  {
    interventionId: 'int4',
    interventionType: '评价方式改革',
    description: '第14周设置草图审查和初稿审查两个中期检查点，增加过程性评价',
    week: 14,
    preIntervention: { classroomVitality: 55, creativity: 50, learningPerception: 52, resourceExtension: 58, courseEvolution: 45, overallEngagement: 58 },
    postIntervention: { classroomVitality: 75, creativity: 70, learningPerception: 72, resourceExtension: 72, courseEvolution: 65, overallEngagement: 75 },
    improvement: { classroomVitality: 20, creativity: 20, learningPerception: 20, resourceExtension: 14, courseEvolution: 20, overallEngagement: 17 },
    effectivenessScore: 80,
  },
];

// ===================== 45 分钟课堂多模态时序数据 =====================

/**
 * 为指定学生生成 45 分钟课堂的多模态时序数据
 * 每个学生-周组合生成 10 个对齐的时间点，模拟课堂节奏
 */
export function generateMockClassroomTimeSeries(
  studentId: string,
  week: number
): StudentMultimodalTimeSeries {
  const rand = seededRandom(hashString(studentId + week));
  const numId = parseInt(studentId.replace('s', '') || '1');
  const isStruggling = numId <= 5 && week > 10;

  const baseVideo = isStruggling ? 0.35 + numId * 0.01 : 0.6 + (numId % 30) / 100;
  const baseText = 0.45 + (numId % 40) / 100;
  const baseInteraction = isStruggling ? 2 + Math.floor(numId * 0.1) : 5 + (numId % 8);

  const points: StudentMultimodalTimeSeries['points'] = [];
  const fusionScores: number[] = [];

  // 10 个时间点均匀分布在 45 分钟内
  const phaseBoundaries = [0, 4.5, 9, 13.5, 18, 22.5, 27, 31.5, 36, 40.5, 45];

  for (let i = 0; i < 10; i++) {
    const tMid = (phaseBoundaries[i] + phaseBoundaries[i + 1]) / 2;

    // 模拟课堂节奏
    let phaseFactor: number;
    if (tMid < 5) {
      phaseFactor = tMid / 5;
    } else if (tMid < 20) {
      phaseFactor = 1 - Math.abs(tMid - 12) / 15;
    } else if (tMid < 35) {
      phaseFactor = 0.85 + Math.sin((tMid - 20) * 0.15) * 0.15;
    } else {
      phaseFactor = 0.9 - (tMid - 35) * 0.02;
    }

    const noise = (rand() - 0.5) * 0.15;

    const videoEmotion = Math.min(1, Math.max(0,
      baseVideo * (0.5 + phaseFactor * 0.5) + noise
    ));
    const textSentiment = Math.min(1, Math.max(0,
      baseText * (0.4 + phaseFactor * 0.4) + videoEmotion * 0.15 + noise * 0.5
    ));
    const interactionCount = Math.max(0, Math.min(20,
      Math.round(baseInteraction * (0.3 + phaseFactor * 0.7) + (rand() - 0.5) * 3)
    ));

    const minute = Math.round(tMid);
    const second = Math.floor(rand() * 60);
    const timestamp = `2025-W${week}-T${String(minute).padStart(2, '0')}m${String(second).padStart(2, '0')}s`;

    points.push({
      timestamp,
      videoEmotion: Math.round(videoEmotion * 1000) / 1000,
      textSentiment: Math.round(textSentiment * 1000) / 1000,
      interactionCount,
    });

    // 加权融合
    const interactionNorm = interactionCount / 20;
    const fused = (
      videoEmotion * 0.5 +
      textSentiment * 0.3 +
      interactionNorm * 0.2
    ) * 100;
    fusionScores.push(Math.round(Math.min(100, Math.max(0, fused))));
  }

  const avgVideo = points.reduce((s, p) => s + p.videoEmotion, 0) / points.length;
  const avgText = points.reduce((s, p) => s + p.textSentiment, 0) / points.length;
  const totalInteractions = points.reduce((s, p) => s + p.interactionCount, 0);

  const half = Math.floor(points.length / 2);
  const firstHalf = fusionScores.slice(0, half).reduce((a, b) => a + b, 0) / half;
  const secondHalf = fusionScores.slice(half).reduce((a, b) => a + b, 0) / (fusionScores.length - half);
  const engagementTrend: 'rising' | 'stable' | 'declining' =
    secondHalf > firstHalf + 5 ? 'rising'
      : secondHalf < firstHalf - 5 ? 'declining'
      : 'stable';

  return {
    studentId,
    week,
    moduleId: week <= 4 ? 'm1' : week <= 8 ? 'm2' : week <= 12 ? 'm3' : 'm4',
    points,
    fusionEngagementScore: fusionScores,
    summary: {
      avgVideoEmotion: Math.round(avgVideo * 1000) / 1000,
      avgTextSentiment: Math.round(avgText * 1000) / 1000,
      totalInteractions,
      engagementTrend,
    },
  };
}

// 简单字符串哈希函数（用于确定性随机种子）
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// ===================== 课程画像数据（Course Profile）=====================

/**
 * 生成 16 周课程画像快照
 * 包含教师教学状态、课程平台资源、互动方式与教学方法三个维度
 */
export function generateMockCourseProfiles(): CourseProfileSnapshot[] {
  const snapshots: CourseProfileSnapshot[] = [];
  const rand = seededRandom(2025);

  for (let week = 1; week <= 16; week++) {
    // 教学状态 — 随课程深入逐步改善
    const teachingPace = Math.min(100, Math.max(50, 55 + week * 2.2 + rand() * 10));
    const emotionalEngagement = Math.min(100, Math.max(50, 50 + week * 2.5 + rand() * 12));
    const movementFrequency = Math.min(30, Math.max(5, 12 + Math.floor(rand() * 8) + (week > 8 ? 3 : 0)));
    const eyeContactRate = Math.min(100, Math.max(40, 45 + week * 2 + rand() * 10));
    const questionRate = Math.min(25, Math.max(5, 8 + Math.floor(rand() * 6) + (week > 6 ? 2 : 0)));
    const lectureRatio = Math.max(30, 70 - week * 1.5 + rand() * 5);
    const pacingVariation = Math.min(100, Math.max(30, 40 + week * 2.5 + rand() * 15));

    const teachingState: TeachingState = {
      teachingPace: Math.round(teachingPace),
      emotionalEngagement: Math.round(emotionalEngagement),
      movementFrequency: Math.round(movementFrequency),
      eyeContactRate: Math.round(eyeContactRate),
      questionRate: Math.round(questionRate),
      lectureRatio: Math.round(lectureRatio),
      pacingVariation: Math.round(pacingVariation),
    };

    // 资源利用率 — 前期偏低，中期回升，后期稳定
    const slideCompletionRate = Math.min(100, Math.max(40, 50 + week * 2.5 + rand() * 8));
    const difficultyReplayRate = Math.min(100, Math.max(15, 30 + (week > 8 ? 15 : 0) + rand() * 20));
    const resourceDownloadCount = Math.floor(10 + week * 3 + rand() * 15);
    const videoWatchDepth = Math.min(100, Math.max(40, 50 + week * 2 + rand() * 10));
    const materialAccessFreq = Math.min(20, Math.max(3, 5 + Math.floor(rand() * 4) + (week > 6 ? 2 : 0)));
    const resourceRequestCount = Math.floor(3 + rand() * 10 + (week > 10 ? 5 : 0));
    const contentCoverage = Math.min(100, Math.max(60, 65 + week * 1.5 + rand() * 10));
    const resourceSatisfaction = Math.min(100, Math.max(45, 55 + week * 2 + rand() * 12));

    const resourceUtilization: ResourceUtilization = {
      slideCompletionRate: Math.round(slideCompletionRate),
      difficultyReplayRate: Math.round(difficultyReplayRate),
      resourceDownloadCount,
      videoWatchDepth: Math.round(videoWatchDepth),
      materialAccessFreq: Math.round(materialAccessFreq * 10) / 10,
      resourceRequestCount,
      contentCoverage: Math.round(contentCoverage),
      resourceSatisfaction: Math.round(resourceSatisfaction),
    };

    // 互动方式 — 随课程推进逐步增强
    const qAndFFrequency = Math.min(20, Math.max(3, 5 + Math.floor(rand() * 5) + (week > 6 ? 3 : 0)));
    const groupDiscussionHeat = Math.min(100, Math.max(25, 35 + week * 3 + rand() * 15));
    const danmakuActivity = Math.min(15, Math.max(1, 2 + Math.floor(rand() * 5) + (week > 4 ? 2 : 0)));
    const discussionBoardActivity = Math.min(50, Math.max(5, 10 + week * 2 + Math.floor(rand() * 10)));
    const peerReviewCount = Math.min(20, Math.max(0, Math.floor(rand() * 5) + (week >= 10 ? 5 : 0)));
    const livePollParticipation = Math.min(100, Math.max(40, 50 + week * 2.5 + rand() * 15));
    const thinkPairShareFreq = Math.min(10, Math.max(0, Math.floor(rand() * 3) + (week > 6 ? 2 : 0)));
    const flipClassParticipation = Math.min(100, Math.max(30, 40 + week * 3.5 + rand() * 15));

    const interactionMethod: InteractionMethod = {
      qAndFFrequency: Math.round(qAndFFrequency),
      groupDiscussionHeat: Math.round(groupDiscussionHeat),
      danmakuActivity: Math.round(danmakuActivity * 10) / 10,
      discussionBoardActivity: Math.round(discussionBoardActivity),
      peerReviewCount,
      livePollParticipation: Math.round(livePollParticipation),
      thinkPairShareFreq: Math.round(thinkPairShareFreq),
      flipClassParticipation: Math.round(flipClassParticipation),
    };

    // 综合健康度
    const teachingScore = (teachingPace + emotionalEngagement + eyeContactRate + pacingVariation) / 4;
    const resourceScore = (slideCompletionRate + videoWatchDepth + contentCoverage + resourceSatisfaction) / 4;
    const interactionScore = (groupDiscussionHeat + discussionBoardActivity / 2 + livePollParticipation + flipClassParticipation) / 4;
    const overallHealth = Math.min(100, Math.max(30, Math.round((teachingScore + resourceScore + interactionScore) / 3)));

    // 健康等级
    const healthGrade: CourseProfileSnapshot['healthGrade'] =
      overallHealth >= 85 ? 'A' : overallHealth >= 70 ? 'B' : overallHealth >= 55 ? 'C' : 'D';

    // 风险标签
    const riskFlags: string[] = [];
    if (teachingPace < 60) riskFlags.push('讲授语速偏慢，课堂节奏需加快');
    if (emotionalEngagement < 60) riskFlags.push('教师情绪饱满度偏低');
    if (movementFrequency < 8) riskFlags.push('课堂走动频次不足');
    if (slideCompletionRate < 60) riskFlags.push('课件完播率偏低');
    if (difficultyReplayRate > 70) riskFlags.push('难点回放率过高，内容理解障碍');
    if (groupDiscussionHeat < 40) riskFlags.push('小组讨论热度不足');
    if (flipClassParticipation < 50) riskFlags.push('翻转课堂参与率低');
    if (questionRate < 6) riskFlags.push('课堂提问频次过低');

    // 改善信号
    const improvementSignals: string[] = [];
    if (teachingPace > 75) improvementSignals.push('讲授语速适中，节奏感良好');
    if (emotionalEngagement > 75) improvementSignals.push('教师情绪饱满，感染力强');
    if (slideCompletionRate > 80) improvementSignals.push('课件完播率优秀');
    if (groupDiscussionHeat > 70) improvementSignals.push('小组讨论活跃，协作氛围好');
    if (flipClassParticipation > 70) improvementSignals.push('翻转课堂参与度高');
    if (videoWatchDepth > 70) improvementSignals.push('视频学习深度良好');
    if (eyeContactRate > 70) improvementSignals.push('师生眼神交流充分');

    snapshots.push({
      week,
      dimension: { teachingState, resourceUtilization, interactionMethod },
      overallHealth,
      healthGrade,
      riskFlags,
      improvementSignals,
    });
  }

  return snapshots;
}

/**
 * 生成教师教学状态 16 周趋势数据（用于折线图）
 */
export function generateTeachingTrendData() {
  const data: Array<{ week: number; label: string; value: number }> = [];
  const rand = seededRandom(2026);
  const dimensions: Array<{ key: keyof TeachingState; label: string }> = [
    { key: 'teachingPace', label: '讲授语速' },
    { key: 'emotionalEngagement', label: '情绪饱满度' },
    { key: 'movementFrequency', label: '走动频次' },
    { key: 'eyeContactRate', label: '眼神交流' },
    { key: 'questionRate', label: '提问频次' },
    { key: 'pacingVariation', label: '节奏变化' },
  ];

  for (const dim of dimensions) {
    for (let week = 1; week <= 16; week++) {
      const base = 40 + week * 2.5;
      data.push({
        week,
        label: dim.label,
        value: Math.min(100, Math.max(20, Math.round(base + rand() * 20))),
      });
    }
  }
  return data;
}

/**
 * 生成课程资源利用率 16 周趋势数据
 */
export function generateResourceTrendData() {
  const data: Array<{ week: number; label: string; value: number }> = [];
  const rand = seededRandom(2027);
  const dimensions: Array<{ key: keyof ResourceUtilization; label: string }> = [
    { key: 'slideCompletionRate', label: '课件完播率' },
    { key: 'difficultyReplayRate', label: '难点回放率' },
    { key: 'videoWatchDepth', label: '视频观看深度' },
    { key: 'contentCoverage', label: '内容覆盖率' },
    { key: 'resourceSatisfaction', label: '资源满意度' },
  ];

  for (const dim of dimensions) {
    for (let week = 1; week <= 16; week++) {
      const base = 45 + week * 2.2;
      data.push({
        week,
        label: dim.label,
        value: Math.min(100, Math.max(20, Math.round(base + rand() * 18))),
      });
    }
  }
  return data;
}

/**
 * 生成互动方式 16 周趋势数据
 */
export function generateInteractionTrendData() {
  const data: Array<{ week: number; label: string; value: number }> = [];
  const rand = seededRandom(2028);
  const dimensions: Array<{ key: keyof InteractionMethod; label: string }> = [
    { key: 'qAndFFrequency', label: '师生问答' },
    { key: 'groupDiscussionHeat', label: '小组讨论' },
    { key: 'danmakuActivity', label: '弹幕活跃度' },
    { key: 'discussionBoardActivity', label: '讨论区' },
    { key: 'livePollParticipation', label: '实时投票' },
    { key: 'flipClassParticipation', label: '翻转课堂' },
  ];

  for (const dim of dimensions) {
    for (let week = 1; week <= 16; week++) {
      const base = 30 + week * 3;
      data.push({
        week,
        label: dim.label,
        value: Math.min(100, Math.max(10, Math.round(base + rand() * 22))),
      });
    }
  }
  return data;
}

// ===================== 统一导出 =====================

export function generateAllMockData() {
  const records = generateMockRecords();
  return {
    courseInfo: mockCourseInfo,
    students: mockStudents,
    records,
    vitalityScores: generateMockVitalityScores(),
    alerts: mockAlerts,
    dataQuality: generateMockDataQuality(records),
    multimodalFeatures: generateMockMultimodalFeatures(),
    suggestions: mockSuggestions,
    studentProfiles: generateMockStudentProfiles(),
    interventions: mockInterventions,
    courseProfiles: generateMockCourseProfiles(),
    teachingTrendData: generateTeachingTrendData(),
    resourceTrendData: generateResourceTrendData(),
    interactionTrendData: generateInteractionTrendData(),
    classroomTimeSeries: (studentId: string, week: number) => generateMockClassroomTimeSeries(studentId, week),
  };
}
