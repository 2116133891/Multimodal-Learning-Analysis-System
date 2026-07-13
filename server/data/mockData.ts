// ===== 模拟数据生成器（增强版：含多模态数据） =====
import type {
  CourseInfo, CourseModule, Objective, Student,
  LearningRecord, VitalityScore, OptimizationSuggestion,
  DiagnosticAlert, DataQualityMetrics, DataType,
  VideoMicroExpression, TextSemanticData, InteractionBehavior,
  MultimodalFeatureVector, ModalityFeature, EmotionPolarity,
  StudentMultimodalProfile, InterventionEffectiveness,
  RejectReason, TeacherDecisionLog,
} from '../../src/types';

// ===================== 课程信息 =====================

export const courseInfo: CourseInfo = {
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

export const students: Student[] = studentNames.map((name, i) => ({
  id: `s${String(i + 1).padStart(3, '0')}`,
  name,
}));

// ===================== 传统学习记录 =====================

function generateBehaviorData(): LearningRecord[] {
  const records: LearningRecord[] = [];
  let id = 1;
  for (const student of students) {
    for (let week = 1; week <= 16; week++) {
      const loginCount = Math.floor(Math.random() * 10) + 1;
      const watchTime = Math.floor(Math.random() * 120) + 10;
      const posts = Math.floor(Math.random() * 5);
      const engagement = Math.min(100, Math.floor((loginCount * 5 + watchTime * 0.5 + posts * 8)));
      const adjustedEngagement = student.id <= 's005' && week > 10
        ? Math.max(20, engagement - Math.floor(Math.random() * 30))
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
  }
  return records;
}

function generateProcessData(): LearningRecord[] {
  const records: LearningRecord[] = [];
  let id = 1;
  for (const student of students) {
    for (let week = 1; week <= 16; week++) {
      const homeworkScore = Math.floor(Math.random() * 30) + 60;
      const quizScore = Math.floor(Math.random() * 35) + 55;
      const interaction = Math.floor(Math.random() * 10) + 1;
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
  }
  return records;
}

function generateOutcomeData(): LearningRecord[] {
  const records: LearningRecord[] = [];
  let id = 1;
  const examWeeks = [4, 8, 12, 16];
  for (const student of students) {
    for (const week of examWeeks) {
      const examScore = Math.floor(Math.random() * 35) + 55;
      const projectScore = Math.floor(Math.random() * 30) + 60;
      records.push({
        id: `o${String(id++).padStart(4, '0')}`,
        type: 'outcome',
        studentId: student.id,
        moduleId: week <= 4 ? 'm1' : week <= 8 ? 'm2' : week <= 12 ? 'm3' : 'm4',
        week,
        timestamp: `2025-0${examWeeks.indexOf(week) + 1}-25T16:00:00Z`,
        value: Math.floor((examScore + projectScore) / 2),
        rawValue: JSON.stringify({ examScore, projectScore }),
        metadata: { source: '考试系统' },
      });
    }
  }
  return records;
}

function generateEvaluationData(): LearningRecord[] {
  const records: LearningRecord[] = [];
  let id = 1;
  const comments = [
    '课堂表现积极，积极参与讨论', '作业完成质量较高，有创意',
    '需要加强基础练习，多看优秀作品', '进步明显，继续保持',
    '注意力不够集中，需要提高参与度', '团队协作能力强，乐于帮助同学',
    '作品完成度高，细节处理到位', '概念理解有偏差，需要课后辅导',
  ];
  for (const student of students) {
    for (let week = 1; week <= 16; week += 2) {
      records.push({
        id: `e${String(id++).padStart(4, '0')}`,
        type: 'evaluation',
        studentId: student.id,
        moduleId: week <= 4 ? 'm1' : week <= 8 ? 'm2' : week <= 12 ? 'm3' : 'm4',
        week,
        timestamp: `2025-0${week <= 4 ? week : week <= 8 ? week - 3 : week - 7}-28T09:00:00Z`,
        value: Math.floor(Math.random() * 25) + 70,
        rawValue: comments[Math.floor(Math.random() * comments.length)],
        metadata: { source: '教师评价系统' },
      });
    }
  }
  return records;
}

function generateFeedbackData(): LearningRecord[] {
  const records: LearningRecord[] = [];
  let id = 1;
  for (let week = 1; week <= 16; week += 4) {
    for (let i = 0; i < 5; i++) {
      const satisfaction = Math.floor(Math.random() * 30) + 65;
      records.push({
        id: `f${String(id++).padStart(4, '0')}`,
        type: 'feedback',
        studentId: students[Math.floor(Math.random() * students.length)].id,
        moduleId: week <= 4 ? 'm1' : week <= 8 ? 'm2' : week <= 12 ? 'm3' : 'm4',
        week,
        timestamp: `2025-0${week <= 4 ? week : week <= 8 ? week - 3 : week - 7}-30T18:00:00Z`,
        value: satisfaction,
        rawValue: JSON.stringify({ satisfaction, suggestions: '课程内容充实，希望增加实践环节' }),
        metadata: { source: '课程反馈问卷' },
      });
    }
  }
  return records;
}

// ===================== 多模态数据：视频微表情 =====================

const emotionTypes: Array<'happy' | 'confused' | 'focused' | 'bored' | 'surprised' | 'frustrated'> =
  ['happy', 'confused', 'focused', 'bored', 'surprised', 'frustrated'];

function generateVideoMicroExpressions(): VideoMicroExpression[] {
  const expressions: VideoMicroExpression[] = [];
  for (const student of students) {
    for (let week = 1; week <= 16; week++) {
      // 生成一个会话的情绪时间序列（约20帧）
      const frames: EmotionPolarity[] = [];
      let emotionPool: string[] = [];
      // 前5号学生后期参与度下降 → 更多 bored/frustrated
      if (student.id <= 's005' && week > 10) {
        emotionPool = ['bored', 'bored', 'bored', 'frustrated', 'focused', 'confused'];
      } else {
        emotionPool = ['focused', 'focused', 'focused', 'happy', 'surprised', 'confused'];
      }
      for (let f = 0; f < 20; f++) {
        const em = emotionPool[f % emotionPool.length];
        frames.push({
          emotion: em as 'happy' | 'confused' | 'focused' | 'bored' | 'surprised' | 'frustrated',
          score: 0.4 + Math.random() * 0.55,
          timestamp: `2025-W${week}-T${String(f * 3).padStart(2, '0')}s`,
        });
      }
      // 计算聚合指标
      const dominantEmotion = frames.reduce((best, f) => f.score > best.score ? f : best, frames[0]).emotion;
      expressions.push({
        studentId: student.id,
        moduleId: week <= 4 ? 'm1' : week <= 8 ? 'm2' : week <= 12 ? 'm3' : 'm4',
        week,
        sessionId: `vid_${student.id}_w${week}`,
        frames,
        aggregated: {
          dominantEmotion,
          averageConfidence: Math.round(frames.reduce((s, f) => s + f.score, 0) / frames.length * 100) / 100,
          engagementIndicators: Math.round((frames.filter(f => f.emotion === 'focused').length / frames.length) * 100),
          distractionRate: Math.round((frames.filter(f => f.emotion === 'bored').length / frames.length) * 100),
        },
      });
    }
  }
  return expressions;
}

// ===================== 多模态数据：文本语义 =====================

const textContents = [
  { content: '老师讲的色彩搭配方法太实用了！', sentiment: 'positive' as const, score: 0.85, keywords: ['色彩搭配', '实用'], topics: ['教学方法'] },
  { content: '这个知识点有点难理解，希望能多举几个例子', sentiment: 'mixed' as const, score: -0.1, keywords: ['难理解', '举例'], topics: ['学习困难'] },
  { content: '我觉得小组讨论很有收获，大家互相启发', sentiment: 'positive' as const, score: 0.72, keywords: ['小组讨论', '启发'], topics: ['协作学习'] },
  { content: '作业量太大了，根本做不完', sentiment: 'negative' as const, score: -0.65, keywords: ['作业量', '做不完'], topics: ['学习负担'] },
  { content: '原画的学习需要大量的练习，我会继续努力的', sentiment: 'positive' as const, score: 0.55, keywords: ['练习', '努力'], topics: ['学习态度'] },
  { content: '视频讲解得很清楚，但是实践环节太少', sentiment: 'mixed' as const, score: 0.15, keywords: ['视频', '实践'], topics: ['教学设计'] },
  { content: '我对风格探索这部分特别感兴趣', sentiment: 'positive' as const, score: 0.8, keywords: ['风格探索', '兴趣'], topics: ['学习动机'] },
  { content: '课程评价标准不太明确，希望能提前说明', sentiment: 'negative' as const, score: -0.3, keywords: ['评价标准', '明确'], topics: ['评价改革'] },
];

function generateTextSemantics(): TextSemanticData[] {
  const data: TextSemanticData[] = [];
  let id = 1;
  for (const student of students) {
    // 每个学生每周随机生成 1-4 条留言
    const postCount = Math.floor(Math.random() * 4) + 1;
    for (let p = 0; p < postCount; p++) {
      const tmpl = textContents[Math.floor(Math.random() * textContents.length)];
      const week = Math.ceil(Math.random() * 16);
      data.push({
        studentId: student.id,
        moduleId: week <= 4 ? 'm1' : week <= 8 ? 'm2' : week <= 12 ? 'm3' : 'm4',
        week,
        postId: `post_${String(id++).padStart(4, '0')}`,
        content: tmpl.content,
        sentiment: tmpl.sentiment,
        sentimentScore: tmpl.score + (Math.random() - 0.5) * 0.2,
        keywords: [...tmpl.keywords],
        topicTags: [...tmpl.topics],
        timestamp: `2025-W${week}-T${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:00:00Z`,
      });
    }
  }
  return data;
}

// ===================== 多模态数据：交互行为 =====================

const actionTypes: InteractionBehavior['actionType'][] =
  ['click', 'hover', 'scroll', 'pause', 'seek', 'download', 'submit', 'discuss'];
const targets = ['视频播放器', '测验题目', '讨论区', '课件下载', '作业提交', '资源库', '进度面板'];

function generateInteractionBehaviors(): InteractionBehavior[] {
  const data: InteractionBehavior[] = [];
  let id = 1;
  for (const student of students) {
    for (let week = 1; week <= 16; week++) {
      // 每个学生每周 5-15 条交互记录
      const count = Math.floor(Math.random() * 10) + 5;
      for (let i = 0; i < count; i++) {
        const action = actionTypes[Math.floor(Math.random() * actionTypes.length)];
        const target = targets[Math.floor(Math.random() * targets.length)];
        let duration: number;
        switch (action) {
          case 'click': duration = Math.floor(Math.random() * 5) + 1; break;
          case 'hover': duration = Math.floor(Math.random() * 3) + 1; break;
          case 'scroll': duration = Math.floor(Math.random() * 10) + 2; break;
          case 'pause': duration = Math.floor(Math.random() * 60) + 10; break;
          case 'seek': duration = Math.floor(Math.random() * 5) + 1; break;
          case 'download': duration = Math.floor(Math.random() * 30) + 5; break;
          case 'submit': duration = Math.floor(Math.random() * 600) + 60; break;
          case 'discuss': duration = Math.floor(Math.random() * 300) + 30; break;
          default: duration = 5;
        }
        // 前5号学生后期交互减少
        if (student.id <= 's005' && week > 10) {
          duration = Math.max(1, Math.floor(duration * (0.3 + Math.random() * 0.4)));
        }
        data.push({
          studentId: student.id,
          moduleId: week <= 4 ? 'm1' : week <= 8 ? 'm2' : week <= 12 ? 'm3' : 'm4',
          week,
          actionType: action,
          targetElement: target,
          duration,
          timestamp: `2025-W${week}-T${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00Z`,
          metadata: { elementId: `el_${Math.floor(Math.random() * 100)}`, viewport: 'desktop' },
        });
      }
    }
  }
  return data;
}

// ===================== 多模态特征融合结果 =====================

function generateMultimodalFeatures(): MultimodalFeatureVector[] {
  const features: MultimodalFeatureVector[] = [];
  // 为每名学生每周生成融合特征
  for (const student of students) {
    for (let week = 1; week <= 16; week++) {
      // 模拟三种模态的特征
      const videoScore = student.id <= 's005' && week > 10
        ? 40 + Math.random() * 20
        : 60 + Math.random() * 35;
      const textScore = 50 + Math.random() * 45;
      const interactionScore = student.id <= 's005' && week > 10
        ? 30 + Math.random() * 25
        : 55 + Math.random() * 40;
      const traditionalScore = 55 + Math.random() * 40;

      const modalityFeatures: ModalityFeature[] = [
        { modality: 'video_emotion', score: Math.min(100, videoScore), weight: 0.3, sampleCount: 20, trend: 'stable' },
        { modality: 'text_semantic', score: Math.min(100, textScore), weight: 0.25, sampleCount: Math.floor(Math.random() * 4) + 1, trend: 'rising' },
        { modality: 'interaction_behavior', score: Math.min(100, interactionScore), weight: 0.25, sampleCount: Math.floor(Math.random() * 10) + 5, trend: 'stable' },
        { modality: 'traditional_data', score: Math.min(100, traditionalScore), weight: 0.2, sampleCount: 3, trend: 'stable' },
      ];

      // 早融合：加权求和
      const earlyFusionScore = Math.round(
        modalityFeatures.reduce((s, m) => s + m.score * m.weight, 0)
      );
      // 晚融合：各模态独立推理后加权投票（略有差异）
      const lateFusionScore = Math.min(100, Math.max(20, earlyFusionScore + Math.floor((Math.random() - 0.5) * 15)));
      // 模态一致性
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

// ===================== 学生画像数据 =====================

function generateStudentProfiles(): StudentMultimodalProfile[] {
  const profiles: StudentMultimodalProfile[] = [];
  const bottlenecks = [
    { name: '视频学习专注度下降', score: 72, recs: ['建议增加视频互动环节', '引入分段学习策略'] },
    { name: '讨论区参与度不足', score: 58, recs: ['设置强制性讨论配额', '引入同伴互评机制'] },
    { name: '知识迁移能力薄弱', score: 65, recs: ['增加案例变式练习', '设置跨模块综合任务'] },
    { name: '创作自信心不足', score: 50, recs: ['设置阶段性作品展示', '提供正向反馈激励机制'] },
    { name: '时间管理能力欠缺', score: 68, recs: ['制定周学习计划模板', '设置里程碑提醒'] },
    { name: '无明显瓶颈，学习状态良好', score: 15, recs: ['保持当前学习节奏', '可尝试拓展高阶内容'] },
  ];
  for (const student of students) {
    const bn = bottlenecks[Math.floor(Math.random() * bottlenecks.length)];
    // 生成近4周轨迹
    const trajectory: StudentMultimodalProfile['trajectory'] = [];
    for (let w = 13; w <= 16; w++) {
      const base = 60 + Math.sin(w * 0.5) * 15 + w * 1.5;
      trajectory.push({
        week: w,
        engagementScore: Math.min(100, Math.max(30, Math.round(base + Math.random() * 10))),
        abilityRadar: {
          knowledge: Math.min(100, Math.max(40, Math.round(60 + Math.random() * 35))),
          skill: Math.min(100, Math.max(40, Math.round(55 + Math.random() * 40))),
          creativity: Math.min(100, Math.max(35, Math.round(50 + Math.random() * 45))),
          collaboration: Math.min(100, Math.max(40, Math.round(55 + Math.random() * 40))),
          attitude: Math.min(100, Math.max(50, Math.round(60 + Math.random() * 35))),
        },
      });
    }
    profiles.push({
      studentId: student.id,
      studentName: student.name,
      week: 16,
      abilityRadar: trajectory[3].abilityRadar,
      videoEmotionAvg: Math.min(100, Math.max(20, Math.round(55 + Math.random() * 40))),
      textSentimentAvg: Math.min(100, Math.max(10, Math.round(40 + Math.random() * 55))),
      interactionAvg: Math.min(100, Math.max(15, Math.round(45 + Math.random() * 50))),
      engagementScore: Math.min(100, Math.max(25, Math.round(50 + Math.random() * 45))),
      bottleneck: bn.name,
      bottleneckScore: bn.score,
      recommendations: bn.recs,
      trajectory,
    });
  }
  return profiles;
}

// ===================== 干预有效性数据 =====================

function generateInterventionEffectiveness(): InterventionEffectiveness[] {
  const interventions: InterventionEffectiveness[] = [
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
  return interventions;
}

// ===================== AI 优化建议（增强版）=====================

const rejectReasonLabels: Record<RejectReason, string> = {
  insufficient_evidence: '证据不足',
  conflicts_with_pedagogy: '与教学法冲突',
  timing_not_appropriate: '时机不当',
  too_expensive: '成本过高',
  other: '其他原因',
};

export function generateSuggestions(): OptimizationSuggestion[] {
  return [
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
      rejectReason: 'conflicts_with_pedagogy',
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
  ];
}

// ===================== 诊断告警 =====================

export function generateAlerts(): DiagnosticAlert[] {
  return [
    { id: 'a1', week: 3, type: 'low_engagement', severity: 'high', title: '参与度显著下降', description: '第3周整体参与度从第2周的78分降至62分，视频专注度降至42%，讨论区负面情绪增多。', moduleId: 'm1' },
    { id: 'a2', week: 6, type: 'knowledge_gap', severity: 'high', title: '造型基础掌握不足', description: '第6周学习成果数据显示30%学生在造型基础考核中得分低于70分，交互行为显示复杂任务停留时长骤降。', moduleId: 'm2' },
    { id: 'a3', week: 6, type: 'performance_drop', severity: 'medium', title: '课堂互动率降低', description: '第6-7周课堂互动参与率连续两周下降，从平均85次/周降至55次/周。', moduleId: 'm2' },
    { id: 'a4', week: 10, type: 'anomaly', severity: 'medium', title: '讨论区发帖量异常激增', description: '第10周讨论区发帖量较前两周增长40%，文本情感分析显示积极情绪占比达78%。', moduleId: 'm3' },
    { id: 'a5', week: 14, type: 'low_engagement', severity: 'medium', title: '创作阶段迷茫感', description: '第14周综合创作初期，学生平均参与度仅58分，文本分析显示"迷茫"关键词出现频率增加3倍。', moduleId: 'm4' },
    { id: 'a6', week: 15, type: 'knowledge_gap', severity: 'low', title: '作品评价标准理解偏差', description: '第15周教师评价中发现部分学生对作品评价标准理解不一致。', moduleId: 'm4' },
  ];
}

// ===================== 生命力评分 =====================

export function generateVitalityScores(): VitalityScore[] {
  const scores: VitalityScore[] = [];
  for (let week = 1; week <= 16; week++) {
    const base = 60 + Math.sin(week * 0.4) * 15 + week * 1.2;
    scores.push({
      week,
      classroomVitality: Math.min(100, Math.max(30, Math.floor(base + Math.random() * 10))),
      creativity: Math.min(100, Math.max(30, Math.floor(base * 0.9 + Math.random() * 12))),
      learningPerception: Math.min(100, Math.max(30, Math.floor(base * 0.95 + Math.random() * 8))),
      resourceExtension: Math.min(100, Math.max(30, Math.floor(base * 0.85 + Math.random() * 15))),
      courseEvolution: Math.min(100, Math.max(30, Math.floor(base * 0.8 + Math.random() * 10))),
      overall: Math.min(100, Math.max(30, Math.floor(base + Math.random() * 5))),
    });
  }
  return scores;
}

// ===================== 数据质量指标 =====================

export function getDataQualityMetrics(records: LearningRecord[]): DataQualityMetrics {
  const typeCounts: Record<DataType, number> = { behavior: 0, process: 0, outcome: 0, evaluation: 0, feedback: 0 };
  records.forEach(r => { typeCounts[r.type]++; });
  const totalExpected = students.length * 16 * 3;
  const totalActual = records.length;
  const completeness = Math.min(100, Math.floor((totalActual / totalExpected) * 100));
  return { completeness, timeliness: 85, accuracy: 92, recordCounts: typeCounts };
}

// ===================== 导出全部数据 =====================

export function getAllLearningRecords(): LearningRecord[] {
  return [
    ...generateBehaviorData(),
    ...generateProcessData(),
    ...generateOutcomeData(),
    ...generateEvaluationData(),
    ...generateFeedbackData(),
  ];
}

export function getAllVideoMicroExpressions(): VideoMicroExpression[] {
  return generateVideoMicroExpressions();
}

export function getAllTextSemantics(): TextSemanticData[] {
  return generateTextSemantics();
}

export function getAllInteractionBehaviors(): InteractionBehavior[] {
  return generateInteractionBehaviors();
}

export function getAllMultimodalFeatures(): MultimodalFeatureVector[] {
  return generateMultimodalFeatures();
}

export function getAllStudentProfiles(): StudentMultimodalProfile[] {
  return generateStudentProfiles();
}

export function getAllInterventions(): InterventionEffectiveness[] {
  return generateInterventionEffectiveness();
}
