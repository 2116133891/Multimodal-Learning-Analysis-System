// ===== 服务器入口 =====
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
  courseInfo, students, getAllLearningRecords,
  getAllVideoMicroExpressions, getAllTextSemantics, getAllInteractionBehaviors,
  getAllMultimodalFeatures, getAllStudentProfiles, getAllInterventions,
  generateVitalityScores, generateSuggestions, generateAlerts,
  getDataQualityMetrics,
} from './data/mockData.js';
import {
  computeCourseState, computeVitalityScore, getWeeklyAggregates,
  aggregateByModuleWeek, computeEngagementScore,
} from './data/fusionEngine.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/course', (_req, res) => res.json(courseInfo));
app.get('/api/students', (_req, res) => res.json(students));

app.get('/api/records', (req, res) => {
  const { type, week, moduleId, studentId } = req.query;
  let records = getAllLearningRecords();
  if (type) records = records.filter(r => r.type === type);
  if (week) records = records.filter(r => r.week === Number(week));
  if (moduleId) records = records.filter(r => r.moduleId === moduleId);
  if (studentId) records = records.filter(r => r.studentId === studentId);
  res.json(records);
});

app.get('/api/data-quality', (_req, res) => res.json(getDataQualityMetrics(getAllLearningRecords())));
app.get('/api/weekly-aggregates', (_req, res) => res.json(getWeeklyAggregates(getAllLearningRecords())));

app.get('/api/course-state/:moduleId/:week', (req, res) => {
  const { moduleId, week } = req.params;
  const state = computeCourseState(getAllLearningRecords(), moduleId, Number(week));
  const module = courseInfo.modules.find((m: any) => m.id === moduleId);
  if (module) state.moduleName = module.name;
  res.json(state);
});

app.get('/api/vitality', (_req, res) => res.json(generateVitalityScores()));
app.get('/api/vitality/week/:week', (req, res) => {
  const week = Number(req.params.week);
  const records = getAllLearningRecords();
  const prevWeek = week > 1 ? week - 1 : 1;
  const prevRecords = records.filter(r => r.week === prevWeek);
  const prevScore = prevRecords.length > 0 ? computeVitalityScore(prevRecords, prevWeek) : undefined as any;
  res.json(computeVitalityScore(records, week, prevScore));
});

// ===== 多模态数据 API =====

// 视频微表情数据
app.get('/api/multimodal/video', (req, res) => {
  const { studentId, week } = req.query;
  let data = getAllVideoMicroExpressions();
  if (studentId) data = data.filter(d => d.studentId === studentId);
  if (week) data = data.filter(d => d.week === Number(week));
  res.json(data);
});

// 文本语义数据
app.get('/api/multimodal/text', (req, res) => {
  const { studentId, week, moduleId } = req.query;
  let data = getAllTextSemantics();
  if (studentId) data = data.filter(d => d.studentId === studentId);
  if (week) data = data.filter(d => d.week === Number(week));
  if (moduleId) data = data.filter(d => d.moduleId === moduleId);
  res.json(data);
});

// 交互行为数据
app.get('/api/multimodal/interaction', (req, res) => {
  const { studentId, week, actionType } = req.query;
  let data = getAllInteractionBehaviors();
  if (studentId) data = data.filter(d => d.studentId === studentId);
  if (week) data = data.filter(d => d.week === Number(week));
  if (actionType) data = data.filter(d => d.actionType === actionType);
  res.json(data);
});

// 多模态融合特征
app.get('/api/multimodal/features', (req, res) => {
  try {
    const { studentId, week } = req.query;
    let data = getAllMultimodalFeatures();
    if (studentId) data = data.filter(d => d.studentId === studentId);
    if (week) data = data.filter(d => d.week === Number(week));
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// 单学生综合投入度
app.get('/api/engagement/:studentId/:week', (req, res) => {
  const { studentId, week } = req.params;
  const w = Number(week);
  const records = getAllLearningRecords();
  const videoData = getAllVideoMicroExpressions().filter(d => d.studentId === studentId && d.week === w);
  const textData = getAllTextSemantics().filter(d => d.studentId === studentId && d.week === w);
  const interactionData = getAllInteractionBehaviors().filter(d => d.studentId === studentId && d.week === w);
  const traditionalData = records.filter(r => r.studentId === studentId && r.week === w);
  const engagementScore = computeEngagementScore(
    videoData.length > 0 ? videoData[0] : null,
    textData.length > 0 ? textData : null,
    interactionData.length > 0 ? interactionData : null,
    traditionalData.length > 0 ? traditionalData : null
  );
  res.json({ studentId, week: w, engagementScore });
});

// AI 优化建议
app.get('/api/suggestions', (_req, res) => res.json(generateSuggestions()));
app.post('/api/suggestions/:id/decision', (req, res) => {
  const { id } = req.params;
  const { status, teacherDecision, rejectReason, feedbackToAI } = req.body;
  if (!['accepted', 'rejected', 'modified'].includes(status)) {
    return res.status(400).json({ error: '无效的状态值' });
  }
  res.json({ success: true, suggestionId: id, status, teacherDecision, rejectReason, feedbackToAI, message: '决策已记录' });
});

app.get('/api/alerts', (_req, res) => res.json(generateAlerts()));
app.get('/api/module/:moduleId/week/:week', (req, res) => {
  const { moduleId, week } = req.params;
  res.json(aggregateByModuleWeek(getAllLearningRecords(), moduleId, Number(week)));
});

// 学生多模态画像
app.get('/api/student-profile/:studentId', (req, res) => {
  const { studentId } = req.params;
  const profiles = getAllStudentProfiles();
  const profile = profiles.find(p => p.studentId === studentId);
  if (profile) res.json(profile);
  else res.status(404).json({ error: '学生不存在' });
});

// 干预有效性评估
app.get('/api/interventions', (_req, res) => res.json(getAllInterventions()));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

const staticPath = path.join(__dirname, '../dist');
app.use(express.static(staticPath));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => { console.log(`服务器运行在 http://localhost:${PORT}`); });
