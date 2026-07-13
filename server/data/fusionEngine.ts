// ===== 数据融合引擎（增强版：多模态特征融合） =====
import type {
  LearningRecord, CourseState, VitalityScore, DataType,
  MultimodalFeatureVector, ModalityFeature,
  VideoMicroExpression, TextSemanticData, InteractionBehavior,
} from '../../src/types';

// ===================== 传统聚合（向后兼容）=====================

export function aggregateByModuleWeek(
  records: LearningRecord[], moduleId: string, week: number
): { engagement: number; process: number; outcome: number; evaluation: number; feedback: number; count: number } {
  const filtered = records.filter(r => r.moduleId === moduleId && r.week === week);
  const agg = { engagement: 0, process: 0, outcome: 0, evaluation: 0, feedback: 0, count: 0 };
  filtered.forEach(r => {
    agg.count++;
    if (r.type === 'behavior') agg.engagement += r.value;
    else if (r.type === 'process') agg.process += r.value;
    else if (r.type === 'outcome') agg.outcome += r.value;
    else if (r.type === 'evaluation') agg.evaluation += r.value;
    else if (r.type === 'feedback') agg.feedback += r.value;
  });
  const n = filtered.length || 1;
  return {
    engagement: Math.round(agg.engagement / n), process: Math.round(agg.process / n),
    outcome: Math.round(agg.outcome / n), evaluation: Math.round(agg.evaluation / n),
    feedback: Math.round(agg.feedback / n), count: filtered.length,
  };
}

export function computeCourseState(
  records: LearningRecord[], moduleId: string, week: number
): CourseState {
  const agg = aggregateByModuleWeek(records, moduleId, week);
  const weights = { behavior: 0.25, process: 0.3, outcome: 0.25, evaluation: 0.1, feedback: 0.1 };
  const weightedScore = Math.round(
    agg.engagement * weights.behavior + agg.process * weights.process +
    agg.outcome * weights.outcome + agg.evaluation * weights.evaluation + agg.feedback * weights.feedback
  );
  let health: CourseState['overallHealth'] = 'good';
  if (weightedScore >= 85) health = 'excellent';
  else if (weightedScore < 60) health = 'warning';
  else if (weightedScore < 50) health = 'critical';
  const prevAgg = aggregateByModuleWeek(records, moduleId, week - 1);
  const prevScore = Math.round(
    prevAgg.engagement * weights.behavior + prevAgg.process * weights.process +
    prevAgg.outcome * weights.outcome + prevAgg.evaluation * weights.evaluation + prevAgg.feedback * weights.feedback
  );
  const trend: CourseState['trend'] = weightedScore > prevScore + 3 ? 'improving'
    : weightedScore < prevScore - 3 ? 'declining' : 'stable';
  const riskStudents = records
    .filter(r => r.week === week && r.moduleId === moduleId && r.type === 'behavior' && r.value < 60)
    .map(r => r.studentId);
  const masteryScores: number[] = [];
  const objRecords = records.filter(r => r.week === week && r.moduleId === moduleId && (r.type === 'process' || r.type === 'outcome'));
  if (objRecords.length > 0) {
    masteryScores.push(Math.round(objRecords.reduce((sum, r) => sum + r.value, 0) / objRecords.length));
  }
  return { moduleId, moduleName: '', week, engagementScore: agg.engagement, knowledgeMastery: masteryScores,
    riskStudents: [...new Set(riskStudents)].slice(0, 5), overallHealth: health, trend };
}

// ===================== 多模态特征融合算法 =====================

/**
 * 早融合 (Early Fusion) — 在特征层面拼接各模态特征向量，然后统一编码
 * 优点：能捕捉模态间的交互效应
 * 缺点：对模态缺失敏感，需要特征对齐
 */
