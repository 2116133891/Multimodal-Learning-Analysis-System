// ===== 模拟数据生成器 =====
import type {
  CourseInfo, CourseModule, Objective, Student,
  LearningRecord, VitalityScore, OptimizationSuggestion,
  DiagnosticAlert, DataQualityMetrics, DataType
} from '../../src/types';

// 课程信息
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

// 学生名单
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

// 生成学习行为数据
function generateBehaviorData(): LearningRecord[] {
  const records: LearningRecord[] = [];
  let id = 1;
  for (const student of students) {
    for (let week = 1; week <= 16; week++) {
      // 学习行为：登录次数、视频观看时长、讨论区发帖
      const loginCount = Math.floor(Math.random() * 10) + 1;
      const watchTime = Math.floor(Math.random() * 120) + 10;
      const posts = Math.floor(Math.random() * 5);
      const engagement = Math.min(100, Math.floor((loginCount * 5 + watchTime * 0.5 + posts * 8)));

      // 部分学生后期参与度下降（模拟问题）
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

// 生成学习过程数据
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

// 生成学习成果数据
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

// 生成教师评价数据
function generateEvaluationData(): LearningRecord[] {
  const records: LearningRecord[] = [];
  let id = 1;
  const comments = [
    '课堂表现积极，积极参与讨论',
    '作业完成质量较高，有创意',
    '需要加强基础练习，多看优秀作品',
    '进步明显，继续保持',
    '注意力不够集中，需要提高参与度',
    '团队协作能力强，乐于帮助同学',
    '作品完成度高，细节处理到位',
    '概念理解有偏差，需要课后辅导',
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

// 生成课程反馈数据
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

// 生成所有学习记录
export function getAllLearningRecords(): LearningRecord[] {
  return [
    ...generateBehaviorData(),
    ...generateProcessData(),
    ...generateOutcomeData(),
    ...generateEvaluationData(),
    ...generateFeedbackData(),
  ];
}

// 生成课程生命力评分
export function generateVitalityScores(): VitalityScore[] {
  const scores: VitalityScore[] = [];
  for (let week = 1; week <= 16; week++) {
    // 模拟曲线：前期上升，中期波动，后期提升
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

// 生成AI优化建议
export function generateSuggestions(): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [
    {
      id: 'sug1',
      moduleId: 'm1',
      week: 3,
      category: 'rhythm',
      priority: 'high',
      title: '建议增加色彩理论实践课时',
      description: '第3周学习行为数据显示，学生在色彩原理相关内容的参与度显著低于平均水平（下降23%）。建议增加1课时实践环节，采用案例教学法。',
      dataEvidence: ['第3周平均参与度降至62分', '色彩原理相关视频完播率仅58%', '课后测验平均分低于目标15分'],
      status: 'accepted',
      teacherDecision: '采纳建议，在第5周增加了色彩搭配实践课，采用名画案例分析法',
      createdAt: '2025-02-20T10:00:00Z',
    },
    {
      id: 'sug2',
      moduleId: 'm2',
      week: 6,
      category: 'task',
      priority: 'high',
      title: '造型练习任务难度需分层设计',
      description: '第6周学习成果数据显示，约30%的学生在造型基础练习中得分低于70分。建议将造型任务分为基础级和提高级，让学生循序渐进。',
      dataEvidence: ['30%学生造型得分低于70分', '课堂互动参与率在第6周降至55%', '同伴互评显示基础薄弱学生占比偏高'],
      status: 'accepted',
      teacherDecision: '采纳建议，设计了分层造型练习任务，基础组侧重几何体写生，提高组侧重人物速写',
      createdAt: '2025-03-20T10:00:00Z',
    },
    {
      id: 'sug3',
      moduleId: 'm2',
      week: 7,
      category: 'evaluation',
      priority: 'medium',
      title: '引入过程性评价替代单一结果评价',
      description: '第7周教师评价数据显示，仅凭期末作品评分无法全面反映学生的学习过程。建议增加过程性评价指标，涵盖草图、修改记录等。',
      dataEvidence: ['过程性数据缺失导致评价偏差率约25%', '学生反馈评分与作品实际质量相关性弱'],
      status: 'modified',
      teacherDecision: '部分采纳，增加了草图提交环节作为过程性评价的一部分，但未完全替代期末评分',
      createdAt: '2025-03-27T10:00:00Z',
    },
    {
      id: 'sug4',
      moduleId: 'm3',
      week: 10,
      category: 'resource',
      priority: 'medium',
      title: '补充风格探索类教学资源',
      description: '第10周学习过程数据显示，学生对风格创新的兴趣高涨（讨论区发帖量增加40%），但现有资源不足以支撑。建议增加风格案例库和视频教程。',
      dataEvidence: ['讨论区发帖量较前两周增长40%', '风格探索相关视频请求量居前', '学生问卷中"希望增加案例"选项占比65%'],
      status: 'accepted',
      teacherDecision: '采纳建议，建立了包含20个艺术家风格案例的资源库，并制作了5个风格分析短视频',
      createdAt: '2025-04-20T10:00:00Z',
    },
    {
      id: 'sug5',
      moduleId: 'm3',
      week: 11,
      category: 'rhythm',
      priority: 'low',
      title: '调整小组协作节奏',
      description: '第11周学习行为数据显示，小组协作项目中部分学生参与度不均衡。建议优化分组策略，设置轮换角色机制。',
      dataEvidence: ['小组项目中3名学生贡献度超过70%', '讨论区活跃学生集中在5人'],
      status: 'rejected',
      teacherDecision: '未采纳，认为当前分组方式合理，将在下学期尝试轮换机制',
      createdAt: '2025-04-27T10:00:00Z',
    },
    {
      id: 'sug6',
      moduleId: 'm4',
      week: 14,
      category: 'task',
      priority: 'high',
      title: '综合创作阶段需增加中期检查点',
      description: '第14周数据显示，综合创作阶段学生普遍感到方向迷茫。建议在创作中期设置2个检查点，帮助学生调整方向。',
      dataEvidence: ['综合创作初期平均参与度仅58分', '学生问卷"不知道下一步做什么"选项占比45%', '教师评价中"方向不明确"提及率30%'],
      status: 'accepted',
      teacherDecision: '采纳建议，在创作阶段设置了草图审查和初稿审查两个中期检查点',
      createdAt: '2025-05-15T10:00:00Z',
    },
    {
      id: 'sug7',
      moduleId: 'm4',
      week: 15,
      category: 'resource',
      priority: 'low',
      title: '策展展示环节可增加虚拟展厅',
      description: '第15周课程反馈数据显示，学生对实体展览形式兴趣一般。建议引入虚拟展厅技术，扩大作品传播范围。',
      dataEvidence: ['展览环节满意度评分仅72分', '线上展厅概念在问卷中获得85%支持率'],
      status: 'pending',
      createdAt: '2025-05-22T10:00:00Z',
    },
  ];
  return suggestions;
}

// 生成诊断告警
export function generateAlerts(): DiagnosticAlert[] {
  return [
    { id: 'a1', week: 3, type: 'low_engagement', severity: 'high', title: '参与度显著下降', description: '第3周整体参与度从第2周的78分降至62分，下降幅度超过20%，需要关注。', moduleId: 'm1' },
    { id: 'a2', week: 6, type: 'knowledge_gap', severity: 'high', title: '造型基础掌握不足', description: '第6周学习成果数据显示，30%学生在造型基础考核中得分低于70分，存在知识缺口。', moduleId: 'm2' },
    { id: 'a3', week: 6, type: 'performance_drop', severity: 'medium', title: '课堂互动率降低', description: '第6-7周课堂互动参与率连续两周下降，从平均85次/周降至55次/周。', moduleId: 'm2' },
    { id: 'a4', week: 10, type: 'anomaly', severity: 'medium', title: '讨论区发帖量异常激增', description: '第10周讨论区发帖量较前两周增长40%，主要围绕"风格探索"话题，学生兴趣高涨。', moduleId: 'm3' },
    { id: 'a5', week: 14, type: 'low_engagement', severity: 'medium', title: '创作阶段迷茫感', description: '第14周综合创作初期，学生平均参与度仅58分，问卷显示45%学生"不确定下一步做什么"。', moduleId: 'm4' },
    { id: 'a6', week: 15, type: 'knowledge_gap', severity: 'low', title: '作品评价标准理解偏差', description: '第15周教师评价中发现部分学生对作品评价标准理解不一致，建议在下学期初强化评价标准讲解。', moduleId: 'm4' },
  ];
}

// 生成数据质量指标
export function getDataQualityMetrics(records: LearningRecord[]): DataQualityMetrics {
  const typeCounts: Record<DataType, number> = { behavior: 0, process: 0, outcome: 0, evaluation: 0, feedback: 0 };
  records.forEach(r => { typeCounts[r.type]++; });

  const totalExpected = students.length * 16 * 3; // 每个学生每周至少3条记录
  const totalActual = records.length;
  const completeness = Math.min(100, Math.floor((totalActual / totalExpected) * 100));

  return {
    completeness,
    timeliness: 85,
    accuracy: 92,
    recordCounts: typeCounts,
  };
}
