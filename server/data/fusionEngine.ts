// ===== 数据融合引擎 =====
import type { LearningRecord, CourseState, VitalityScore, DataType } from '../../src/types';

// 按模块和周聚合数据
export function aggregateByModuleWeek(
  records: LearningRecord[],
  moduleId: string,
  week: number
): { engagement: number; process: number; outcome: number; evaluation: number; feedback: number; count: number } {
  const filtered = records.filter(r => r.moduleId === moduleId && r.week === week);

  const aggregates = { engagement: 0, process: 0, outcome: 0, evaluation: 0, feedback: 0, count: 0 };

  filtered.forEach(r => {
    aggregates.count++;
    if (r.type === 'behavior') aggregates.engagement += r.value;
    else if (r.type === 'process') aggregates.process += r.value;
    else if (r.type === 'outcome') aggregates.outcome += r.value;
    else if (r.type === 'evaluation') aggregates.evaluation += r.value;
    else if (r.type === 'feedback') aggregates.feedback += r.value;
  });

  // 取平均值
  const n = filtered.length || 1;
  return {
    engagement: Math.round(aggregates.engagement / n),
    process: Math.round(aggregates.process / n),
    outcome: Math.round(aggregates.outcome / n),
    evaluation: Math.round(aggregates.evaluation / n),
    feedback: Math.round(aggregates.feedback / n),
    count: filtered.length,
  };
}

// 计算课程状态
export function computeCourseState(
  records: LearningRecord[],
  moduleId: string,
  week: number
): CourseState {
  const agg = aggregateByModuleWeek(records, moduleId, week);

  // 多维度加权融合
  const weights = { behavior: 0.25, process: 0.3, outcome: 0.25, evaluation: 0.1, feedback: 0.1 };
  const weightedScore = Math.round(
    agg.engagement * weights.behavior +
    agg.process * weights.process +
    agg.outcome * weights.outcome +
    agg.evaluation * weights.evaluation +
    agg.feedback * weights.feedback
  );

  // 健康度判断
  let health: CourseState['overallHealth'] = 'good';
  if (weightedScore >= 85) health = 'excellent';
  else if (weightedScore < 60) health = 'warning';
  else if (weightedScore < 50) health = 'critical';

  // 趋势判断（对比上一周）
  const prevAgg = aggregateByModuleWeek(records, moduleId, week - 1);
  const prevScore = Math.round(
    prevAgg.engagement * weights.behavior +
    prevAgg.process * weights.process +
    prevAgg.outcome * weights.outcome +
    prevAgg.evaluation * weights.evaluation +
    prevAgg.feedback * weights.feedback
  );
  const trend: CourseState['trend'] = weightedScore > prevScore + 3 ? 'improving'
    : weightedScore < prevScore - 3 ? 'declining'
    : 'stable';

  // 风险学生（参与度低于60分的）
  const riskStudents = records
    .filter(r => r.week === week && r.moduleId === moduleId && r.type === 'behavior' && r.value < 60)
    .map(r => r.studentId);

  // 知识掌握度（基于process和outcome数据）
  const masteryScores: number[] = [];
  const objRecords = records.filter(r => r.week === week && r.moduleId === moduleId && (r.type === 'process' || r.type === 'outcome'));
  if (objRecords.length > 0) {
    const avg = Math.round(objRecords.reduce((sum, r) => sum + r.value, 0) / objRecords.length);
    masteryScores.push(avg);
  }

  return {
    moduleId,
    moduleName: '', // 由调用方填充
    week,
    engagementScore: agg.engagement,
    knowledgeMastery: masteryScores,
    riskStudents: [...new Set(riskStudents)].slice(0, 5),
    overallHealth: health,
    trend,
  };
}

// 计算生命力评分
export function computeVitalityScore(
  records: LearningRecord[],
  week: number,
  prevScore?: number
): VitalityScore {
  const weekRecords = records.filter(r => r.week === week);

  // 课堂活力：基于行为数据和反馈数据
  const behaviorAvg = weekRecords.filter(r => r.type === 'behavior').reduce((s, r) => s + r.value, 0) / (weekRecords.filter(r => r.type === 'behavior').length || 1);
  const feedbackAvg = weekRecords.filter(r => r.type === 'feedback').reduce((s, r) => s + r.value, 0) / (weekRecords.filter(r => r.type === 'feedback').length || 1);
  const classroomVitality = Math.min(100, Math.round((behaviorAvg * 0.7 + feedbackAvg * 0.3)));

  // 创造力：基于过程数据和成果数据
  const processAvg = weekRecords.filter(r => r.type === 'process').reduce((s, r) => s + r.value, 0) / (weekRecords.filter(r => r.type === 'process').length || 1);
  const outcomeAvg = weekRecords.filter(r => r.type === 'outcome').reduce((s, r) => s + r.value, 0) / (weekRecords.filter(r => r.type === 'outcome').length || 1);
  const creativity = Math.min(100, Math.round(processAvg * 0.4 + outcomeAvg * 0.6));

  // 学习感知：基于教师评价和反馈
  const evalAvg = weekRecords.filter(r => r.type === 'evaluation').reduce((s, r) => s + r.value, 0) / (weekRecords.filter(r => r.type === 'evaluation').length || 1);
  const learningPerception = Math.min(100, Math.round(evalAvg * 0.6 + feedbackAvg * 0.4));

  // 资源延续：基于行为数据（资源使用率）
  const resourceExtension = Math.min(100, Math.round(behaviorAvg * 0.8 + Math.random() * 10));

  // 课程进化：综合趋势
  const prevBehavior = records.filter(r => r.week === week - 1 && r.type === 'behavior').reduce((s, r) => s + r.value, 0) / (records.filter(r => r.week === week - 1 && r.type === 'behavior').length || 1);
  const courseEvolution = Math.min(100, Math.max(30, Math.round(((behaviorAvg - prevBehavior) * 2 + 70))));

  const overall = Math.round(
    classroomVitality * 0.25 +
    creativity * 0.2 +
    learningPerception * 0.2 +
    resourceExtension * 0.15 +
    courseEvolution * 0.2
  );

  return {
    week,
    classroomVitality,
    creativity,
    learningPerception,
    resourceExtension,
    courseEvolution,
    overall,
  };
}

// 按周获取聚合数据
export function getWeeklyAggregates(records: LearningRecord[]) {
  const weeks = Array.from({ length: 16 }, (_, i) => i + 1);
  return weeks.map(week => {
    const weekRecords = records.filter(r => r.week === week);
    const typeCounts: Record<DataType, number> = { behavior: 0, process: 0, outcome: 0, evaluation: 0, feedback: 0 };
    weekRecords.forEach(r => { typeCounts[r.type]++; });

    const typeAvgs: Record<DataType, number> = {} as Record<DataType, number>;
    for (const type of Object.keys(typeCounts) as DataType[]) {
      const typeRecords = weekRecords.filter(r => r.type === type);
      typeAvgs[type] = typeRecords.length > 0
        ? Math.round(typeRecords.reduce((s, r) => s + r.value, 0) / typeRecords.length)
        : 0;
    }

    return { week, counts: typeCounts, averages: typeAvgs };
  });
}