export function earlyFusion(features: ModalityFeature[]): number {
  // 加权求和 + 非线性激活
  const weightedSum = features.reduce((sum, f) => sum + f.score * f.weight, 0);
  // Sigmoid 激活函数，将结果映射到 0-100
  const sigmoid = 1 / (1 + Math.exp(-0.05 * (weightedSum - 50)));
  return Math.round(sigmoid * 100);
}

/**
 * 晚融合 (Late Fusion) — 各模态独立推理，然后加权投票
 * 优点：对模态缺失鲁棒，可独立优化
 * 缺点：无法捕捉模态间交互
 */
export function lateFusion(features: ModalityFeature[]): number {
  // 各模态独立标准化后加权投票
  const normalized = features.map(f => ({
    ...f,
    normalizedScore: Math.min(100, Math.max(0, f.score)),
  }));
  // 加权投票（考虑模态间的一致性惩罚）
  const scores = normalized.map(f => f.normalizedScore * f.weight);
  const voteScore = scores.reduce((a, b) => a + b, 0);
  // 一致性惩罚：如果某模态与其他模态差异过大，降低总分
  const avgScore = voteScore / normalized.length;
  const variance = normalized.reduce((sum, f) => sum + (f.normalizedScore - avgScore) ** 2, 0) / normalized.length;
  const consistencyPenalty = Math.max(0.7, 1 - Math.sqrt(variance) / 100);
  return Math.round(voteScore * consistencyPenalty);
}

/**
 * 计算综合学习投入度得分 (Engagement Score)
 * 结合早融合和晚融合的结果，取加权平均
 */
export function computeEngagementScore(
  videoExpr: VideoMicroExpression | null,
  textData: TextSemanticData[] | null,
  interactionData: InteractionBehavior[] | null,
  traditionalData: LearningRecord[] | null
): number {
  const modalityFeatures: ModalityFeature[] = [];

  // 1. 视频微表情模态
  if (videoExpr) {
    const focusedRate = videoExpr.frames.filter(f => f.emotion === 'focused').length / videoExpr.frames.length;
    const distractionRate = videoExpr.aggregated.distractionRate / 100;
    const videoScore = Math.round((focusedRate * 0.6 + (1 - distractionRate) * 0.4) * 100);
    modalityFeatures.push({
      modality: 'video_emotion',
      score: Math.min(100, Math.max(0, videoScore)),
      weight: 0.3,
      sampleCount: videoExpr.frames.length,
      trend: focusedRate > 0.5 ? 'rising' : 'falling',
    });
  }

  // 2. 文本语义模态
  if (textData && textData.length > 0) {
    const avgSentiment = textData.reduce((sum, t) => sum + t.sentimentScore, 0) / textData.length;
    const textScore = Math.round(((avgSentiment + 1) / 2) * 100); // 归一化到 0-100
    modalityFeatures.push({
      modality: 'text_semantic',
      score: Math.min(100, Math.max(0, textScore)),
      weight: 0.25,
      sampleCount: textData.length,
      trend: avgSentiment > 0 ? 'rising' : avgSentiment < -0.1 ? 'falling' : 'stable',
    });
  }

  // 3. 交互行为模态
  if (interactionData && interactionData.length > 0) {
    const avgDuration = interactionData.reduce((sum, i) => sum + i.duration, 0) / interactionData.length;
    const clickSubmitRatio = interactionData.filter(i => i.actionType === 'click' || i.actionType === 'submit').length / interactionData.length;
    const interactionScore = Math.min(100, Math.round((avgDuration / 10) * 40 + clickSubmitRatio * 60));
    modalityFeatures.push({
      modality: 'interaction_behavior',
      score: Math.min(100, Math.max(0, interactionScore)),
      weight: 0.25,
      sampleCount: interactionData.length,
      trend: avgDuration > 30 ? 'rising' : avgDuration < 10 ? 'falling' : 'stable',
    });
  }

  // 4. 传统数据模态
  if (traditionalData && traditionalData.length > 0) {
    const avgScore = Math.round(traditionalData.reduce((sum, r) => sum + r.value, 0) / traditionalData.length);
    modalityFeatures.push({
      modality: 'traditional_data',
      score: Math.min(100, Math.max(0, avgScore)),
      weight: 0.2,
      sampleCount: traditionalData.length,
      trend: 'stable',
    });
  }

  if (modalityFeatures.length === 0) return 50;

  // 早融合得分
  const earlyScore = earlyFusion(modalityFeatures);
  // 晚融合得分
  const lateScore = lateFusion(modalityFeatures);
  // 综合得分：早融合占 40%，晚融合占 60%（晚融合更稳健）
  const engagementScore = Math.round(earlyScore * 0.4 + lateScore * 0.6);

  return engagementScore;
}

// ===================== 生命力评分 =====================

export function computeVitalityScore(records: LearningRecord[], week: number, prevScore?: number): VitalityScore {
  const weekRecords = records.filter(r => r.week === week);
  const behaviorAvg = weekRecords.filter(r => r.type === 'behavior').reduce((s, r) => s + r.value, 0) / (weekRecords.filter(r => r.type === 'behavior').length || 1);
  const feedbackAvg = weekRecords.filter(r => r.type === 'feedback').reduce((s, r) => s + r.value, 0) / (weekRecords.filter(r => r.type === 'feedback').length || 1);
  const classroomVitality = Math.min(100, Math.round(behaviorAvg * 0.7 + feedbackAvg * 0.3));
  const processAvg = weekRecords.filter(r => r.type === 'process').reduce((s, r) => s + r.value, 0) / (weekRecords.filter(r => r.type === 'process').length || 1);
  const outcomeAvg = weekRecords.filter(r => r.type === 'outcome').reduce((s, r) => s + r.value, 0) / (weekRecords.filter(r => r.type === 'outcome').length || 1);
  const creativity = Math.min(100, Math.round(processAvg * 0.4 + outcomeAvg * 0.6));
  const evalAvg = weekRecords.filter(r => r.type === 'evaluation').reduce((s, r) => s + r.value, 0) / (weekRecords.filter(r => r.type === 'evaluation').length || 1);
  const learningPerception = Math.min(100, Math.round(evalAvg * 0.6 + feedbackAvg * 0.4));
  const resourceExtension = Math.min(100, Math.round(behaviorAvg * 0.8 + Math.random() * 10));
  const prevBehavior = records.filter(r => r.week === week - 1 && r.type === 'behavior').reduce((s, r) => s + r.value, 0) / (records.filter(r => r.week === week - 1 && r.type === 'behavior').length || 1);
  const courseEvolution = Math.min(100, Math.max(30, Math.round(((behaviorAvg - prevBehavior) * 2 + 70))));
  const overall = Math.round(classroomVitality * 0.25 + creativity * 0.2 + learningPerception * 0.2 + resourceExtension * 0.15 + courseEvolution * 0.2);
  return { week, classroomVitality, creativity, learningPerception, resourceExtension, courseEvolution, overall };
}

// ===================== 周聚合 =====================

export function getWeeklyAggregates(records: LearningRecord[]) {
  const weeks = Array.from({ length: 16 }, (_, i) => i + 1);
  return weeks.map(week => {
    const weekRecords = records.filter(r => r.week === week);
    const typeCounts: Record<DataType, number> = { behavior: 0, process: 0, outcome: 0, evaluation: 0, feedback: 0 };
    weekRecords.forEach(r => { typeCounts[r.type]++; });
    const typeAvgs: Record<DataType, number> = {} as Record<DataType, number>;
    for (const type of Object.keys(typeCounts) as DataType[]) {
      const typeRecords = weekRecords.filter(r => r.type === type);
      typeAvgs[type] = typeRecords.length > 0 ? Math.round(typeRecords.reduce((s, r) => s + r.value, 0) / typeRecords.length) : 0;
    }
    return { week, counts: typeCounts, averages: typeAvgs };
  });
}
